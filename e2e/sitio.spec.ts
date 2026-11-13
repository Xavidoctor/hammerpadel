import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGINAS = ["/", "/comprar", "/recogebolas", "/alquiler", "/como-funciona", "/entrenamientos", "/clubes", "/soporte", "/contacto", "/legal"];

test.describe("páginas", () => {
  for (const ruta of PAGINAS) {
    test(`${ruta} carga, tiene un h1 y no tiene fallos graves de accesibilidad`, async ({ page }) => {
      const errores: string[] = [];
      page.on("pageerror", (e) => errores.push(e.message));
      page.on("console", (m) => m.type() === "error" && errores.push(m.text()));
      const res = await page.goto(ruta);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const graves = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
      expect(errores).toEqual([]);
    });
  }
});

test.describe("precios confirmados", () => {
  test("los precios aparecen como texto HTML", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).toContain("2.300 €");
    expect(html).toContain("85 €");
    expect(html).toContain("20 €");
    for (const l of ["Dénia", "Ondara", "La Xara", "Pedreguer"]) expect(html).toContain(l);
  });
});

test.describe("la landing nunca bloquea la compra", () => {
  test("sin JavaScript se ven el titular y los CTA", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const comprar = page.getByRole("link", { name: /Comprar máquina/ });
    await expect(comprar).toBeVisible();
    expect(await comprar.evaluate((el) => getComputedStyle(el.closest("[data-sc-cue]")!).opacity)).toBe("1");
    await expect(page.getByRole("link", { name: "Reservar entrenamiento" })).toBeVisible();
    await ctx.close();
  });

  test("con movimiento reducido el contenido sigue accesible", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Comprar máquina/ })).toBeVisible();
    // El clip de alquiler no se descarga con movimiento reducido.
    const pidioVideo = await page.evaluate(() => performance.getEntriesByType("resource").some((r) => r.name.endsWith(".mp4")));
    expect(pidioVideo).toBe(false);
    await ctx.close();
  });

  test("el motor Scroll Craft se monta y ningún vídeo bloquea la carga inicial", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.documentElement.classList.contains("sc-ready"));
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const mp4 = performance.getEntriesByType("resource").filter((e) => e.name.endsWith(".mp4"));
      return { load: nav.loadEventStart, inicios: mp4.map((e) => e.startTime) };
    });
    // Los vídeos solo se piden después del evento load (el póster es lo primero).
    for (const t of r.inicios) expect(t).toBeGreaterThanOrEqual(r.load);
  });

  test("las páginas de compra y alquiler no cargan el motor", async ({ page }) => {
    for (const r of ["/comprar", "/alquiler"]) {
      await page.goto(r);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => typeof (window as unknown as { ScrollCraft?: unknown }).ScrollCraft)).toBe("undefined");
    }
  });
});

test.describe("solicitud de alquiler (prototipo)", () => {
  test("valida y no muestra horarios como disponibles", async ({ page }) => {
    await page.goto("/alquiler");
    await expect(page.getByText(/no mostramos horarios/)).toBeVisible();
    await page.getByRole("button", { name: "Solicitar reserva" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("Elige una localidad");
  });

  test("se completa con teclado y no envía nada", async ({ page }) => {
    await page.goto("/alquiler");
    await page.getByLabel("Dénia").check();
    await page.locator('input[name="fecha"]').first().check();
    await page.getByLabel(/Tarde/).check();
    await page.getByLabel("Nombre").fill("Prueba");
    await page.getByLabel("Email").fill("prueba@example.com");
    await page.getByLabel(/Acepto/).check();
    await page.getByRole("button", { name: "Solicitar reserva" }).press("Enter");
    await expect(page.getByRole("status")).toContainText("no se envía nada");
  });
});

test.describe("menú en pantallas estrechas", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("empieza cerrado, se abre, y se cierra con Escape", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav).toBeHidden();
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(nav).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
  });
});

test.describe("menú: cierre automático", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("se cierra al tocar fuera y al hacer scroll", async ({ page }) => {
    await page.goto("/alquiler");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(nav).toBeVisible();
    await page.mouse.click(200, 800);
    await expect(nav).toBeHidden();
    await page.getByRole("button", { name: "Menú" }).click();
    await expect(nav).toBeVisible();
    await page.evaluate(() => scrollBy(0, 300));
    await expect(nav).toBeHidden();
  });
});
