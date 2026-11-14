import fs from "node:fs";
import path from "node:path";

/**
 * Medios reales de la escena 1 (La pista). Basta con dejar los archivos en
 * public/medios/pista/ (los genera produccion/codificar-pista.mjs) y la escena
 * los usa automáticamente al compilar:
 *   - solo foto  -> encendido de focos y acercamiento tipo dron en CSS sobre la foto
 *   - foto+vídeo -> el vídeo se controla con el scroll (Scroll Craft scrub)
 *   - nada       -> pista esquemática SVG provisional
 */
const DIR = path.join(process.cwd(), "public", "medios", "pista");
const existe = (f: string) => fs.existsSync(path.join(DIR, f));
const url = (f: string) => (existe(f) ? `/medios/pista/${f}` : null);

export function mediosPista() {
  return {
    foto: url("pista.webp"),
    /** Las fotos actuales ya muestran la máquina: no se superpone el hueco de producto. */
    fotoIncluyeMaquina: existe("pista.webp"),
    /** Capas de luz (una por pareja de focos, de fondo a primer plano), calculadas
     *  a partir de la propia foto apagada con produccion/iluminar-pista.py. */
    luces: [0, 1, 2].map((n) => url(`luz-${n}.webp`)).filter((u): u is string => u !== null),
    fotoMovil: url("pista-m.webp") ?? url("pista.webp"),
    video: url("pista.mp4"),
    videoMovil: url("pista-m.mp4"),
  };
}
