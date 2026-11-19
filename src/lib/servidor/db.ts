import { Pool } from "pg";

/**
 * Acceso mínimo a PostgreSQL. En producción, Neon (DATABASE_URL); en las
 * pruebas, PostgreSQL embebido con el mismo interfaz.
 */
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  transaccion<R>(fn: (tx: Db) => Promise<R>): Promise<R>;
}

export function dbDesdePool(pool: Pool): Db {
  return {
    async query<T>(sql: string, params?: unknown[]) {
      return (await pool.query(sql, params)).rows as T[];
    },
    async transaccion(fn) {
      const c = await pool.connect();
      const tx: Db = {
        async query<T>(sql: string, params?: unknown[]) {
          return (await c.query(sql, params)).rows as T[];
        },
        transaccion: (f) => f(tx),
      };
      try {
        await c.query("begin");
        const r = await fn(tx);
        await c.query("commit");
        return r;
      } catch (e) {
        await c.query("rollback");
        throw e;
      } finally {
        c.release();
      }
    },
  };
}

let instancia: Db | null | undefined;

/** null mientras no haya DATABASE_URL: la web funciona en modo prototipo. */
export function db(): Db | null {
  if (instancia !== undefined) return instancia;
  const url = process.env.DATABASE_URL;
  instancia = url ? dbDesdePool(new Pool({ connectionString: url, max: 3 })) : null;
  return instancia;
}
