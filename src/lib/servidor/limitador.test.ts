import { describe, expect, it } from "vitest";
import { crearLimitador, ipCliente, origenAjeno } from "./limitador";

const cab = (o: Record<string, string>) => new Headers(o);

describe("crearLimitador", () => {
  it("deja pasar hasta el máximo y vuelve a dejar pasar al acabar la ventana", () => {
    const permitido = crearLimitador({ ventanaMs: 1000, maximo: 2 });
    expect(permitido("a", 0)).toBe(true);
    expect(permitido("a", 10)).toBe(true);
    expect(permitido("a", 20)).toBe(false);
    expect(permitido("b", 20)).toBe(true);
    expect(permitido("a", 1011)).toBe(true);
  });
});

describe("ipCliente", () => {
  it("prefiere la cabecera de Netlify", () => {
    expect(ipCliente(cab({ "x-nf-client-connection-ip": "1.1.1.1", "x-forwarded-for": "9.9.9.9" }))).toBe("1.1.1.1");
  });
  it("usa la última IP de X-Forwarded-For, no la que escribe el visitante", () => {
    expect(ipCliente(cab({ "x-forwarded-for": "6.6.6.6, 2.2.2.2" }))).toBe("2.2.2.2");
  });
  it("sin cabeceras devuelve local", () => {
    expect(ipCliente(cab({}))).toBe("local");
  });
});

describe("origenAjeno", () => {
  it("acepta la propia web y peticiones sin Origin", () => {
    expect(origenAjeno(cab({ origin: "https://hammepadel.netlify.app", host: "hammepadel.netlify.app" }))).toBe(false);
    expect(origenAjeno(cab({ host: "hammepadel.netlify.app" }))).toBe(false);
  });
  it("rechaza otra web o un Origin roto", () => {
    expect(origenAjeno(cab({ origin: "https://malo.example", host: "hammepadel.netlify.app" }))).toBe(true);
    expect(origenAjeno(cab({ origin: "null", host: "hammepadel.netlify.app" }))).toBe(true);
  });
});
