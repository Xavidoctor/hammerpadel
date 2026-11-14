"use client";

import Link from "next/link";
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { alquiler, localidades, type LocalidadId } from "@/content/catalogo";

/**
 * Flujo de reserva en 4 pasos, independiente de cualquier animación.
 * PROTOTIPO: no hay calendario real ni backend. No se muestran horarios como
 * disponibles; el paso 3 recoge una franja preferida. Nada se envía.
 */
const FRANJAS = [
  { id: "manana", texto: "Mañana" },
  { id: "mediodia", texto: "Mediodía" },
  { id: "tarde", texto: "Tarde" },
  { id: "noche", texto: "Noche" },
] as const;

/** Cuando exista el backend aprobado, aquí llegarán los huecos reales. */
const CALENDARIO_ACTIVO = false;

function proximosDias(n: number) {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return {
      iso,
      dia: d.toLocaleDateString("es-ES", { weekday: "short" }),
      num: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
      largo: d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }),
    };
  });
}

const noop = () => () => {};

export function BookingRequest() {
  const uid = useId();
  // Las fechas dependen del día del visitante: solo en cliente.
  const enCliente = useSyncExternalStore(noop, () => true, () => false);
  const dias = useMemo(() => (enCliente ? proximosDias(14) : null), [enCliente]);
  const [loc, setLoc] = useState<LocalidadId | "">("");
  const [fecha, setFecha] = useState("");
  const [franja, setFranja] = useState("");
  const [errores, setErrores] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);

  const fechaLarga = useMemo(() => dias?.find((d) => d.iso === fecha)?.largo ?? fecha, [dias, fecha]);
  const locNombre = localidades.find((l) => l.id === loc)?.nombre;

  function enviar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const e: string[] = [];
    if (!loc) e.push("Elige una localidad.");
    if (!fecha) e.push("Elige una fecha.");
    if (!franja) e.push("Elige una franja horaria.");
    if (!String(f.get("nombre") ?? "").trim()) e.push("Escribe tu nombre.");
    if (!/^\S+@\S+\.\S+$/.test(String(f.get("email") ?? ""))) e.push("Escribe un email válido.");
    if (!f.get("acepto")) e.push("Acepta las condiciones para continuar.");
    setErrores(e);
    if (e.length === 0) setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="result" role="status" aria-live="polite">
        <h2>Solicitud preparada (prototipo)</h2>
        <p>
          {locNombre}, {fechaLarga}, franja de {FRANJAS.find((x) => x.id === franja)?.texto.toLowerCase()}.
          {" "}{alquiler.resumen}.
        </p>
        <p>
          En este prototipo <strong>no se envía nada</strong> ni se crea ninguna reserva. Cuando el
          calendario real esté activo, aquí verás la confirmación.
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => setEnviado(false)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="booking">
      <form className="form" onSubmit={enviar} noValidate aria-describedby={`${uid}-proto`}>
        <p className="notice" id={`${uid}-proto`}>
          <strong>Prototipo.</strong> El calendario real todavía no está activo: no mostramos horarios
          como disponibles y no se crea ninguna reserva.
        </p>

        <fieldset className="fieldset">
          <legend><span>1</span> Elige localidad</legend>
          <div className="choices">
            {localidades.map((l) => (
              <div className="choice" key={l.id}>
                <input type="radio" id={`${uid}-l-${l.id}`} name="localidad" value={l.id}
                  checked={loc === l.id} onChange={() => setLoc(l.id)} />
                <label htmlFor={`${uid}-l-${l.id}`}>{l.nombre}<small>Marina Alta</small></label>
              </div>
            ))}
          </div>
          <p className="hint">Ubicación exacta y forma de entrega pendientes de definir.</p>
        </fieldset>

        <fieldset className="fieldset">
          <legend><span>2</span> Elige fecha</legend>
          {dias ? (
            <div className="choices choices--dates">
              {dias.map((d) => (
                <div className="choice" key={d.iso}>
                  <input type="radio" id={`${uid}-d-${d.iso}`} name="fecha" value={d.iso}
                    checked={fecha === d.iso} onChange={() => setFecha(d.iso)} />
                  <label htmlFor={`${uid}-d-${d.iso}`} aria-label={d.largo}>
                    <small>{d.dia}</small>{d.num}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <div className="field">
              <label htmlFor={`${uid}-fecha`}>Fecha</label>
              <input id={`${uid}-fecha`} type="date" name="fecha" onChange={(e) => setFecha(e.target.value)} />
            </div>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend><span>3</span> Elige horario</legend>
          {CALENDARIO_ACTIVO ? null : (
            <p className="hint">
              Los horarios disponibles aparecerán aquí cuando el calendario esté activo. Por ahora,
              indica la franja que prefieres.
            </p>
          )}
          <div className="choices">
            {FRANJAS.map((x) => (
              <div className="choice" key={x.id}>
                <input type="radio" id={`${uid}-f-${x.id}`} name="franja" value={x.id}
                  checked={franja === x.id} onChange={() => setFranja(x.id)} />
                <label htmlFor={`${uid}-f-${x.id}`}>{x.texto}<small>preferencia</small></label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend><span>4</span> Reserva</legend>
          <div className="fields">
            <div className="field">
              <label htmlFor={`${uid}-n`}>Nombre</label>
              <input id={`${uid}-n`} name="nombre" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-e`}>Email</label>
              <input id={`${uid}-e`} name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-t`}>Teléfono (opcional)</label>
              <input id={`${uid}-t`} name="telefono" type="tel" autoComplete="tel" />
            </div>
          </div>
          <label className="check">
            <input type="checkbox" name="acepto" />
            <span>Acepto las <Link href="/legal/condiciones-alquiler">condiciones de alquiler</Link> y he leído la <Link href="/legal/privacidad">política de privacidad</Link>.</span>
          </label>
          {errores.length > 0 && (
            <div role="alert">
              {errores.map((e) => <p className="error" key={e}>{e}</p>)}
            </div>
          )}
          <div className="cta-row">
            <button type="submit" className="btn btn--accent btn--lg">Solicitar reserva</button>
          </div>
          <p className="hint">Pago online pendiente: la pasarela aún no está decidida.</p>
        </fieldset>
      </form>

      <aside className="summary" aria-label="Resumen de la reserva">
        <h2>Tu sesión</h2>
        <dl>
          <div><dt>Localidad</dt><dd>{locNombre ?? "Sin elegir"}</dd></div>
          <div><dt>Fecha</dt><dd>{fecha ? fechaLarga : "Sin elegir"}</dd></div>
          <div><dt>Horario</dt><dd>{FRANJAS.find((x) => x.id === franja)?.texto ?? "Sin elegir"}</dd></div>
          <div><dt>Duración</dt><dd>{alquiler.duracionTexto}</dd></div>
          <div><dt>Pelotas</dt><dd>{alquiler.pelotasTexto}</dd></div>
          <div><dt>Precio</dt><dd>{alquiler.precioTexto}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
