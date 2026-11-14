import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { beforeAll, describe, expect, it } from "vitest";

// Prueba el esquema propuesto en un PostgreSQL embebido (sin servicios externos).
const sql = readFileSync(path.resolve(__dirname, "../../../db/esquema.sql"), "utf8");
let db: PGlite;
let cliente: string;

const reservar = (maquina: string, desde: string, hasta: string, estado = "confirmada") =>
  db.query(
    `insert into reservas (cliente_id, localidad_id, pista, maquina_id, repartidor_id, tarifa_id, sesion, ciclo, estado, precio_centimos)
     values ($1, 'denia', 'Pista 1', $2, 'xavi', 'sesion-90',
             tstzrange($3::timestamptz, $4::timestamptz),
             tstzrange($3::timestamptz - interval '15 min', $4::timestamptz + interval '15 min'), $5, 2000)
     returning id`,
    [cliente, maquina, desde, hasta, estado],
  );

beforeAll(async () => {
  db = new PGlite({ extensions: { btree_gist } });
  await db.exec(sql);
  const r = await db.query<{ id: string }>(
    "insert into clientes (nombre, telefono, email) values ('Prueba', '600000000', 'p@example.com') returning id",
  );
  cliente = r.rows[0].id;
}, 30_000);

describe("esquema de reservas", () => {
  it("carga los datos confirmados", async () => {
    const n = await db.query<{ m: number; r: number; l: number }>(
      "select (select count(*) from maquinas)::int m, (select count(*) from repartidores)::int r, (select count(*) from localidades)::int l",
    );
    expect(n.rows[0]).toEqual({ m: 5, r: 2, l: 4 });
  });

  it("una máquina no admite dos ciclos solapados, aunque lleguen a la vez", async () => {
    await reservar("hp-1", "2026-11-19 10:00+01", "2026-11-19 11:30+01");
    await expect(reservar("hp-1", "2026-11-19 11:30+01", "2026-11-19 13:00+01")).rejects.toThrow(/maquina_sin_solape/);
    await expect(reservar("hp-2", "2026-11-19 11:30+01", "2026-11-19 13:00+01")).resolves.toBeTruthy();
    await expect(reservar("hp-1", "2026-11-19 12:00+01", "2026-11-19 13:30+01")).resolves.toBeTruthy();
  });

  it("las reservas canceladas no ocupan la máquina", async () => {
    await reservar("hp-3", "2026-11-20 10:00+01", "2026-11-20 11:30+01", "cancelada");
    await expect(reservar("hp-3", "2026-11-20 10:00+01", "2026-11-20 11:30+01")).resolves.toBeTruthy();
  });

  it("el ciclo debe contener la sesión", async () => {
    await expect(
      db.query(
        `insert into reservas (cliente_id, localidad_id, pista, maquina_id, repartidor_id, tarifa_id, sesion, ciclo, precio_centimos)
         values ($1, 'denia', 'P', 'hp-4', 'marc', 'sesion-90', '[2026-11-21 10:00+01, 2026-11-21 11:30+01)', '[2026-11-21 10:00+01, 2026-11-21 11:00+01)', 2000)`,
        [cliente],
      ),
    ).rejects.toThrow(/check/i);
  });
});
