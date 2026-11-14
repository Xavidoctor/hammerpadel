import { MAQUINAS, REPARTIDORES } from "./ajustes";
import type { DatosDia } from "./disponibilidad";
import type { Fecha } from "./tipos";

/**
 * Acceso a los datos de reservas: PostgreSQL (postgres.ts) o, sin base de
 * datos configurada, el prototipo sin reservas.
 */
export interface RepositorioReservas {
  /** true mientras no haya base de datos: no hay reservas de otros clientes. */
  readonly prototipo: boolean;
  datosDia(fecha: Fecha): Promise<DatosDia>;
}

/** Prototipo: flota y repartidores confirmados, sin reservas ni bloqueos guardados. */
export const repositorioPrototipo: RepositorioReservas = {
  prototipo: true,
  async datosDia(fecha) {
    return { fecha, maquinas: MAQUINAS, repartidores: REPARTIDORES, reservas: [], bloqueos: [] };
  },
};

/** Postgres si hay DATABASE_URL; si no, prototipo. Solo en el servidor. */
export async function repositorio(): Promise<RepositorioReservas> {
  const { db } = await import("../servidor/db");
  const conexion = db();
  if (!conexion) return repositorioPrototipo;
  const { RepositorioPostgres } = await import("./postgres");
  return new RepositorioPostgres(conexion);
}
