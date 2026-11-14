import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { beforeEach, describe, expect, it } from "vitest";
import { AJUSTES } from "./ajustes";
import { horasLibres } from "./disponibilidad";
import { RepositorioPostgres, type SolicitudReserva } from "./postgres";
import { validarSolicitud } from "./solicitud";
import type { Db } from "../servidor/db";

const sql = readFileSync(path.resolve(__dirname, "../../../db/esquema.sql"), "utf8");

function dbDesdePglite(pg: PGlite): Db {
  const envolver = (q: Pick<PGlite, "query">): Db => ({
    async query<T>(s: string, p?: unknown[]) {
      return (await q.query<T>(s, p)).rows;
    },
    transaccion: (fn) => pg.transaction((tx) => fn(envolver(tx))),
  });
  return envolver(pg);
}

const AHORA = new Date("2026-11-14T09:00:00Z"); // sábado 10:00 en Madrid
const FECHA = "2026-11-19";
let repo: RepositorioPostgres;
let pg: PGlite;

const solicitud = (p: Partial<SolicitudReserva> = {}): SolicitudReserva => ({
  localidadId: "denia",
  fecha: FECHA,
  inicio: 600,
  nombre: "Cliente de prueba",
  telefono: "600000001",
  email: "c1@example.com",
  pista: "Club de prueba, pista 1",
  ...p,
});

beforeEach(async () => {
  pg = new PGlite({ extensions: { btree_gist } });
  await pg.exec(sql);
  repo = new RepositorioPostgres(dbDesdePglite(pg), AJUSTES);
}, 30_000);

describe("RepositorioPostgres", () => {
  it("graba una reserva pendiente y la lee con la hora de Madrid", async () => {
    const r = await repo.crearReserva(solicitud(), AHORA);
    expect(r).toMatchObject({ ok: true, repartidorId: "marc", maquinaId: "hp-1" });
    const [fila] = await repo.reservasDesde(FECHA, 1);
    expect(fila).toMatchObject({ inicio: 600, fin: 690, estado: "pendiente", localidadId: "denia", precioCentimos: 2500 });
    const dia = await repo.datosDia(FECHA);
    expect(dia.reservas).toHaveLength(1);
    expect(dia.reservas[0]).toMatchObject({ inicio: 600, fin: 690, repartidorId: "marc" });
  });

  it("guarda la hora en UTC correctamente en horario de verano", async () => {
    const verano = new Date("2027-07-01T06:00:00Z");
    await repo.crearReserva(solicitud({ fecha: "2027-07-05" }), verano);
    expect((await pg.query<{ utc: string }>("select to_char(lower(sesion) at time zone 'UTC', 'HH24:MI') utc from reservas")).rows[0].utc).toBe("08:00");
  });

  it("la tercera reserva a la misma hora no cabe: solo hay dos repartidores", async () => {
    expect((await repo.crearReserva(solicitud(), AHORA)).ok).toBe(true);
    expect((await repo.crearReserva(solicitud({ localidadId: "la-xara", telefono: "600000002", email: "c2@example.com" }), AHORA)).ok).toBe(true);
    const tercera = await repo.crearReserva(solicitud({ localidadId: "ondara", telefono: "600000003", email: "c3@example.com" }), AHORA);
    expect(tercera).toEqual({ ok: false, motivo: "sin_repartidor" });
  });

  it("las reservas grabadas reducen las horas libres", async () => {
    await repo.crearReserva(solicitud(), AHORA);
    await repo.crearReserva(solicitud({ localidadId: "la-xara", telefono: "600000002", email: "c2@example.com" }), AHORA);
    const dia = await repo.datosDia(FECHA);
    const libres = horasLibres(AJUSTES, dia, { localidadId: "ondara", minInicio: -Infinity }).map((h) => h.inicio);
    expect(libres).not.toContain(600);
    expect(libres).toContain(480);
  });

  it("limita las reservas de un mismo cliente en un día", async () => {
    await repo.crearReserva(solicitud({ inicio: 480 }), AHORA);
    await repo.crearReserva(solicitud({ inicio: 720 }), AHORA);
    expect(await repo.crearReserva(solicitud({ inicio: 960 }), AHORA)).toEqual({ ok: false, motivo: "limite" });
  });

  it("rechaza fechas fuera de la ventana y horas sin antelación", async () => {
    expect(await repo.crearReserva(solicitud({ fecha: "2026-12-30" }), AHORA)).toEqual({ ok: false, motivo: "fecha" });
    expect(await repo.crearReserva(solicitud({ fecha: "2026-11-14", inicio: 900 }), AHORA)).toEqual({ ok: false, motivo: "antelacion" });
    expect((await repo.crearReserva(solicitud({ fecha: "2026-11-14", inicio: 990 }), AHORA)).ok).toBe(true);
  });

  it("cancelar libera la hora y queda en el historial", async () => {
    const r = await repo.crearReserva(solicitud(), AHORA);
    if (!r.ok) throw new Error("no creada");
    await repo.crearReserva(solicitud({ localidadId: "la-xara", telefono: "600000002", email: "c2@example.com" }), AHORA);
    expect(await repo.cambiarEstado(r.id, "cancelada", "xavi")).toBe(true);
    const otra = await repo.crearReserva(solicitud({ localidadId: "ondara", telefono: "600000003", email: "c3@example.com" }), AHORA);
    expect(otra.ok).toBe(true);
    const h = await pg.query<{ tipo: string }>("select tipo from historial_reservas where reserva_id = $1 order by id", [r.id]);
    expect(h.rows.map((x) => x.tipo)).toEqual(["creada", "cancelada"]);
  });

  it("un bloqueo de todo el día cierra el servicio y se puede borrar", async () => {
    await repo.crearBloqueo({ fecha: FECHA, fechaFin: "2026-11-20", inicio: 0, fin: 0, motivo: "festivo" });
    expect(await repo.crearReserva(solicitud(), AHORA)).toEqual({ ok: false, motivo: "bloqueado" });
    const [b] = await repo.bloqueosDesde("2026-11-14");
    expect(b).toMatchObject({ fecha: FECHA, inicio: 0, fechaFin: "2026-11-20", fin: 0 });
    await repo.borrarBloqueo(b.id);
    expect((await repo.crearReserva(solicitud(), AHORA)).ok).toBe(true);
  });

  it("el día libre de Marc deja solo a Xavi", async () => {
    await repo.crearBloqueo({ fecha: FECHA, fechaFin: FECHA, inicio: 480, fin: 1380, repartidorId: "marc", motivo: "manual" });
    expect((await repo.crearReserva(solicitud(), AHORA)).ok).toBe(true);
    const r = await repo.crearReserva(solicitud({ localidadId: "la-xara", telefono: "600000002", email: "c2@example.com" }), AHORA);
    expect(r).toEqual({ ok: false, motivo: "sin_repartidor" });
  });
});

describe("validarSolicitud", () => {
  const valida = {
    localidad: "denia", fecha: FECHA, inicio: "10:00", nombre: "Ana", telefono: "600 000 000",
    email: "ana@example.com", pista: "Urbanización Les Rotes, pista privada", acepto: true,
  };
  it("acepta una solicitud correcta", () => {
    expect(validarSolicitud(valida)).toMatchObject({ ok: true, datos: { inicio: 600, telefono: "600000000" } });
  });
  it("rechaza datos que faltan o son falsos", () => {
    const r = validarSolicitud({ ...valida, localidad: "madrid", inicio: "10h", acepto: "true", email: "x" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores).toHaveLength(4);
  });
  it("descarta bots que rellenan el campo trampa", () => {
    expect(validarSolicitud({ ...valida, web: "http://spam" })).toMatchObject({ ok: false, bot: true });
  });
});
