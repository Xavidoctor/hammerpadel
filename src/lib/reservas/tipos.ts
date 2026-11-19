/**
 * Modelo de dominio de reservas (diseño §8). Solo tipos y lógica pura: la
 * base de datos llegará en la fase B, cuando Xavi apruebe el proveedor.
 *
 * Tiempo: cada día se trabaja en minutos locales (Europe/Madrid) desde las
 * 00:00. En la base de datos se guardará como timestamptz (UTC).
 */
export type Minutos = number;

/** Fecha local en Madrid, formato YYYY-MM-DD. */
export type Fecha = string;

export type Repartidor = { id: string; nombre: string };

export type Maquina = {
  id: string;
  estado: "activa" | "mantenimiento" | "baja";
};

export type EstadoReserva =
  | "retenida" // fase D: mientras se paga online
  | "pendiente"
  | "confirmada"
  | "cancelada"
  | "completada"
  | "no_presentado";

export const ESTADOS_QUE_OCUPAN: readonly EstadoReserva[] = ["retenida", "pendiente", "confirmada"];

/** Reserva vista por el cálculo de disponibilidad (sin datos personales). */
export type ReservaDia = {
  id: string;
  maquinaId: string;
  repartidorId: string;
  localidadId: string;
  fecha: Fecha;
  inicio: Minutos;
  fin: Minutos;
  estado: EstadoReserva;
};

/**
 * Tramo sin servicio. Sin `maquinaId` ni `repartidorId` bloquea todo el
 * servicio (por ejemplo, un festivo); con `maquinaId`, solo esa máquina; con
 * `repartidorId`, solo ese repartidor (su día libre).
 */
export type Bloqueo = {
  maquinaId?: string;
  repartidorId?: string;
  fecha: Fecha;
  inicio: Minutos;
  fin: Minutos;
  motivo: "mantenimiento" | "festivo" | "manual";
};

/**
 * Cómo presta el repartidor el servicio:
 * - "deja_y_vuelve": monta la máquina, se va y vuelve a recogerla.
 * - "se_queda": permanece en la pista toda la sesión.
 */
export type ModoReparto = "deja_y_vuelve" | "se_queda";

/** Trabajo de un repartidor en un lugar y un tramo de tiempo. */
export type Tarea = {
  reservaId: string;
  tipo: "entrega" | "recogida" | "sesion_completa";
  localidadId: string;
  inicio: Minutos;
  fin: Minutos;
};
