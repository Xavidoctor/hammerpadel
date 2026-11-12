/**
 * Capturas de verificación del prototipo (escritorio y móvil).
 * Uso: con el servidor arrancado (npm run build && npm start)
 *   node scripts/screenshots.mjs [url] [carpeta]
 * Requiere los navegadores de Playwright: npx playwright install chromium
 */
import { chromium, devices } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3000";
const OUT = process.argv[3] ?? "lab/capturas";
fs.mkdirSync(OUT, { recursive: true });

const perfiles = [
  { nombre: "escritorio", ctx: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
  { nombre: "movil", ctx: { ...devices["iPhone 13"], deviceScaleFactor: 2 } },
];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
for (const p of perfiles) {
  const ctx = await browser.newContext(p.ctx);
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.classList.contains("sc-ready"), null, { timeout: 8000 }).catch(() => {});
  // Recorre la landing en posiciones fijas del documento.
  const alto = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const marcas = [0, 0.06, 0.12, 0.2, 0.28, 0.36, 0.48, 0.6, 0.7, 0.8, 0.9, 1];
  for (const [i, m] of marcas.entries()) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(alto * m));
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${p.nombre}-inicio-${String(i).padStart(2, "0")}.png`) });
  }
  for (const r of ["/comprar", "/alquiler", "/recogebolas", "/contacto"]) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(OUT, `${p.nombre}${r.replace("/", "-")}.png`), fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log("Capturas en", OUT);
