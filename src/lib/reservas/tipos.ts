/**
 * Modelo de dominio de reservas (diseño §8). Solo tipos y lógica pura: no hay
 * base de datos ni reservas reales en el prototipo.
 *
 * Tiempo: cada día se trabaja en minutos locales (Europe/Madrid) desde las
 * 00:00. En la base de datos real se guardará como timestamptz (UTC).
 */
export type Minutos = number;

export type Ubicacion = { id: string; nombre: string; activa: boolean };

export type Maquina = {
  id: string;
  estado: "activa" | "mantenimiento" | "baja";
  /** Ubicaciones donde la máquina puede prestar servicio. */
  ubicaciones: string[];
};

/** Horario en el que una máquina puede trabajar un día de la semana (0 = domingo). */
export type ReglaDisponibilidad = {
  maquinaId: string;
  diaSemana: number;
  inicio: Minutos;
  fin: Minutos;
};

export type EstadoReserva = "retenida" | "pendiente" | "confirmada" | "cancelada" | "completada" | "no_presentado";

export type Reserva = {
  id: string;
  maquinaId: string;
  ubicacionId: string;
  fecha: string; // YYYY-MM-DD
  inicio: Minutos;
  fin: Minutos;
  estado: EstadoReserva;
};

export type Bloqueo = {
  maquinaId: string;
  fecha: string;
  inicio: Minutos;
  fin: Minutos;
  motivo: "mantenimiento" | "festivo" | "manual";
};

/**
 * Logística entre sesiones. Solo aplica si el modelo operativo lo requiere
 * (por ejemplo, si la máquina se lleva a distintas pistas). Todo a 0 = sin
 * traslados.
 */
export type Logistica = {
  /** Preparación antes de cada sesión en destino (montaje, carga). */
  preparacion: Minutos;
  /** Recogida tras cada sesión. */
  recogida: Minutos;
  /** Minutos de traslado entre dos ubicaciones distintas. */
  traslado: (desde: string, hasta: string) => Minutos;
};

export type Tarifa = { id: string; duracion: Minutos; precioCentimos: number };

export const ESTADOS_QUE_OCUPAN: EstadoReserva[] = ["retenida", "pendiente", "confirmada"];
