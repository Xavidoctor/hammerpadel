import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGINAS = ["/", "/comprar", "/recogebolas", "/alquiler", "/alquiler/denia", "/alquiler/ondara", "/alquiler/la-xara", "/alquiler/pedreguer", "/alquiler/el-verger", "/alquiler/els-poblets", "/como-funciona", "/entrenamientos", "/clubes", "/soporte", "/contacto", "/legal", "/legal/aviso-legal", "/legal/privacidad", "/legal/cookies", "/legal/condiciones-alquiler", "/legal/condiciones-venta"];

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
    expect(html).toContain("2.499 €");
    expect(html).toContain("65 €");
    expect(html).toContain("25 €");
    expect(html).toContain("60 pelotas");
    for (const l of ["Dénia", "Ondara", "La Xara", "Pedreguer", "El Verger", "Els Poblets"]) expect(html).toContain(l);
  });
});

test.describe("la landing nunca bloquea la reserva ni la compra", () => {
  test("sin JavaScript se ven el titular y los CTA", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const reservar = page.getByRole("link", { name: /^Reservar sesión/ });
    await expect(reservar).toBeVisible();
    expect(await reservar.evaluate((el) => getComputedStyle(el.closest("[data-sc-cue]")!).opacity)).toBe("1");
    await expect(page.getByRole("link", { name: "Quiero mi propia Hammer X MAX" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Reservar entrenamiento" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Comprar recogebolas" })).toBeVisible();
    await ctx.close();
  });

  test("con movimiento reducido el contenido sigue accesible", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Reservar sesión/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Comprar recogebolas" })).toBeVisible();
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

  test("el vídeo del recogebolas se reproduce y con movimiento reducido solo muestra el póster", async ({ browser }) => {
    const normal = await browser.newContext();
    const p1 = await normal.newPage();
    await p1.goto("/recogebolas");
    // arriba, el recogebolas en 3D; en «Así se usa», el vídeo real
    const video = p1.locator("video.pvideo__media").first();
    await expect(video).toHaveAttribute("poster", /recogebolas-3d-poster\.webp$/);
    await expect(p1.locator("video.pvideo__media").nth(1)).toHaveAttribute("poster", /recogebolas-poster\.webp$/);
    await expect(p1.locator("img[src$='completo.webp']")).toBeVisible();
    await video.scrollIntoViewIfNeeded();
    await p1.waitForFunction(() => {
      const v = document.querySelector<HTMLVideoElement>("video.pvideo__media");
      return !!v && !v.paused;
    });
    await normal.close();

    const reducido = await browser.newContext({ reducedMotion: "reduce" });
    const p2 = await reducido.newPage();
    await p2.goto("/recogebolas");
    await p2.waitForLoadState("networkidle");
    const pidioVideo = await p2.evaluate(() =>
      performance.getEntriesByType("resource").some((r) => /\.(mp4|webm)$/.test(r.name)),
    );
    expect(pidioVideo).toBe(false);
    await reducido.close();
  });

  test("en la portada el cursor recoge las pelotas sin tapar el botón de compra", async ({ page, isMobile }) => {
    test.skip(isMobile, "con ratón");
    await page.goto("/");
    await page.waitForSelector(".balls--juego", { state: "attached" });
    const sec = page.locator("#recogebolas");
    await sec.scrollIntoViewIfNeeded();
    const b = (await sec.boundingBox())!;
    for (let x = 10; x < b.width; x += 10) await page.mouse.move(b.x + x, b.y + b.height * 0.8);
    await expect(page.locator(".balls span.is-recogida").first()).toBeAttached();
    const comprar = page.getByRole("link", { name: "Comprar recogebolas" });
    await comprar.hover();
    await expect(page.locator(".balls__cursor")).not.toHaveClass(/is-activo/);
    await comprar.click();
    await expect(page).toHaveURL(/\/recogebolas$/);
  });

  test("en /recogebolas el cursor también recoge las pelotas", async ({ page, isMobile }) => {
    test.skip(isMobile, "con ratón");
    await page.goto("/recogebolas");
    await page.waitForSelector(".balls--juego", { state: "attached" });
    const zona = (await page.locator(".zona-recogebolas").boundingBox())!;
    for (let y = 100; y < 860; y += 60) for (let x = 10; x < 1430; x += 14) await page.mouse.move(x, y);
    await expect(page.locator(".balls span.is-recogida").first()).toBeAttached();
    expect(zona.height).toBeGreaterThan(900);
    await page.getByRole("link", { name: "Solicitar compra" }).click();
    await expect(page).toHaveURL(/\/contacto/);
  });

  for (const ruta of ["/", "/recogebolas"]) {
    test(`en ${ruta} todas las pelotas se ven y se pueden recoger con el ratón`, async ({ page, isMobile }) => {
      test.skip(isMobile, "en móvil no hay recogebolas");
      await page.goto(ruta);
      await page.waitForSelector(".balls--juego", { state: "attached" });
      await page.waitForTimeout(800); // recolocación de las pelotas
      const bolas = page.locator(".balls span");
      const n = await bolas.count();
      for (let i = 0; i < n; i++) {
        const b = bolas.nth(i);
        await b.scrollIntoViewIfNeeded();
        const r = (await b.boundingBox())!;
        const x = r.x + r.width / 2, y = r.y + r.height / 2;
        // nada la tapa: ni foto, ni vídeo, ni enlace o botón
        const tapa = await page.evaluate(([px, py]) => document.elementFromPoint(px, py)?.closest("a, button, video, .pvideo, .photo, img")?.tagName ?? null, [x, y]);
        expect(tapa, `pelota ${i}`).toBeNull();
        await page.mouse.move(x - 4, y);
        await page.mouse.move(x, y);
        await expect(b, `pelota ${i}`).toHaveClass(/is-recogida/);
      }
    });
  }

  test("en móvil no hay recogebolas ni pelotas", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo móvil");
    for (const ruta of ["/", "/recogebolas"]) {
      await page.goto(ruta);
      await expect(page.locator(".balls")).toBeHidden();
      await expect(page.locator(".balls__cursor")).toBeHidden();
    }
  });

  test("las páginas de compra y alquiler no cargan el motor", async ({ page }) => {
    for (const r of ["/comprar", "/alquiler"]) {
      await page.goto(r);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => typeof (window as unknown as { ScrollCraft?: unknown }).ScrollCraft)).toBe("undefined");
    }
  });
});

test.describe("reserva de alquiler (prototipo)", () => {
  test("valida los pasos", async ({ page }) => {
    await page.goto("/alquiler");
    await expect(page.getByText(/todavía no\s+se guardan reservas/)).toBeVisible();
    await page.getByRole("button", { name: "Solicitar reserva" }).click();
    await expect(page.locator("form [role=alert]")).toContainText("Elige una localidad");
  });

  test("muestra horas reales de 90 min dentro del horario y no envía nada", async ({ page }) => {
    await page.goto("/alquiler");
    await page.getByLabel("Dénia").check();
    const dia = page.locator('input[name="fecha"]:not([disabled])').first();
    await expect(dia).toBeVisible();
    await dia.check();
    const horas = page.locator('input[name="hora"]');
    await expect(horas.first()).toBeAttached();
    const valores = await horas.evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value));
    expect(valores.every((v) => v >= "08:00" && v <= "20:30")).toBe(true);
    await horas.first().check();
    await expect(page.locator(".summary")).toContainText(/\d\d:\d\d–\d\d:\d\d/);
    await page.getByLabel("Nombre").fill("Prueba");
    await page.getByLabel("Teléfono").fill("600 000 000");
    await page.getByLabel("Email").fill("prueba@example.com");
    await page.getByLabel("Club o pista").fill("Club de prueba, pista 2");
    await page.getByLabel(/Acepto/).check();
    await page.getByRole("button", { name: "Solicitar reserva" }).press("Enter");
    await expect(page.getByRole("status")).toContainText("no se envía nada");
  });

  test("la API solo acepta localidades conocidas y no expone máquinas", async ({ request }) => {
    expect((await request.get("/api/disponibilidad?localidad=madrid")).status()).toBe(400);
    const r = await request.get("/api/disponibilidad?localidad=ondara");
    expect(r.ok()).toBe(true);
    const texto = await r.text();
    expect(texto).not.toMatch(/hp-\d|xavi|marc/i);
    expect(JSON.parse(texto).dias).toHaveLength(14);
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

test.describe("alquiler por localidad", () => {
  for (const [id, nombre] of [["denia", "Dénia"], ["ondara", "Ondara"], ["la-xara", "La Xara"], ["pedreguer", "Pedreguer"], ["el-verger", "El Verger"], ["els-poblets", "Els Poblets"]]) {
    test(`/alquiler/${id}: H1 propio, datos estructurados, enlace a reserva y noindex sin datos locales`, async ({ page }) => {
      await page.goto(`/alquiler/${id}`);
      await expect(page.locator("h1")).toContainText(nombre);
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "[]");
      const servicio = ld.find((x: { "@type": string }) => x["@type"] === "Service");
      expect(servicio.areaServed.name).toBe(nombre);
      expect(servicio.offers.price).toBe("25.00");
      expect(servicio.offers.description).toContain("60 pelotas");
      expect(ld.some((x: { "@type": string }) => x["@type"] === "LocalBusiness")).toBe(false);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await page.getByRole("link", { name: `Reservar en ${nombre}` }).first().click();
      await expect(page).toHaveURL(/\/alquiler#reservar$/);
    });
  }

  test("una localidad inexistente da 404", async ({ page }) => {
    const res = await page.goto("/alquiler/valencia");
    expect(res?.status()).toBe(404);
  });

  test("/alquiler enlaza a todas las localidades", async ({ page }) => {
    await page.goto("/alquiler");
    for (const nombre of ["Dénia", "Ondara", "La Xara", "Pedreguer", "El Verger", "Els Poblets"]) {
      await expect(page.getByRole("link", { name: `Alquiler de máquina de pádel en ${nombre}` })).toBeVisible();
    }
  });
});

test.describe("páginas de contenido", () => {
  test("soporte publica FAQ estructurada solo con respuestas confirmadas", async ({ page }) => {
    await page.goto("/soporte");
    const bloques = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqs = bloques.map((b) => JSON.parse(b)).filter((d) => d["@type"] === "FAQPage");
    expect(faqs.length).toBe(2);
    const texto = JSON.stringify(faqs);
    expect(texto).toContain("25 €");
    expect(texto).not.toMatch(/pendiente/i);
    await page.getByText("¿Tengo que ir a recoger la máquina?").click();
    await expect(page.getByText(/Llevamos la máquina a tu pista/).first()).toBeVisible();
  });

  for (const ruta of ["/como-funciona", "/entrenamientos", "/clubes", "/soporte", "/contacto"]) {
    test(`${ruta} tiene migas de pan y no se desborda en horizontal`, async ({ page }) => {
      await page.goto(ruta);
      const html = await page.content();
      expect(html).toContain('"BreadcrumbList"');
      const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(desborde).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("formulario de contacto", () => {
  test("marca los errores y conserva lo escrito", async ({ page }) => {
    await page.goto("/contacto?asunto=soporte");
    await expect(page.getByLabel("Asunto")).toHaveValue("soporte");
    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Email").fill("mal");
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(page.locator(".error--box")).toContainText("Revisa los campos");
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Nombre")).toHaveValue("Ana");
  });

  test("sin envío configurado no finge haber enviado", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByLabel("Nombre").fill("Ana");
    await page.getByLabel("Email").fill("ana@correo.com");
    await page.getByLabel("Mensaje").fill("Quiero reservar una sesión el sábado.");
    await page.getByLabel(/Acepto que Hammer Padel/).check();
    await page.getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(page.getByRole("status")).toContainText(/no se ha enviado|Abrir mi correo/);
    await expect(page.getByText("Mensaje enviado")).toHaveCount(0);
  });

  test("funciona sin JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/clubes");
    await page.getByLabel("Nombre").fill("Club de prueba");
    await page.getByLabel("Nombre").press("Enter");
    await expect(page.getByText("Revisa los campos marcados.")).toBeVisible();
    await ctx.close();
  });
});
