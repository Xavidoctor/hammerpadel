import { describe, expect, it } from "vitest";
import { cuerpoCorreo, enlaceMailto, validar } from "./mensaje";
import { permitido } from "./limite";

const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const base = { nombre: "Ana", email: "ana@correo.com", asunto: "alquiler", mensaje: "Quiero reservar el sábado", privacidad: "si" };

describe("formulario de contacto", () => {
  it("acepta un mensaje correcto", () => {
    const v = validar(fd(base));
    expect(v.ok).toBe(true);
  });

  it("pide nombre, email válido, mensaje y permiso", () => {
    const v = validar(fd({ nombre: " ", email: "no-es-email", mensaje: "hola", asunto: "alquiler" }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(Object.keys(v.errores).sort()).toEqual(["email", "mensaje", "nombre", "privacidad"]);
  });

  it("marca como spam si se rellena el campo trampa", () => {
    const v = validar(fd({ ...base, web: "http://spam" }));
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.spam).toBe(true);
  });

  it("no permite inyectar cabeceras con saltos de línea en el nombre", () => {
    const v = validar(fd({ ...base, nombre: "Ana\r\nBcc: otro@x.com" }));
    expect(v.ok && v.datos.nombre.includes("\n")).toBe(false);
  });

  it("un asunto desconocido pasa a «otro»", () => {
    const v = validar(fd({ ...base, asunto: "inventado" }));
    expect(v.ok && v.datos.asunto).toBe("otro");
  });

  it("el mailto lleva el mensaje codificado", () => {
    const v = validar(fd(base));
    if (!v.ok) throw new Error();
    expect(cuerpoCorreo(v.datos)).toContain("Quiero reservar el sábado");
    expect(enlaceMailto("a@b.es", v.datos)).toMatch(/^mailto:a@b\.es\?subject=.+&body=.+/);
  });

  it("limita a 5 envíos por IP cada 10 minutos", () => {
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(permitido("1.2.3.4", t + i)).toBe(true);
    expect(permitido("1.2.3.4", t + 10)).toBe(false);
    expect(permitido("1.2.3.4", t + 11 * 60 * 1000)).toBe(true);
  });
});
