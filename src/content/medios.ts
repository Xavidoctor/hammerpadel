import fs from "node:fs";
import path from "node:path";

/**
 * Medios reales de la escena 1 (La pista). Basta con dejar los archivos en
 * public/medios/pista/ (los genera produccion/codificar-pista.mjs) y la escena
 * los usa automáticamente al compilar:
 *   - solo foto  -> la foto con el efecto de encendido y avance en CSS
 *   - foto+vídeo -> el vídeo se controla con el scroll (Scroll Craft scrub)
 *   - nada       -> pista esquemática SVG provisional
 */
const DIR = path.join(process.cwd(), "public", "medios", "pista");
const existe = (f: string) => fs.existsSync(path.join(DIR, f));
const url = (f: string) => (existe(f) ? `/medios/pista/${f}` : null);

export function mediosPista() {
  return {
    foto: url("pista.webp"),
    fotoMovil: url("pista-m.webp") ?? url("pista.webp"),
    video: url("pista.mp4"),
    videoMovil: url("pista-m.mp4"),
  };
}
