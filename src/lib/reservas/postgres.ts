import { alquiler } from "@/content/catalogo";
import { AJUSTES, type Ajustes } from "./ajustes";
import { comprobarHora, fechaReservable, minInicioDelDia, type DatosDia, type Motivo } from "./disponibilidad";
import type { RepositorioReservas } from "./repositorio";
import { ESTADOS_QUE_OCUPAN, type Bloqueo, type EstadoReserva, type Fecha, type Minutos } from "./tipos";
import type { Db } from "../servidor/db";

const ACTIVOS = `('${ESTADOS_QUE_OCUPAN.join("','")}')`;

/** SQL: fecha local + minutos → timestamptz. */
const instante = (fecha: string, minutos: string, tz: string) =>
  `((${fecha}::date + make_interval(mins => ${minutos}::int)) at time zone ${tz})`;

/** SQL: minutos locales de un timestamptz respecto a la medianoche de `fecha`. */
const minutosLocales = (col: string, fecha: string, tz: string) =>
  `(extract(epoch from ((${col}) at time zone ${tz}) - ${fecha}::date::timestamp) / 60)::int`;

export type SolicitudReserva = {
  localidadId: string;
  fecha: Fecha;
  inicio: Minutos;
  nombre: string;
  telefono: string;
  email: string;
  pista: string;
  /** Recogebolas extra (la sesión ya incluye uno). Suma alquiler.recogebolasExtraCentimos. */
  segundoRecogebolas?: boolean;
};

export type ResultadoCrear =
  | { ok: true; id: string; repartidorId: string; maquinaId: string }
  | { ok: false; motivo: Motivo | "fecha" | "limite" | "ocupada" };

export type ReservaAdmin = {
  id: string;
  fecha: Fecha;
  inicio: Minutos;
  fin: Minutos;
  localidadId: string;
  pista: string;
  segundoRecogebolas: boolean;
  estado: EstadoReserva;
  maquinaId: string;
  repartidorId: string;
  nombre: string;
  telefono: string;
  email: string;
  precioCentimos: number;
  creada: string;
};

export type BloqueoAdmin = Bloqueo & { id: number; fechaFin: Fecha; nota: string | null };

/** Máximo de reservas activas de un mismo cliente en un mismo día (anti-abuso). */
export const MAX_RESERVAS_CLIENTE_DIA = 2;

export class RepositorioPostgres implements RepositorioReservas {
  readonly prototipo = false;
  constructor(
    private readonly db: Db,
    private readonly aj: Ajustes = AJUSTES,
  ) {}

  private get tz() {
    return `'${this.aj.zonaHoraria.replace(/'/g, "")}'`;
  }

  datosDia(fecha: Fecha, db: Db = this.db): Promise<DatosDia> {
    return leerDia(db, fecha, this.tz);
  }

  async crearReserva(s: SolicitudReserva, ahora: Date): Promise<ResultadoCrear> {
    const aj = this.aj;
    if (!fechaReservable(aj, s.fecha, ahora)) return { ok: false, motivo: "fecha" };
    try {
      return await this.db.transaccion(async (tx) => {
        // Las reservas se graban de una en una: el cálculo de trayectos de los
        // repartidores no cabe en una restricción de la base de datos.
        await tx.query("select pg_advisory_xact_lock(7240001)");
        const dia = await leerDia(tx, s.fecha, this.tz);
        const r = comprobarHora(aj, dia, {
          localidadId: s.localidadId,
          inicio: s.inicio,
          minInicio: minInicioDelDia(aj, s.fecha, ahora),
        });
        if (!r.ok) return r;

        const [cliente] = await tx.query<{ id: string }>(
          `insert into clientes (nombre, telefono, email) values ($1, $2, $3)
           on conflict (telefono, email) do update set nombre = excluded.nombre
           returning id`,
          [s.nombre, s.telefono, s.email],
        );
        const [{ n }] = await tx.query<{ n: number }>(
          `select count(*)::int n from reservas
            where cliente_id = $1 and estado in ${ACTIVOS}
              and (lower(sesion) at time zone ${this.tz})::date = $2::date`,
          [cliente.id, s.fecha],
        );
        if (n >= MAX_RESERVAS_CLIENTE_DIA) return { ok: false as const, motivo: "limite" as const };

        const [tarifa] = await tx.query<{ id: string; precio_centimos: number }>(
          "select id, precio_centimos from tarifas where activa and duracion_min = $1 order by id limit 1",
          [aj.duracion],
        );
        const [fila] = await tx.query<{ id: string }>(
          `insert into reservas (cliente_id, localidad_id, pista, maquina_id, repartidor_id, tarifa_id,
                                 sesion, ciclo, estado, precio_centimos, forma_pago, recogebolas_extra)
           values ($1, $2, $3, $4, $5, $6,
                   tstzrange(${instante("$7", "$8", this.tz)}, ${instante("$7", "$9", this.tz)}),
                   tstzrange(${instante("$7", "$10", this.tz)}, ${instante("$7", "$11", this.tz)}),
                   'pendiente', $12, 'efectivo', $13)
           returning id`,
          [
            cliente.id, s.localidadId, s.pista, r.maquinaId, r.repartidorId, tarifa.id,
            s.fecha, r.inicio, r.fin, r.inicio - aj.montaje, r.fin + aj.recogida,
            tarifa.precio_centimos + (s.segundoRecogebolas ? alquiler.recogebolasExtraCentimos : 0),
            s.segundoRecogebolas === true,
          ],
        );
        await tx.query(
          "insert into historial_reservas (reserva_id, tipo, datos) values ($1, 'creada', $2)",
          [fila.id, JSON.stringify({ origen: "web" })],
        );
        return { ok: true as const, id: fila.id, repartidorId: r.repartidorId, maquinaId: r.maquinaId };
      });
    } catch (e) {
      // Restricción maquina_sin_solape: otra reserva se ha grabado a la vez.
      if ((e as { code?: string }).code === "23P01") return { ok: false, motivo: "ocupada" };
      throw e;
    }
  }

  async reservasDesde(fecha: Fecha, dias: number): Promise<ReservaAdmin[]> {
    const tz = this.tz;
    return this.db.query<ReservaAdmin>(
      `select r.id, d.fecha::text as fecha,
              ${minutosLocales("lower(r.sesion)", "d.fecha", tz)} as inicio,
              ${minutosLocales("upper(r.sesion)", "d.fecha", tz)} as fin,
              r.localidad_id as "localidadId", r.pista, r.recogebolas_extra as "segundoRecogebolas", r.estado,
              r.maquina_id as "maquinaId", r.repartidor_id as "repartidorId",
              c.nombre, c.telefono, c.email, r.precio_centimos as "precioCentimos", r.creada::text as creada
         from reservas r
         join clientes c on c.id = r.cliente_id
         cross join lateral (select (lower(r.sesion) at time zone ${tz})::date as fecha) d
        where d.fecha >= $1::date and d.fecha < $1::date + $2::int
        order by lower(r.sesion), r.creada`,
      [fecha, dias],
    );
  }

  async cambiarEstado(id: string, estado: EstadoReserva, quien: string): Promise<boolean> {
    return this.db.transaccion(async (tx) => {
      const filas = await tx.query("update reservas set estado = $2 where id = $1 returning id", [id, estado]);
      if (filas.length === 0) return false;
      await tx.query("insert into historial_reservas (reserva_id, tipo, datos) values ($1, $2, $3)", [
        id, estado, JSON.stringify({ quien }),
      ]);
      return true;
    });
  }

  async crearBloqueo(b: {
    fecha: Fecha; fechaFin: Fecha; inicio: Minutos; fin: Minutos;
    maquinaId?: string; repartidorId?: string; motivo: Bloqueo["motivo"]; nota?: string;
  }): Promise<void> {
    await this.db.query(
      `insert into bloqueos (maquina_id, repartidor_id, periodo, motivo, nota)
       values ($1, $2, tstzrange(${instante("$3", "$4", this.tz)}, ${instante("$5", "$6", this.tz)}), $7, $8)`,
      [b.maquinaId ?? null, b.repartidorId ?? null, b.fecha, b.inicio, b.fechaFin, b.fin, b.motivo, b.nota ?? null],
    );
  }

  async bloqueosDesde(fecha: Fecha): Promise<BloqueoAdmin[]> {
    const tz = this.tz;
    return this.db.query<BloqueoAdmin>(
      `select b.id, d.fecha::text as fecha, f.fecha::text as "fechaFin",
              ${minutosLocales("lower(b.periodo)", "d.fecha", tz)} as inicio,
              ${minutosLocales("upper(b.periodo)", "f.fecha", tz)} as fin,
              b.maquina_id as "maquinaId", b.repartidor_id as "repartidorId", b.motivo, b.nota
         from bloqueos b
         cross join lateral (select (lower(b.periodo) at time zone ${tz})::date as fecha) d
         cross join lateral (select (upper(b.periodo) at time zone ${tz})::date as fecha) f
        where upper(b.periodo) >= ${instante("$1", "0", tz)}
        order by lower(b.periodo)`,
      [fecha],
    );
  }

  async borrarBloqueo(id: number): Promise<void> {
    await this.db.query("delete from bloqueos where id = $1", [id]);
  }
}

async function leerDia(db: Db, fecha: Fecha, tz: string): Promise<DatosDia> {
  const maquinas = await db.query<DatosDia["maquinas"][number]>("select id, estado from maquinas order by id");
  const repartidores = await db.query<DatosDia["repartidores"][number]>(
    "select id, nombre from repartidores where activo order by id",
  );
  const reservas = await db.query<DatosDia["reservas"][number]>(
    `select id, maquina_id as "maquinaId", repartidor_id as "repartidorId", localidad_id as "localidadId",
            $1::text as fecha, estado,
            ${minutosLocales("lower(sesion)", "$1", tz)} as inicio,
            ${minutosLocales("upper(sesion)", "$1", tz)} as fin
       from reservas
      where estado in ${ACTIVOS} and (lower(sesion) at time zone ${tz})::date = $1::date`,
    [fecha],
  );
  const dia = `tstzrange(${instante("$1", "0", tz)}, ${instante("$1", "1440", tz)})`;
  const bloqueos = await db.query<Bloqueo & { maquinaId: string | null; repartidorId: string | null }>(
    `select maquina_id as "maquinaId", repartidor_id as "repartidorId", motivo, $1::text as fecha,
            greatest(0, ${minutosLocales("lower(periodo)", "$1", tz)}) as inicio,
            least(1440, ${minutosLocales("upper(periodo)", "$1", tz)}) as fin
       from bloqueos where periodo && ${dia}`,
    [fecha],
  );
  return {
    fecha,
    maquinas,
    repartidores,
    reservas,
    bloqueos: bloqueos.map((b) => ({
      ...b,
      maquinaId: b.maquinaId ?? undefined,
      repartidorId: b.repartidorId ?? undefined,
    })),
  };
}
