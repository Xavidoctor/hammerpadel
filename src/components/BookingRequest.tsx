"use client";

import Link from "next/link";

import { useId, useRef, useState } from "react";
import { alquiler, localidades, type LocalidadId } from "@/content/catalogo";
import type { DisponibilidadPublica } from "@/lib/reservas/consulta";

/**
 * Flujo de reserva en 4 pasos, independiente de cualquier animación.
 * Las horas vienen de /api/disponibilidad. Con base de datos, la reserva se
 * graba como pendiente y Xavi o Marc la confirman. Sin base de datos (modo
 * prototipo) no se envía nada.
 */

type Dia = DisponibilidadPublica["dias"][number];
type Estado = "inicial" | "cargando" | "listo" | "error";

const fmt = (fecha: string, o: Intl.DateTimeFormatOptions) =>
  new Date(`${fecha}T12:00:00Z`).toLocaleDateString("es-ES", { timeZone: "UTC", ...o });

export function BookingRequest() {
  const uid = useId();
  const [loc, setLoc] = useState<LocalidadId | "">("");
  const [estado, setEstado] = useState<Estado>("inicial");
  const [datos, setDatos] = useState<DisponibilidadPublica | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [enviado, setEnviado] = useState<"" | "prototipo" | "real">("");
  const [enviando, setEnviando] = useState(false);
  const peticion = useRef(0);

  async function cargar(id: LocalidadId) {
    const n = ++peticion.current;
    setEstado("cargando");
    try {
      const r = await fetch(`/api/disponibilidad?localidad=${encodeURIComponent(id)}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as DisponibilidadPublica;
      if (n !== peticion.current) return;
      setDatos(d);
      setEstado("listo");
    } catch {
      if (n === peticion.current) setEstado("error");
    }
  }

  function elegirLocalidad(id: LocalidadId) {
    setLoc(id);
    setFecha("");
    setHora("");
    setDatos(null);
    void cargar(id);
  }

  const dia: Dia | undefined = datos?.dias.find((d) => d.fecha === fecha);
  const franja = dia?.horas.find((h) => h.inicio === hora);
  const locNombre = localidades.find((l) => l.id === loc)?.nombre;
  const fechaLarga = fecha ? fmt(fecha, { weekday: "long", day: "numeric", month: "long" }) : "";

  async function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const texto = (k: string) => String(f.get(k) ?? "").trim();
    const e: string[] = [];
    if (!loc) e.push("Elige una localidad.");
    if (!fecha) e.push("Elige una fecha.");
    if (!franja) e.push("Elige una hora de inicio.");
    if (!texto("nombre")) e.push("Escribe tu nombre.");
    if (texto("telefono").replace(/[^\d]/g, "").length < 9) e.push("Escribe un teléfono de contacto.");
    if (!/^\S+@\S+\.\S+$/.test(texto("email"))) e.push("Escribe un email válido.");
    if (!texto("pista")) e.push("Indica el club o la pista donde entrenarás.");
    if (!f.get("acepto")) e.push("Acepta las condiciones para continuar.");
    setErrores(e);
    if (e.length > 0) return;
    if (!datos || datos.prototipo) {
      setEnviado("prototipo");
      return;
    }
    setEnviando(true);
    try {
      const r = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          localidad: loc, fecha, inicio: hora, nombre: texto("nombre"), telefono: texto("telefono"),
          email: texto("email"), pista: texto("pista"), acepto: true, web: texto("web"),
        }),
      });
      if (r.status === 201) {
        setEnviado("real");
        return;
      }
      const j = (await r.json().catch(() => ({}))) as { errores?: string[]; motivo?: string };
      setErrores(j.errores?.length ? j.errores : ["No se ha podido enviar la reserva. Inténtalo de nuevo."]);
      if (r.status === 409 && loc) {
        setHora("");
        void cargar(loc);
      }
    } catch {
      setErrores(["No se ha podido enviar la reserva. Revisa tu conexión e inténtalo de nuevo."]);
    } finally {
      setEnviando(false);
    }
  }

  if (enviado === "real" && franja) {
    return (
      <div className="result" role="status" aria-live="polite">
        <h2>Reserva recibida</h2>
        <p>
          {locNombre}, {fechaLarga}, de {franja.inicio} a {franja.fin}. {alquiler.resumen}, pago en efectivo en la sesión.
        </p>
        <p>
          Hemos apartado esta hora para ti. <strong>Xavi o Marc te llamarán o escribirán para
          confirmarla</strong> antes de la sesión.
        </p>
        <p>
          Antes de la sesión, descarga en tu móvil la app gratuita <strong>HammerPadel Control</strong>{" "}
          (iPhone y Android): con ella controlas la máquina por Bluetooth.
        </p>
      </div>
    );
  }

  if (enviado === "prototipo" && franja) {
    return (
      <div className="result" role="status" aria-live="polite">
        <h2>Solicitud preparada (prototipo)</h2>
        <p>
          {locNombre}, {fechaLarga}, de {franja.inicio} a {franja.fin}. {alquiler.resumen}, pago en efectivo en la sesión.
        </p>
        <p>
          En este prototipo <strong>no se envía nada</strong> ni se crea ninguna reserva. Cuando el
          sistema de reservas esté activo, aquí verás la confirmación.
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => setEnviado("")}>Volver</button>
      </div>
    );
  }

  return (
    <div className="booking">
      <form className="form" onSubmit={enviar} noValidate
        aria-describedby={datos?.prototipo !== false ? `${uid}-proto` : undefined}>
        {datos?.prototipo !== false && (
          <p className="notice" id={`${uid}-proto`}>
            <strong>Prototipo.</strong> Las horas siguen el horario real del servicio, pero todavía no
            se guardan reservas: no se tienen en cuenta las de otros clientes y no se envía nada.
          </p>
        )}

        <fieldset className="fieldset">
          <legend><span>1</span> Elige localidad</legend>
          <div className="choices">
            {localidades.map((l) => (
              <div className="choice" key={l.id}>
                <input type="radio" id={`${uid}-l-${l.id}`} name="localidad" value={l.id}
                  checked={loc === l.id} onChange={() => elegirLocalidad(l.id)} />
                <label htmlFor={`${uid}-l-${l.id}`}>{l.nombre}<small>Marina Alta</small></label>
              </div>
            ))}
          </div>
          <p className="hint">
            Te llevamos la máquina a tu pista: clubes, urbanizaciones y pistas privadas. Si es en un club,
            tú reservas la pista.
          </p>
        </fieldset>

        <fieldset className="fieldset" aria-busy={estado === "cargando"}>
          <legend><span>2</span> Elige fecha</legend>
          <div aria-live="polite">
            {estado === "inicial" && <p className="hint">Elige primero la localidad.</p>}
            {estado === "cargando" && <p className="hint">Buscando días disponibles…</p>}
            {estado === "error" && (
              <p className="error">
                No se han podido cargar los horarios.{" "}
                <button type="button" className="btn btn--ghost" onClick={() => loc && cargar(loc)}>Reintentar</button>
              </p>
            )}
          </div>
          {estado === "listo" && datos && (
            <div className="choices choices--dates">
              {datos.dias.map((d) => {
                const completo = d.horas.length === 0;
                const largo = fmt(d.fecha, { weekday: "long", day: "numeric", month: "long" });
                return (
                  <div className="choice" key={d.fecha}>
                    <input type="radio" id={`${uid}-d-${d.fecha}`} name="fecha" value={d.fecha}
                      disabled={completo} checked={fecha === d.fecha}
                      onChange={() => { setFecha(d.fecha); setHora(""); }} />
                    <label htmlFor={`${uid}-d-${d.fecha}`} aria-label={completo ? `${largo}, completo` : largo}>
                      <small>{fmt(d.fecha, { weekday: "short" })}</small>
                      {fmt(d.fecha, { day: "numeric", month: "short" })}
                      {completo && <small>Completo</small>}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend><span>3</span> Elige hora de inicio</legend>
          {!dia ? (
            <p className="hint">Elige una fecha para ver las horas libres. Sesiones de {alquiler.duracionTexto}.</p>
          ) : (
            <div className="choices choices--horas">
              {dia.horas.map((h) => (
                <div className="choice" key={h.inicio}>
                  <input type="radio" id={`${uid}-h-${h.inicio}`} name="hora" value={h.inicio}
                    checked={hora === h.inicio} onChange={() => setHora(h.inicio)} />
                  <label htmlFor={`${uid}-h-${h.inicio}`} aria-label={`De ${h.inicio} a ${h.fin}`}>
                    {h.inicio}<small>hasta {h.fin}</small>
                  </label>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend><span>4</span> Tus datos</legend>
          <div className="fields">
            <div className="field">
              <label htmlFor={`${uid}-n`}>Nombre</label>
              <input id={`${uid}-n`} name="nombre" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-t`}>Teléfono</label>
              <input id={`${uid}-t`} name="telefono" type="tel" autoComplete="tel" required
                aria-describedby={`${uid}-t-h`} />
              <p className="hint" id={`${uid}-t-h`}>Para avisarte si surge un imprevisto con la entrega.</p>
            </div>
            <div className="field">
              <label htmlFor={`${uid}-e`}>Email</label>
              <input id={`${uid}-e`} name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-p`}>Club o pista</label>
              <input id={`${uid}-p`} name="pista" required aria-describedby={`${uid}-p-h`} />
              <p className="hint" id={`${uid}-p-h`}>
                Club y número de pista, o la dirección de la urbanización o pista privada.
              </p>
            </div>
          </div>
          <label className="check">
            <input type="checkbox" name="acepto" />
            <span>
              Acepto las <Link href="/legal/condiciones-alquiler">condiciones de alquiler</Link> (entre ellas, 1 € por
              cada pelota perdida) y la <Link href="/legal/privacidad">política de privacidad</Link>.
            </span>
          </label>
          <div className="trampa" aria-hidden="true">
            <label htmlFor={`${uid}-w`}>No rellenes este campo</label>
            <input id={`${uid}-w`} name="web" tabIndex={-1} autoComplete="off" />
          </div>
          {errores.length > 0 && (
            <div role="alert">
              {errores.map((e) => <p className="error" key={e}>{e}</p>)}
            </div>
          )}
          <div className="cta-row">
            <button type="submit" className="btn btn--accent btn--lg" disabled={enviando}>
              {enviando ? "Enviando…" : "Solicitar reserva"}
            </button>
          </div>
          <p className="hint">
            Pago en efectivo en la sesión. Xavi o Marc confirman cada reserva por teléfono o WhatsApp.
          </p>
        </fieldset>
      </form>

      <aside className="summary" aria-label="Resumen de la reserva">
        <h2>Tu sesión</h2>
        <dl>
          <div><dt>Localidad</dt><dd>{locNombre ?? "Sin elegir"}</dd></div>
          <div><dt>Fecha</dt><dd>{fecha ? fechaLarga : "Sin elegir"}</dd></div>
          <div><dt>Horario</dt><dd>{franja ? `${franja.inicio}–${franja.fin}` : "Sin elegir"}</dd></div>
          <div><dt>Duración</dt><dd>{alquiler.duracionTexto}</dd></div>
          <div><dt>Precio</dt><dd>{alquiler.precioTexto}</dd></div>
          <div><dt>Incluye</dt><dd>{alquiler.incluyeTexto}</dd></div>
          <div><dt>Pago</dt><dd>Efectivo en la sesión</dd></div>
        </dl>
      </aside>
    </div>
  );
}
