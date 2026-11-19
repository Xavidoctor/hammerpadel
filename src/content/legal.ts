/**
 * Datos del titular y de los textos legales.
 * [PENDIENTE] Todo lo que vale `null` falta por confirmar con Hammer Padel y se
 * muestra en la web como un marcador visible. No rellenar con datos supuestos.
 * Los textos son un BORRADOR: deben revisarse por un profesional antes de publicar.
 */

export type DatoPendiente = string | null;

export const titular = {
  /** Nombre o razón social (persona física autónoma o sociedad). */
  razonSocial: null as DatoPendiente,
  nombreComercial: "Hammer Padel",
  nif: null as DatoPendiente,
  domicilio: null as DatoPendiente,
  email: null as DatoPendiente,
  telefono: null as DatoPendiente,
  /** Solo si es una sociedad: Registro Mercantil, tomo, folio, hoja e inscripción. */
  registroMercantil: null as DatoPendiente,
};

/** Fecha de la última revisión del borrador. */
export const legalActualizado = "14 de noviembre de 2026";

export const documentosLegales = [
  { href: "/legal/aviso-legal", titulo: "Aviso legal", resumen: "Quién es el titular de la web y las condiciones de uso." },
  { href: "/legal/privacidad", titulo: "Política de privacidad", resumen: "Qué datos tratamos, para qué y cómo ejercer tus derechos." },
  { href: "/legal/cookies", titulo: "Política de cookies", resumen: "Qué se guarda en tu navegador y por qué." },
  { href: "/legal/condiciones-alquiler", titulo: "Condiciones de alquiler", resumen: "Cómo funciona una sesión de alquiler de la máquina." },
  { href: "/legal/condiciones-venta", titulo: "Condiciones de venta", resumen: "Compra de la máquina y del recogebolas." },
] as const;
