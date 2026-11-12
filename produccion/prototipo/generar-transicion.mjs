#!/usr/bin/env node
/**
 * PROTOTIPO. Genera el clip provisional del momento "transición hacia el
 * alquiler" sin ninguna API: renderiza escena-transicion.html fotograma a
 * fotograma con Chrome local (playwright-core) y lo codifica con ffmpeg usando
 * los mismos parámetros que scripts/encode.sh de scroll-craft (GOP denso para
 * scrub, sin audio).
 *
 * Los resultados ya están en public/prototipo/, así que NO hace falta ejecutar
 * esto para arrancar la web. Solo sirve para regenerarlos.
 *
 * Requisitos: Node 20+, playwright-core (ya en devDependencies), Google Chrome
 * instalado y ffmpeg completo en el PATH.
 *
 *   node produccion/prototipo/generar-transicion.mjs
 *   CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" node ...
 */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(ROOT, "public/prototipo");
const FRAMES = path.join(HERE, "frames");
const FPS = 24;
const SECONDS = 4;
const N = FPS * SECONDS;

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const executablePath = chromeCandidates.find((p) => fs.existsSync(p));

const formats = [
  { name: "desktop", width: 1920, height: 1080, scale: "scale=-2:1080", gop: 8, crf: 20 },
  { name: "mobile", width: 720, height: 1280, scale: "scale=720:-2", gop: 4, crf: 24 },
];

const browser = await chromium.launch(executablePath ? { executablePath } : {});
fs.mkdirSync(OUT, { recursive: true });

for (const f of formats) {
  const dir = path.join(FRAMES, f.name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: f.width, height: f.height } });
  await page.goto(pathToFileURL(path.join(HERE, "escena-transicion.html")).href);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    await page.evaluate((v) => window.render(v), t);
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, "0")}.png`) });
  }
  await page.close();

  const suffix = f.name === "mobile" ? "-m" : "";
  const mp4 = path.join(OUT, `prototipo-alquiler${suffix}.mp4`);
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-framerate", String(FPS), "-i", path.join(dir, "f%04d.png"),
    "-an", "-vf", `${f.scale}:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", String(f.crf),
    "-g", String(f.gop), "-keyint_min", String(f.gop), "-sc_threshold", "0",
    "-movflags", "+faststart", mp4,
  ], { stdio: "inherit" });

  // Póster: primer fotograma, para que no haya salto cuando el vídeo pinta.
  const poster = path.join(OUT, `prototipo-alquiler${suffix}-poster.webp`);
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", path.join(dir, "f0000.png"), "-c:v", "libwebp", "-quality", "80", poster,
  ], { stdio: "inherit" });
  // Fotograma final, usado como imagen fija en modo sin animación.
  const last = path.join(OUT, `prototipo-alquiler${suffix}-final.webp`);
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", path.join(dir, `f${String(N - 1).padStart(4, "0")}.png`), "-c:v", "libwebp", "-quality", "80", last,
  ], { stdio: "inherit" });
  console.log(`${f.name}: ${mp4}`);
}
await browser.close();
