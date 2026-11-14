import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sesión del panel /admin. Una contraseña compartida por Xavi y Marc
 * (ADMIN_PASSWORD). La cookie lleva caducidad y quién entra, firmados con
 * HMAC: cambiar la contraseña cierra todas las sesiones.
 */
export const COOKIE = "hp_admin";
export const DURACION_S = 60 * 60 * 24 * 30;

const clave = (pass: string) => createHash("sha256").update(`hammer-admin:${pass}`).digest();
const firma = (pass: string, datos: string) => createHmac("sha256", clave(pass)).update(datos).digest("base64url");

function iguales(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function contrasenaCorrecta(intento: string, pass = process.env.ADMIN_PASSWORD): boolean {
  if (!pass || pass.length < 12) return false;
  return iguales(firma(pass, intento), firma(pass, pass));
}

export function crearCookie(quien: string, ahora = Date.now(), pass = process.env.ADMIN_PASSWORD): string {
  if (!pass) throw new Error("ADMIN_PASSWORD no configurada");
  const datos = `${quien}.${Math.floor(ahora / 1000) + DURACION_S}`;
  return `${datos}.${firma(pass, datos)}`;
}

/** Devuelve quién ha iniciado sesión, o null. */
export function leerCookie(valor: string | undefined, ahora = Date.now(), pass = process.env.ADMIN_PASSWORD): string | null {
  if (!valor || !pass) return null;
  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [quien, exp, f] = partes;
  if (!iguales(f, firma(pass, `${quien}.${exp}`))) return null;
  if (Number(exp) * 1000 < ahora) return null;
  return quien;
}
