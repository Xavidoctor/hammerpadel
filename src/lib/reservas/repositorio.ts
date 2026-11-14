import { MAQUINAS, REPARTIDORES } from "./ajustes";
import type { DatosDia } from "./disponibilidad";
import type { Fecha } from "./tipos";

/**
 * Acceso a los datos de reservas. En la fase B se añadirá la implementación
 * con PostgreSQL; el resto del código no cambia.
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

export function repositorio(): RepositorioReservas {
  return repositorioPrototipo;
}
