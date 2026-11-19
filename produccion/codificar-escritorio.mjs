/**
 * Codifica los vídeos de ESCRITORIO de una escena a partir de sus fotogramas PNG.
 * Gratis y local: solo necesita ffmpeg en el PATH (Windows: winget install Gyan.FFmpeg).
 *
 * Uso:
 *   node produccion/codificar-escritorio.mjs <base-salida> <dir-16x9-2560x1440> <dir-21x9-3440x1440>
 * Ejemplo:
 *   node produccion/codificar-escritorio.mjs public/medios/entrenamiento/maquina-3d render/escena-2-2560x1440 render/escena-2-3440x1440
 *
 * Genera, junto a <base-salida>:
 *   <base>.mp4        16:9 1920x1080  (por defecto)
 *   <base>-2k.mp4     16:9 2560x1440  (pantallas grandes o de alta densidad)
 *   <base>-uwhd.mp4   21:9 2560x1080  (ultrapanorámicas)
 *   <base>-uw.mp4     21:9 3440x1440  (ultrapanorámicas grandes)
 *   poster.webp / poster-uw.webp (primer fotograma) en la misma carpeta, salvo POSTER=no
 * y, si los fotogramas traen etiquetas-*.json (escena 3), etiquetas.json y etiquetas-uw.json.
 *
 * Codificación pensada para el control por scroll: fotograma clave cada 15 (medio segundo), sin fotogramas B
 * (saltos limpios hacia delante y hacia atrás), yuv420p y faststart. La versión móvil (-m.mp4)
 * no se toca.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [base, dir169, dirUw] = process.argv.slice(2);
if (!base || !dir169 || !dirUw) {
  console.error("Uso: node produccion/codificar-escritorio.mjs <base-salida> <dir-16x9> <dir-21x9>");
  process.exit(1);
}
const FPS = process.env.FPS ?? "30";
// CRF_EXTRA sube la compresión de una escena con mucho detalle fino (la escena 2 usa CRF_EXTRA=2).
const EXTRA = Number(process.env.CRF_EXTRA ?? 0);
const ff = (...a) => execFileSync(process.env.FFMPEG ?? "ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });

const variantes = [
  { suf: "", dir: dir169, w: 1920, h: 1080, crf: 26 },
  { suf: "-2k", dir: dir169, w: 2560, h: 1440, crf: 28 },
  { suf: "-uwhd", dir: dirUw, w: 2560, h: 1080, crf: 27 },
  { suf: "-uw", dir: dirUw, w: 3440, h: 1440, crf: 29 },
];
for (const v of variantes) {
  const out = `${base}${v.suf}.mp4`;
  ff("-framerate", FPS, "-i", path.join(v.dir, "f%04d.png"),
    "-vf", `scale=${v.w}:${v.h}:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", String(v.crf + EXTRA), "-profile:v", "high",
    "-g", "15", "-keyint_min", "15", "-sc_threshold", "0", "-bf", "0",
    "-movflags", "+faststart", "-an", out);
  console.log(out, (fs.statSync(out).size / 1e6).toFixed(1), "MB");
}

const carpeta = path.dirname(base);
const pref = process.env.POSTER_NOMBRE ?? "poster";
if (process.env.POSTER !== "no") {
  ff("-i", path.join(dir169, "f0000.png"), "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libwebp", "-quality", "82", path.join(carpeta, `${pref}.webp`));
  ff("-i", path.join(dirUw, "f0000.png"), "-vf", "scale=2560:1080:flags=lanczos", "-c:v", "libwebp", "-quality", "82", path.join(carpeta, `${pref}-uw.webp`));
}

// Escena 3: une los trozos de etiquetas (uno por proceso de render) en un solo archivo compacto.
for (const [dir, nombre, aspecto] of [[dir169, "etiquetas.json", 16 / 9], [dirUw, "etiquetas-uw.json", 43 / 18]]) {
  const trozos = fs.readdirSync(dir).filter((f) => /^etiquetas-\d+\.json$/.test(f));
  if (!trozos.length) continue;
  let meta = null, n = 0; const datos = {};
  for (const t of trozos) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, t), "utf8"));
    meta = j.meta ?? meta; n = j.n; Object.assign(datos, j.datos);
  }
  const ult = Math.max(...Object.keys(datos).map(Number));
  const f = [];
  for (let i = 0; i <= ult; i++) f.push(datos[i] ? [...datos[i].pueblos, datos[i].mar] : []);
  fs.writeFileSync(path.join(carpeta, nombre), JSON.stringify({
    fps: Number(FPS), n, aspecto: Number(aspecto.toFixed(4)),
    nombres: meta.map((m) => m.nombre), lados: meta.map((m) => m.lado), f,
  }));
  console.log(path.join(carpeta, nombre), f.length, "fotogramas con nombres");
}
