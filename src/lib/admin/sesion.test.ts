import { describe, expect, it } from "vitest";
import { contrasenaCorrecta, crearCookie, leerCookie } from "./sesion";

const PASS = "una-contrasena-larga";

describe("sesión del panel", () => {
  it("valida la contraseña y exige una mínima longitud", () => {
    expect(contrasenaCorrecta(PASS, PASS)).toBe(true);
    expect(contrasenaCorrecta("otra", PASS)).toBe(false);
    expect(contrasenaCorrecta("corta", "corta")).toBe(false);
    expect(contrasenaCorrecta("x", undefined)).toBe(false);
  });

  it("la cookie firmada identifica a quien entra y caduca", () => {
    const c = crearCookie("marc", 0, PASS);
    expect(leerCookie(c, 1000, PASS)).toBe("marc");
    expect(leerCookie(c, 1000 * 60 * 60 * 24 * 31, PASS)).toBeNull();
  });

  it("rechaza cookies manipuladas o de otra contraseña", () => {
    const c = crearCookie("marc", 0, PASS);
    expect(leerCookie(c.replace("marc", "xavi"), 1000, PASS)).toBeNull();
    expect(leerCookie(c, 1000, "otra-contrasena-larga")).toBeNull();
    expect(leerCookie("basura", 1000, PASS)).toBeNull();
  });
});
