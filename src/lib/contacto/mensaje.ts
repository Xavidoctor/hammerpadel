import { ASUNTOS, textoAsunto } from "@/content/contacto";

/** Validación y formato del mensaje de contacto. Sin dependencias de servidor: se prueba con vitest. */

export type Campo = "nombre" | "email" | "telefono" | "organizacion" | "localidad" | "asunto" | "mensaje" | "privacidad";

export type Mensaje = {
  nombre: string;
  email: string;
  telefono: string;
  organizacion: string;
  localidad: string;
  asunto: string;
  mensaje: string;
};

export type Validacion =
  | { ok: true; datos: Mensaje }
  | { ok: false; errores: Partial<Record<Campo, string>>; spam?: boolean };

const LIMITES: Record<keyof Mensaje, number> = {
  nombre: 100,
  email: 200,
  telefono: 30,
  organizacion: 120,
  localidad: 60,
  asunto: 40,
  mensaje: 4000,
};

/** Quita saltos de línea y caracteres de control de los campos de una línea. */
const unaLinea = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

export function validar(f: FormData): Validacion {
  const leer = (k: keyof Mensaje) => String(f.get(k) ?? "");
  // Campo trampa invisible: las personas lo dejan vacío, muchos bots lo rellenan.
  if (String(f.get("web") ?? "").trim() !== "") return { ok: false, errores: {}, spam: true };

  const datos: Mensaje = {
    nombre: unaLinea(leer("nombre")),
    email: unaLinea(leer("email")),
    telefono: unaLinea(leer("telefono")),
    organizacion: unaLinea(leer("organizacion")),
    localidad: unaLinea(leer("localidad")),
    asunto: unaLinea(leer("asunto")),
    mensaje: leer("mensaje").replace(/\r\n?/g, "\n").trim(),
  };

  const errores: Partial<Record<Campo, string>> = {};
  if (!datos.nombre) errores.nombre = "Escribe tu nombre.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email)) errores.email = "Escribe un email válido, por ejemplo nombre@correo.com.";
  if (datos.telefono && !/^[+\d][\d\s().-]{5,}$/.test(datos.telefono)) errores.telefono = "Revisa el teléfono (solo números, espacios y +).";
  if (!ASUNTOS.some((a) => a.id === datos.asunto)) datos.asunto = "otro";
  if (datos.mensaje.length < 10) errores.mensaje = "Cuéntanos un poco más (mínimo 10 caracteres).";
  if (f.get("privacidad") !== "si") errores.privacidad = "Necesitamos tu permiso para responderte.";
  for (const k of Object.keys(LIMITES) as (keyof Mensaje)[]) {
    if (datos[k].length > LIMITES[k]) errores[k] = `Demasiado largo (máximo ${LIMITES[k]} caracteres).`;
  }

  return Object.keys(errores).length ? { ok: false, errores } : { ok: true, datos };
}

export function asuntoCorreo(m: Mensaje) {
  return `[Web Hammer Padel] ${textoAsunto(m.asunto)} · ${m.nombre}`.slice(0, 160);
}

export function cuerpoCorreo(m: Mensaje) {
  return [
    `Asunto: ${textoAsunto(m.asunto)}`,
    `Nombre: ${m.nombre}`,
    `Email: ${m.email}`,
    m.telefono && `Teléfono: ${m.telefono}`,
    m.organizacion && `Club / academia: ${m.organizacion}`,
    m.localidad && `Localidad: ${m.localidad}`,
    "",
    m.mensaje,
    "",
    "—",
    "Enviado desde el formulario de contacto de la web. Responde a este correo para contestar al cliente.",
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n");
}

/** Enlace mailto de respaldo cuando el envío desde el servidor no está configurado. */
export function enlaceMailto(destino: string, m: Mensaje) {
  return `mailto:${destino}?subject=${encodeURIComponent(asuntoCorreo(m))}&body=${encodeURIComponent(cuerpoCorreo(m))}`;
}
