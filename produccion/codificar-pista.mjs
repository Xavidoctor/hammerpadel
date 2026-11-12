#!/usr/bin/env node
/**
 * Prepara la foto y/o el vídeo reales de la escena 1 para la web.
 * Gratis y local: solo necesita ffmpeg en el PATH (Windows: winget install Gyan.FFmpeg).
 *
 *   node produccion/codificar-pista.mjs --foto pista.jpg [--foto-movil pista-vertical.jpg]
 *   node produccion/codificar-pista.mjs --video pista-16x9.mp4 --video-movil pista-9x16.mp4
 *
 * Salida en public/medios/pista/:
 *   pista.webp / pista-m.webp   foto o primer fotograma (póster y LCP)
 *   pista.mp4 / pista-m.mp4     vídeo codificado para scrub (GOP denso, sin audio)
 * Los parámetros son los de scripts/encode.sh de Scroll Craft.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/medios/pista");
fs.mkdirSync(OUT, { recursive: true });

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
const ff = (...a) => execFileSync(process.env.FFMPEG ?? "ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });

function video(entrada, salida, movil) {
  ff("-i", entrada, "-an",
    "-vf", movil ? "scale=720:-2:flags=lanczos,unsharp=3:3:0.4" : "scale=-2:1080:flags=lanczos,unsharp=3:3:0.4",
    "-c:v", "libx264", "-preset", "slow", "-crf", movil ? "24" : "20",
    "-g", movil ? "4" : "8", "-keyint_min", movil ? "4" : "8", "-sc_threshold", "0",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(OUT, salida));
}
function foto(entrada, salida, movil, desdeVideo = false) {
  ff(...(desdeVideo ? ["-i", entrada, "-frames:v", "1"] : ["-i", entrada]),
    "-vf", movil ? "scale=1080:-2:flags=lanczos" : "scale=-2:1080:flags=lanczos",
    "-c:v", "libwebp", "-quality", "82", path.join(OUT, salida));
}

if (args.foto) foto(args.foto, "pista.webp", false);
if (args["foto-movil"]) foto(args["foto-movil"], "pista-m.webp", true);
if (args.video) {
  video(args.video, "pista.mp4", false);
  if (!args.foto) foto(args.video, "pista.webp", false, true);
}
if (args["video-movil"]) {
  video(args["video-movil"], "pista-m.mp4", true);
  if (!args["foto-movil"]) foto(args["video-movil"], "pista-m.webp", true, true);
}
for (const f of fs.readdirSync(OUT)) console.log(f, Math.round(fs.statSync(path.join(OUT, f)).size / 1024), "KB");
