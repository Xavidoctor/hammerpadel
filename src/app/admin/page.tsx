import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PageHead } from "@/components/PageHead";
import { localidades } from "@/content/catalogo";
import { COOKIE, leerCookie } from "@/lib/admin/sesion";
import { AJUSTES, MAQUINAS, REPARTIDORES } from "@/lib/reservas/ajustes";
import { RepositorioPostgres, type ReservaAdmin } from "@/lib/reservas/postgres";
import { enZona, hhmm } from "@/lib/reservas/tiempo";
import { db } from "@/lib/servidor/db";
import { borrarBloqueo, cambiarEstado, crearBloqueo, salir } from "./acciones";
import { Entrar } from "./Entrar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel de reservas", robots: { index: false, follow: false } };

const nombreLoc = (id: string) => localidades.find((l) => l.id === id)?.nombre ?? id;
const nombreRep = (id?: string | null) => REPARTIDORES.find((r) => r.id === id)?.nombre ?? id ?? "";
const fechaLarga = (f: string) =>
  new Date(`${f}T12:00:00Z`).toLocaleDateString("es-ES", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
const ESTADO_TEXTO: Record<string, string> = {
  pendiente: "Pendiente", confirmada: "Confirmada", cancelada: "Cancelada",
  completada: "Completada", no_presentado: "No se presentó", retenida: "Retenida",
};

function whatsapp(r: ReservaAdmin) {
  const tel = r.telefono.replace(/\D/g, "");
  const numero = tel.length === 9 ? `34${tel}` : tel;
  const texto = `Hola ${r.nombre}, te confirmamos tu sesión Hammer Padel el ${fechaLarga(r.fecha)} de ${hhmm(r.inicio)} a ${hhmm(r.fin)} en ${r.pista}. Descarga antes la app gratuita HammerPadel Control (iPhone y Android): con ella controlas la máquina por Bluetooth. ¡Nos vemos allí!`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function Acciones({ r }: { r: ReservaAdmin }) {
  const boton = (estado: string, texto: string, clase = "btn--ghost") => (
    <form action={cambiarEstado} key={estado}>
      <input type="hidden" name="id" value={r.id} />
      <input type="hidden" name="estado" value={estado} />
      <button type="submit" className={`btn ${clase} btn--sm`}>{texto}</button>
    </form>
  );
  if (r.estado === "pendiente") return <>{boton("confirmada", "Confirmar", "btn--accent")}{boton("cancelada", "Cancelar")}</>;
  if (r.estado === "confirmada")
    return <>{boton("completada", "Hecha")}{boton("no_presentado", "No vino")}{boton("cancelada", "Cancelar")}</>;
  return <>{boton("pendiente", "Reabrir")}</>;
}

export default async function Admin() {
  const quien = leerCookie((await cookies()).get(COOKIE)?.value);
  const conexion = db();

  if (!process.env.ADMIN_PASSWORD || !conexion) {
    return (
      <div className="page">
        <PageHead kicker="Panel" titulo="Reservas" />
        <p className="notice">El panel se activa al configurar DATABASE_URL y ADMIN_PASSWORD (ver docs/reservas.md).</p>
      </div>
    );
  }
  if (!quien) {
    return (
      <div className="page">
        <PageHead kicker="Panel" titulo="Reservas" />
        <Entrar />
      </div>
    );
  }

  const repo = new RepositorioPostgres(conexion);
  const hoy = enZona(new Date(), AJUSTES.zonaHoraria).fecha;
  const [reservas, bloqueos] = await Promise.all([repo.reservasDesde(hoy, 30), repo.bloqueosDesde(hoy)]);
  const pendientes = reservas.filter((r) => r.estado === "pendiente").length;
  const porDia = new Map<string, ReservaAdmin[]>();
  for (const r of reservas) porDia.set(r.fecha, [...(porDia.get(r.fecha) ?? []), r]);

  return (
    <div className="page admin">
      <PageHead kicker={`Panel · ${nombreRep(quien)}`} titulo="Reservas">
        <p className="lede">
          {pendientes > 0 ? `${pendientes} pendiente${pendientes > 1 ? "s" : ""} de confirmar.` : "Nada pendiente de confirmar."}
        </p>
        <form action={salir}><button type="submit" className="btn btn--ghost btn--sm">Salir</button></form>
      </PageHead>

      <section aria-labelledby="t-res" className="admin__bloque">
        <h2 id="t-res">Próximos 30 días</h2>
        {porDia.size === 0 && <p className="hint">No hay reservas.</p>}
        {[...porDia].map(([fecha, lista]) => (
          <div key={fecha} className="admin__dia">
            <h3>{fechaLarga(fecha)}</h3>
            <ul className="admin__lista">
              {lista.map((r) => (
                <li key={r.id} className={`admin__reserva admin__reserva--${r.estado}`}>
                  <div className="admin__cab">
                    <strong>{hhmm(r.inicio)}–{hhmm(r.fin)}</strong> · {nombreLoc(r.localidadId)}
                    <span className="admin__estado">{ESTADO_TEXTO[r.estado] ?? r.estado}</span>
                  </div>
                  <p>{r.pista}</p>
                  <p>
                    {r.nombre} · <a href={`tel:${r.telefono}`}>{r.telefono}</a> ·{" "}
                    <a href={whatsapp(r)} target="_blank" rel="noreferrer">WhatsApp</a> ·{" "}
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </p>
                  <p className="hint">{nombreRep(r.repartidorId)} · máquina {r.maquinaId}</p>
                  <div className="admin__acciones"><Acciones r={r} /></div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section aria-labelledby="t-blo" className="admin__bloque">
        <h2 id="t-blo">Bloquear horas</h2>
        <form action={crearBloqueo} className="form">
          <div className="fields">
            <div className="field">
              <label htmlFor="b-fecha">Día</label>
              <input id="b-fecha" name="fecha" type="date" required min={hoy} />
            </div>
            <div className="field">
              <label htmlFor="b-para">Para</label>
              <select id="b-para" name="para" defaultValue="">
                <option value="">Todo el servicio (festivo)</option>
                {REPARTIDORES.map((r) => <option key={r.id} value={r.id}>{r.nombre} (no trabaja)</option>)}
                {MAQUINAS.map((m) => <option key={m.id} value={m.id}>Máquina {m.id} (mantenimiento)</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="b-desde">Desde</label>
              <input id="b-desde" name="desde" type="time" defaultValue="08:00" />
            </div>
            <div className="field">
              <label htmlFor="b-hasta">Hasta</label>
              <input id="b-hasta" name="hasta" type="time" defaultValue="22:00" />
            </div>
            <div className="field">
              <label htmlFor="b-nota">Nota</label>
              <input id="b-nota" name="nota" maxLength={200} />
            </div>
          </div>
          <label className="check"><input type="checkbox" name="todo" /> <span>Todo el día</span></label>
          <div><button type="submit" className="btn btn--accent">Bloquear</button></div>
        </form>
        <ul className="admin__lista">
          {bloqueos.map((b) => (
            <li key={b.id} className="admin__reserva">
              <div className="admin__cab">
                <strong>{fechaLarga(b.fecha)}</strong>{" "}
                {b.inicio === 0 && (b.fin === 0 || b.fin === 1440) ? "todo el día" : `${hhmm(b.inicio)}–${hhmm(b.fin)}`}
              </div>
              <p>
                {b.repartidorId ? `${nombreRep(b.repartidorId)} no trabaja` : b.maquinaId ? `Máquina ${b.maquinaId}` : "Todo el servicio"}
                {b.nota ? ` · ${b.nota}` : ""}
              </p>
              <form action={borrarBloqueo}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="btn btn--ghost btn--sm">Quitar</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
