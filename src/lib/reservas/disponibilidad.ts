import { modoEn, traslado, type Ajustes } from "./ajustes";
import { diaSemana, enZona, sumarDias } from "./tiempo";
import {
  ESTADOS_QUE_OCUPAN,
  type Bloqueo,
  type Fecha,
  type Maquina,
  type Minutos,
  type Repartidor,
  type ReservaDia,
  type Tarea,
} from "./tipos";

/**
 * Disponibilidad del alquiler (ver docs/reservas.md).
 *
 * Una hora se ofrece en una localidad si:
 *  1. hay una máquina activa cuyo ciclo (montaje + sesión + recogida) no se
 *     solapa con otro ciclo suyo ni con un bloqueo, y
 *  2. algún repartidor puede hacer la entrega y la recogida sin dejar de
 *     llegar a tiempo a sus otras tareas del día (trayectos incluidos).
 */

type Tramo = { inicio: Minutos; fin: Minutos };
const solapan = (a: Tramo, b: Tramo) => a.inicio < b.fin && b.inicio < a.fin;

const ocupa = (r: ReservaDia) => ESTADOS_QUE_OCUPAN.includes(r.estado);

/** Tramo en que la máquina no está disponible para otra sesión. */
export function cicloMaquina(aj: Ajustes, s: Tramo): Tramo {
  return { inicio: s.inicio - aj.montaje, fin: s.fin + aj.recogida };
}

/** Tareas que una sesión genera para su repartidor. */
export function tareasDeSesion(
  aj: Ajustes,
  s: { id: string; localidadId: string; inicio: Minutos; fin: Minutos },
): Tarea[] {
  const base = { reservaId: s.id, localidadId: s.localidadId };
  if (modoEn(aj, s.localidadId) === "se_queda") {
    return [{ ...base, tipo: "sesion_completa", inicio: s.inicio - aj.montaje, fin: s.fin + aj.recogida }];
  }
  return [
    { ...base, tipo: "entrega", inicio: s.inicio - aj.montaje, fin: s.inicio },
    { ...base, tipo: "recogida", inicio: s.fin, fin: s.fin + aj.recogida },
  ];
}

/**
 * ¿Puede un repartidor añadir `nuevas` a su agenda? Comprueba cada nueva
 * tarea con sus vecinas en el tiempo: entre dos tareas seguidas tiene que
 * caber el trayecto entre sus localidades.
 */
export function agendaViable(aj: Ajustes, existentes: Tarea[], nuevas: Tarea[]): boolean {
  const todas = [
    ...existentes.map((t) => ({ t, nueva: false })),
    ...nuevas.map((t) => ({ t, nueva: true })),
  ].sort((a, b) => a.t.inicio - b.t.inicio || a.t.fin - b.t.fin);
  for (let i = 1; i < todas.length; i++) {
    const a = todas[i - 1];
    const b = todas[i];
    if (!a.nueva && !b.nueva) continue;
    if (a.t.fin + traslado(aj, a.t.localidadId, b.t.localidadId) > b.t.inicio) return false;
  }
  return true;
}

export type DatosDia = {
  fecha: Fecha;
  maquinas: Maquina[];
  repartidores: Repartidor[];
  /** Reservas de ese día (de todas las localidades). */
  reservas: ReservaDia[];
  bloqueos: Bloqueo[];
};

export type Motivo = "fuera_de_horario" | "antelacion" | "bloqueado" | "sin_maquina" | "sin_repartidor";

export type Resultado =
  | { ok: true; maquinaId: string; repartidorId: string; inicio: Minutos; fin: Minutos }
  | { ok: false; motivo: Motivo };

/**
 * Comprueba una hora concreta y, si es posible, asigna máquina y repartidor.
 * Es la misma función que usará el servidor al grabar la reserva.
 */
export function comprobarHora(
  aj: Ajustes,
  dia: DatosDia,
  p: { localidadId: string; inicio: Minutos; minInicio: Minutos; reservaId?: string },
): Resultado {
  const { inicio } = p;
  if (
    !Number.isInteger(inicio) ||
    inicio < aj.primeraHora ||
    inicio > aj.ultimaHora ||
    (inicio - aj.primeraHora) % aj.paso !== 0
  ) {
    return { ok: false, motivo: "fuera_de_horario" };
  }
  if (inicio < p.minInicio) return { ok: false, motivo: "antelacion" };

  const sesion = { id: p.reservaId ?? "nueva", localidadId: p.localidadId, inicio, fin: inicio + aj.duracion };
  const ciclo = cicloMaquina(aj, sesion);
  const bloqueos = dia.bloqueos.filter((b) => b.fecha === dia.fecha);
  if (bloqueos.some((b) => !b.maquinaId && !b.repartidorId && solapan(b, ciclo))) {
    return { ok: false, motivo: "bloqueado" };
  }

  const reservas = dia.reservas.filter((r) => r.fecha === dia.fecha && ocupa(r));

  const maquina = dia.maquinas.find(
    (m) =>
      m.estado === "activa" &&
      !bloqueos.some((b) => b.maquinaId === m.id && solapan(b, ciclo)) &&
      !reservas.some((r) => r.maquinaId === m.id && solapan(cicloMaquina(aj, r), ciclo)),
  );
  if (!maquina) return { ok: false, motivo: "sin_maquina" };

  const nuevas = tareasDeSesion(aj, sesion);
  const repartidor = dia.repartidores.find((rep) => {
    const libre = !bloqueos.some(
      (b) => b.repartidorId === rep.id && nuevas.some((t) => solapan(b, t)),
    );
    if (!libre) return false;
    const suyas = reservas.filter((r) => r.repartidorId === rep.id).flatMap((r) => tareasDeSesion(aj, r));
    return agendaViable(aj, suyas, nuevas);
  });
  if (!repartidor) return { ok: false, motivo: "sin_repartidor" };

  return { ok: true, maquinaId: maquina.id, repartidorId: repartidor.id, inicio, fin: sesion.fin };
}

export type HoraLibre = { inicio: Minutos; fin: Minutos };

/** Horas de inicio que se pueden reservar en una localidad y un día. */
export function horasLibres(
  aj: Ajustes,
  dia: DatosDia,
  p: { localidadId: string; minInicio: Minutos },
): HoraLibre[] {
  const horas: HoraLibre[] = [];
  for (let ini = aj.primeraHora; ini <= aj.ultimaHora; ini += aj.paso) {
    const r = comprobarHora(aj, dia, { ...p, inicio: ini });
    if (r.ok) horas.push({ inicio: r.inicio, fin: r.fin });
  }
  return horas;
}

/**
 * Primer minuto del día `fecha` en que puede empezar una sesión reservada
 * `ahora`, respetando la antelación mínima. -Infinity = sin límite ese día;
 * Infinity = ese día ya no se puede reservar.
 */
export function minInicioDelDia(aj: Ajustes, fecha: Fecha, ahora: Date): Minutos {
  const limite = enZona(new Date(ahora.getTime() + aj.antelacionMinima * 60_000), aj.zonaHoraria);
  if (limite.fecha < fecha) return -Infinity;
  if (limite.fecha > fecha) return Infinity;
  return limite.minutos;
}

/** Fechas que se muestran para reservar, desde hoy (hora de Madrid). */
export function fechasReservables(aj: Ajustes, ahora: Date): { fecha: Fecha; diaSemana: number }[] {
  const hoy = enZona(ahora, aj.zonaHoraria).fecha;
  return Array.from({ length: aj.diasVista }, (_, i) => {
    const fecha = sumarDias(hoy, i);
    return { fecha, diaSemana: diaSemana(fecha) };
  });
}

/** ¿Está la fecha dentro de la ventana reservable? */
export function fechaReservable(aj: Ajustes, fecha: Fecha, ahora: Date): boolean {
  const hoy = enZona(ahora, aj.zonaHoraria).fecha;
  return fecha >= hoy && fecha <= sumarDias(hoy, aj.diasVista - 1);
}
