import type { Fecha, Minutos } from "./tipos";

/** Fecha y minuto del día de un instante en una zona horaria (por defecto, Madrid). */
export function enZona(instante: Date, zona = "Europe/Madrid"): { fecha: Fecha; minutos: Minutos } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instante);
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return { fecha: `${v("year")}-${v("month")}-${v("day")}`, minutos: Number(v("hour")) * 60 + Number(v("minute")) };
}

/** Suma días a una fecha YYYY-MM-DD (aritmética de calendario, sin horas). */
export function sumarDias(fecha: Fecha, dias: number): Fecha {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + dias)).toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado. */
export function diaSemana(fecha: Fecha): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

export function esFecha(x: unknown): x is Fecha {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  return sumarDias(x, 0) === x;
}

export const hhmm = (m: Minutos) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
