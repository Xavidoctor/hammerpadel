/**
 * Datos de contacto públicos de Hammer Padel.
 * [PENDIENTE] Xavi debe confirmar qué email y qué número se publican.
 * Mientras valgan null, la web no muestra ningún dato inventado.
 *
 * El email que RECIBE los mensajes del formulario no va aquí sino en variables
 * de entorno del servidor (ver README, «Formulario de contacto»).
 */
export const contacto = {
  /** Email público, p. ej. "hola@hammerpadel.es". */
  email: null as string | null,
  /** WhatsApp en formato internacional sin espacios ni «+», p. ej. "34600000000". */
  whatsapp: null as string | null,
  /** Plazo de respuesta que se promete al cliente. */
  plazoRespuesta: null as string | null,
};

export const ASUNTOS = [
  { id: "alquiler", texto: "Alquiler de máquina" },
  { id: "compra-maquina", texto: "Comprar la máquina Hammer X MAX" },
  { id: "compra-recogebolas", texto: "Comprar el recogebolas" },
  { id: "clubes", texto: "Clubes, academias y entrenadores" },
  { id: "soporte", texto: "Soporte" },
  { id: "otro", texto: "Otro" },
] as const;

export type AsuntoId = (typeof ASUNTOS)[number]["id"];

export const textoAsunto = (id: string) => ASUNTOS.find((a) => a.id === id)?.texto ?? "Otro";

export const enlaceWhatsapp = (texto?: string) =>
  contacto.whatsapp
    ? `https://wa.me/${contacto.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`
    : null;
