// Renderiza la escena 2 fotograma a fotograma (Chromium headless + SwiftShader).
// Requiere servir la raíz del repo:  python3 -m http.server 4700
// Uso: node produccion/escena-2/secuencia.mjs <ancho> <alto> <dir-salida> [fotogramas=150]
import { chromium } from "playwright";
import fs from "node:fs";
const [w, h] = process.argv.slice(2, 4).map(Number);
const dir = process.argv[4];
const n = Number(process.argv[5] || 150);
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const p = await b.newPage({ viewport: { width: w, height: h } });
p.on("pageerror", (e) => console.error("ERR", e.message));
await p.goto(`http://localhost:4700/produccion/escena-2/render.html?w=${w}&h=${h}`);
await p.waitForFunction(() => window.listo, null, { timeout: 120000 });
const lienzo = p.locator("canvas");
for (let i = 0; i < n; i++) {
  await p.evaluate((f) => window.fotograma(f), i / (n - 1));
  await lienzo.screenshot({ path: `${dir}/f${String(i).padStart(4, "0")}.png` });
  if (i % 25 === 0) console.log(`${w}x${h} ${i}/${n}`);
}
await b.close();
