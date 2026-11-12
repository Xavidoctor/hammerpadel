import {
  ESTADOS_QUE_OCUPAN,
  type Bloqueo,
  type Logistica,
  type Maquina,
  type Minutos,
  type ReglaDisponibilidad,
  type Reserva,
} from "./tipos";

export const SIN_LOGISTICA: Logistica = { preparacion: 0, recogida: 0, traslado: () => 0 };

/**
 * Margen mínimo entre el fin de una sesión en `a` y el inicio de otra en `b`
 * con la misma máquina.
 */
export function margen(log: Logistica, a: string, b: string): Minutos {
  if (a === b) return log.recogida + log.preparacion > 0 ? Math.max(log.recogida, log.preparacion) : 0;
  return log.recogida + log.traslado(a, b) + log.preparacion;
}

/**
 * ¿Choca una sesión candidata (ubicación, inicio, fin) con una reserva
 * existente de la misma máquina, teniendo en cuenta traslados?
 */
export function choca(
  log: Logistica,
  cand: { ubicacionId: string; inicio: Minutos; fin: Minutos },
  r: Pick<Reserva, "ubicacionId" | "inicio" | "fin">,
): boolean {
  const antes = cand.fin + margen(log, cand.ubicacionId, r.ubicacionId) <= r.inicio;
  const despues = r.fin + margen(log, r.ubicacionId, cand.ubicacionId) <= cand.inicio;
  return !(antes || despues);
}

export type Hueco = { maquinaId: string; inicio: Minutos; fin: Minutos };

/**
 * Huecos reservables para una ubicación y una fecha. El cliente elige hora;
 * el sistema asigna la primera máquina libre.
 */
export function huecosDelDia(p: {
  fecha: string;
  diaSemana: number;
  ubicacionId: string;
  maquinas: Maquina[];
  reglas: ReglaDisponibilidad[];
  reservas: Reserva[];
  bloqueos: Bloqueo[];
  duracion: Minutos;
  paso?: Minutos;
  logistica?: Logistica;
  /** Minutos locales "ahora" si la fecha es hoy, para no ofrecer el pasado. */
  ahora?: Minutos;
}): Hueco[] {
  const paso = p.paso ?? 30;
  const log = p.logistica ?? SIN_LOGISTICA;
  const porInicio = new Map<Minutos, Hueco>();

  for (const m of p.maquinas) {
    if (m.estado !== "activa" || !m.ubicaciones.includes(p.ubicacionId)) continue;
    const reservas = p.reservas.filter(
      (r) => r.maquinaId === m.id && r.fecha === p.fecha && ESTADOS_QUE_OCUPAN.includes(r.estado),
    );
    const bloqueos = p.bloqueos.filter((b) => b.maquinaId === m.id && b.fecha === p.fecha);

    for (const regla of p.reglas) {
      if (regla.maquinaId !== m.id || regla.diaSemana !== p.diaSemana) continue;
      // Rejilla alineada al inicio del horario; la preparación debe caber dentro.
      for (let ini = regla.inicio; ini + p.duracion <= regla.fin; ini += paso) {
        const fin = ini + p.duracion;
        if (ini - log.preparacion < regla.inicio) continue;
        if (p.ahora !== undefined && ini <= p.ahora) continue;
        if (porInicio.has(ini)) continue;
        const cand = { ubicacionId: p.ubicacionId, inicio: ini, fin };
        if (reservas.some((r) => choca(log, cand, r))) continue;
        if (bloqueos.some((b) => ini - log.preparacion < b.fin && b.inicio < fin + log.recogida)) continue;
        porInicio.set(ini, { maquinaId: m.id, inicio: ini, fin });
      }
    }
  }
  return [...porInicio.values()].sort((a, b) => a.inicio - b.inicio);
}

export const hhmm = (m: Minutos) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
