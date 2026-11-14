// Renderiza la escena 2 fotograma a fotograma (Chromium headless + SwiftShader).
// Requiere servir la raíz del repo:  python3 -m http.server 4700
// Uso: node produccion/escena-2/secuencia.mjs <ancho> <alto> <dir-salida> [fotogramas=360] [desde=0] [hasta=fotogramas]
// (desde/hasta permiten repartir el render entre varios procesos)
import { chromium } from "playwright";
import fs from "node:fs";
const [w, h] = process.argv.slice(2, 4).map(Number);
const dir = process.argv[4];
const n = Number(process.argv[5] || 360);
const desde = Number(process.argv[6] || 0), hasta = Number(process.argv[7] || n);
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: w, height: h } });
p.on("pageerror", (e) => console.error("ERR", e.message));
const escena = process.env.ESCENA || "escena-2"; // ESCENA=escena-3 para el alquiler
await p.goto(`http://localhost:4700/produccion/${escena}/render.html?w=${w}&h=${h}`);
await p.waitForFunction(() => window.listo, null, { timeout: 120000 });
const lienzo = p.locator("canvas");
for (let i = desde; i < hasta; i++) {
  await p.evaluate((f) => window.fotograma(f), i / (n - 1));
  await lienzo.screenshot({ path: `${dir}/f${String(i).padStart(4, "0")}.png` });
  if ((i - desde) % 25 === 0) console.log(`${w}x${h} ${i}/${n}`);
}
await b.close();
