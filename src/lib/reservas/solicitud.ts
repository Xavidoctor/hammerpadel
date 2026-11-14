import { localidades } from "@/content/catalogo";
import { AJUSTES } from "./ajustes";
import { esFecha } from "./tiempo";
import type { SolicitudReserva } from "./postgres";

const recorta = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : "");

/** Valida lo que envía el navegador. Nunca se fía del precio ni de la máquina. */
export function validarSolicitud(
  body: unknown,
): { ok: true; datos: SolicitudReserva } | { ok: false; errores: string[]; bot?: boolean } {
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  // Campo trampa: invisible para personas; los bots lo rellenan.
  if (recorta(b.web, 200)) return { ok: false, errores: ["Solicitud no válida."], bot: true };

  const errores: string[] = [];
  const localidadId = recorta(b.localidad, 40);
  if (!localidades.some((l) => l.id === localidadId)) errores.push("Elige una localidad.");
  const fecha = recorta(b.fecha, 10);
  if (!esFecha(fecha)) errores.push("Elige una fecha.");
  const hora = recorta(b.inicio, 5);
  const m = /^(\d{2}):(\d{2})$/.exec(hora);
  const inicio = m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
  if (!m) errores.push("Elige una hora de inicio.");
  const nombre = recorta(b.nombre, 80);
  if (!nombre) errores.push("Escribe tu nombre.");
  const telefono = recorta(b.telefono, 20).replace(/[^\d+]/g, "");
  if (telefono.replace(/\D/g, "").length < 9) errores.push("Escribe un teléfono de contacto.");
  const email = recorta(b.email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errores.push("Escribe un email válido.");
  const pista = recorta(b.pista, 200);
  if (!pista) errores.push("Indica el club, la urbanización o la pista donde entrenarás.");
  if (b.acepto !== true) errores.push("Acepta las condiciones para continuar.");

  if (errores.length) return { ok: false, errores };
  return { ok: true, datos: { localidadId, fecha, inicio, nombre, telefono, email, pista } };
}

export const MENSAJES_RECHAZO: Record<string, string> = {
  fuera_de_horario: "Esa hora no está dentro del horario del servicio.",
  antelacion: `Hay que reservar con al menos ${AJUSTES.antelacionMinima / 60} horas de antelación.`,
  bloqueado: "Ese día u hora no hay servicio.",
  sin_maquina: "Esa hora acaba de ocuparse. Elige otra.",
  sin_repartidor: "Esa hora acaba de ocuparse. Elige otra.",
  ocupada: "Esa hora acaba de ocuparse. Elige otra.",
  fecha: "Esa fecha no se puede reservar.",
  limite: "Ya tienes reservas ese día. Si necesitas más, llámanos.",
};
