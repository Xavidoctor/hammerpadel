import { AJUSTES, type Ajustes } from "./ajustes";
import { fechasReservables, horasLibres, minInicioDelDia } from "./disponibilidad";
import type { RepositorioReservas } from "./repositorio";
import { hhmm } from "./tiempo";
import type { Fecha } from "./tipos";

export type DiaPublico = { fecha: Fecha; diaSemana: number; horas: { inicio: string; fin: string }[] };

export type DisponibilidadPublica = {
  localidad: string;
  prototipo: boolean;
  duracionMinutos: number;
  dias: DiaPublico[];
};

/**
 * Lo que ve el público: horas libres por día. No incluye máquinas,
 * repartidores ni datos de otras reservas.
 */
export async function disponibilidadPublica(
  repo: RepositorioReservas,
  localidad: string,
  ahora: Date,
  aj: Ajustes = AJUSTES,
): Promise<DisponibilidadPublica> {
  const dias = await Promise.all(
    fechasReservables(aj, ahora).map(async ({ fecha, diaSemana }) => {
      const datos = await repo.datosDia(fecha);
      const minInicio = minInicioDelDia(aj, fecha, ahora);
      const horas = horasLibres(aj, datos, { localidadId: localidad, minInicio }).map((x) => ({
        inicio: hhmm(x.inicio),
        fin: hhmm(x.fin),
      }));
      return { fecha, diaSemana, horas };
    }),
  );
  return { localidad, prototipo: repo.prototipo, duracionMinutos: aj.duracion, dias };
}
