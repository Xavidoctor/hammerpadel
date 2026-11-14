import type { Minutos, ModoReparto } from "./tipos";

/**
 * Ajustes del servicio de alquiler. Se cambian aquí (y en la fase B, en la
 * base de datos) sin tocar la lógica.
 *
 * [CONFIRMADO] = dato dado por Xavi (14-11-2026).
 * [PROPUESTA]  = valor provisional a la espera de que Xavi lo confirme.
 */
export type Ajustes = {
  zonaHoraria: string;
  /** Primera hora de inicio de sesión. */
  primeraHora: Minutos;
  /** Última hora de inicio de sesión. */
  ultimaHora: Minutos;
  /** Separación entre horas de inicio ofrecidas. */
  paso: Minutos;
  duracion: Minutos;
  /** Tiempo del repartidor en la pista antes de empezar (entregar y montar). */
  montaje: Minutos;
  /** Tiempo del repartidor en la pista al terminar (desmontar y cargar). */
  recogida: Minutos;
  trasladoMismaLocalidad: Minutos;
  trasladoEntreLocalidades: Minutos;
  /** Margen mínimo entre el momento de reservar y el inicio de la sesión. */
  antelacionMinima: Minutos;
  /** Días que se muestran para reservar (hoy incluido). */
  diasVista: number;
  /** Modo de reparto por defecto. */
  modo: ModoReparto;
  /** Modo de reparto por localidad (prevalece sobre `modo`). */
  modoPorLocalidad: Partial<Record<string, ModoReparto>>;
};

export const AJUSTES: Ajustes = {
  zonaHoraria: "Europe/Madrid",
  primeraHora: 8 * 60, // [CONFIRMADO] 8:00
  ultimaHora: 20 * 60 + 30, // [CONFIRMADO] 20:30 última reserva
  paso: 30, // [PROPUESTA]
  duracion: 90, // [CONFIRMADO]
  montaje: 3, // [CONFIRMADO] 3 min
  recogida: 3, // [CONFIRMADO] 3 min
  trasladoMismaLocalidad: 10, // [CONFIRMADO]
  trasladoEntreLocalidades: 20, // [CONFIRMADO]
  antelacionMinima: 6 * 60, // [CONFIRMADO] 6 h
  diasVista: 14, // [PROPUESTA]
  // [CONFIRMADO] Lunes a domingo: no hay días cerrados por defecto (los
  // festivos o días libres se crean como bloqueos).
  // [CONFIRMADO] En Ondara y Pedreguer el repartidor se queda en la pista; en
  // Dénia y La Xara puede volver a casa u oficina, así que se cuenta como
  // "deja y vuelve" (si le conviene, igualmente puede quedarse).
  // [CONFIRMADO] El Verger y Els Poblets: igual que Dénia y La Xara (según el
  // momento se quedan o se van), así que también "deja y vuelve".
  modo: "deja_y_vuelve",
  modoPorLocalidad: { ondara: "se_queda", pedreguer: "se_queda" },
};

export function modoEn(aj: Ajustes, localidadId: string): ModoReparto {
  return aj.modoPorLocalidad[localidadId] ?? aj.modo;
}

/** [CONFIRMADO] flota inicial: 5 máquinas. */
export const MAQUINAS = ["hp-1", "hp-2", "hp-3", "hp-4", "hp-5"].map((id) => ({
  id,
  estado: "activa" as const,
}));

/** [CONFIRMADO] repartidores: Xavi y Marc (14-11-2026). */
export const REPARTIDORES = [
  { id: "xavi", nombre: "Xavi" },
  { id: "marc", nombre: "Marc" },
];

/** Minutos de trayecto de un repartidor entre dos localidades. */
export function traslado(aj: Ajustes, desde: string, hasta: string): Minutos {
  return desde === hasta ? aj.trasladoMismaLocalidad : aj.trasladoEntreLocalidades;
}
