"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { enviarContacto, type EstadoContacto } from "@/app/contacto/acciones";
import { localidades } from "@/content/catalogo";
import { ASUNTOS, type AsuntoId, contacto, enlaceWhatsapp } from "@/content/contacto";

const INICIAL: EstadoContacto = { estado: "inicial" };

/**
 * Formulario de contacto. Funciona también sin JavaScript (acción de servidor).
 * El envío real se activa con variables de entorno (ver src/app/contacto/acciones.ts).
 */
export function ContactForm({
  asuntoFijo,
  asuntoInicial = "alquiler",
  conOrganizacion = false,
}: {
  /** Asunto fijo (campo oculto), p. ej. en /clubes. */
  asuntoFijo?: AsuntoId;
  /** Asunto preseleccionado en el desplegable (llega de ?asunto= en /contacto). */
  asuntoInicial?: string;
  conOrganizacion?: boolean;
}) {
  const uid = useId();
  const [st, accion, enviando] = useActionState(enviarContacto, INICIAL);

  const v = st.valores ?? {};
  const err = st.errores ?? {};
  const id = (k: string) => `${uid}-${k}`;
  const ayuda = (k: keyof typeof err) =>
    err[k] ? <p className="error" id={id(`${k}-e`)}>{err[k]}</p> : null;
  const a11y = (k: keyof typeof err) =>
    err[k] ? { "aria-invalid": true as const, "aria-describedby": id(`${k}-e`) } : {};

  if (st.estado === "enviado") {
    return (
      <div className="result" role="status">
        <h2>Mensaje enviado</h2>
        <p>
          Gracias. Te responderemos personalmente al email que nos has dejado
          {contacto.plazoRespuesta ? ` ${contacto.plazoRespuesta}` : ""}.
        </p>
        <div className="cta-row">
          <Link className="btn btn--ghost" href="/alquiler">Ver el alquiler</Link>
        </div>
      </div>
    );
  }

  if (st.estado === "sin-configurar") {
    const wa = enlaceWhatsapp(v.mensaje);
    return (
      <div className="result" role="status">
        <h2>Último paso: envíalo desde tu correo</h2>
        {st.mailto ? (
          <>
            <p>Hemos preparado el mensaje. Pulsa el botón y se abrirá tu aplicación de correo con todo escrito.</p>
            <div className="cta-row">
              <a className="btn btn--accent btn--lg" href={st.mailto}>Abrir mi correo</a>
              {wa && <a className="btn btn--ghost" href={wa}>Enviar por WhatsApp</a>}
            </div>
          </>
        ) : (
          <p>
            <strong>Prototipo.</strong> El envío todavía no está activado y los datos de contacto de la
            empresa están pendientes. Tu mensaje no se ha enviado.
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="form" action={accion} noValidate key={st.marca ?? 0}>
      {st.aviso && <p className="error error--box" role="alert">{st.aviso}</p>}
      {st.estado === "fallo" && st.mailto && (
        <p><a href={st.mailto}>Enviar el mensaje desde mi correo</a></p>
      )}

      <div className="fields">
        <div className="field">
          <label htmlFor={id("n")}>Nombre</label>
          <input id={id("n")} name="nombre" autoComplete="name" required maxLength={100} defaultValue={v.nombre} {...a11y("nombre")} />
          {ayuda("nombre")}
        </div>
        <div className="field">
          <label htmlFor={id("e")}>Email</label>
          <input id={id("e")} name="email" type="email" inputMode="email" autoComplete="email" required maxLength={200} defaultValue={v.email} {...a11y("email")} />
          {ayuda("email")}
        </div>
        <div className="field">
          <label htmlFor={id("t")}>Teléfono <span className="opt">(opcional)</span></label>
          <input id={id("t")} name="telefono" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} defaultValue={v.telefono} {...a11y("telefono")} />
          {ayuda("telefono")}
        </div>
      </div>

      <div className="fields">
        {conOrganizacion && (
          <div className="field">
            <label htmlFor={id("o")}>Club, academia o centro</label>
            <input id={id("o")} name="organizacion" autoComplete="organization" maxLength={120} defaultValue={v.organizacion} {...a11y("organizacion")} />
            {ayuda("organizacion")}
          </div>
        )}
        <div className="field">
          <label htmlFor={id("l")}>Localidad <span className="opt">(opcional)</span></label>
          <select id={id("l")} name="localidad" defaultValue={v.localidad ?? ""}>
            <option value="">Sin indicar</option>
            {localidades.map((l) => <option key={l.id} value={l.nombre}>{l.nombre}</option>)}
            <option value="Otra">Otra localidad</option>
          </select>
        </div>
        {asuntoFijo ? (
          <input type="hidden" name="asunto" value={asuntoFijo} />
        ) : (
          <div className="field">
            <label htmlFor={id("a")}>Asunto</label>
            <select id={id("a")} name="asunto" defaultValue={v.asunto ?? asuntoInicial}>
              {ASUNTOS.map((a) => <option key={a.id} value={a.id}>{a.texto}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="field">
        <label htmlFor={id("m")}>Mensaje</label>
        <textarea id={id("m")} name="mensaje" required maxLength={4000} defaultValue={v.mensaje} {...a11y("mensaje")} />
        {ayuda("mensaje")}
      </div>

      {/* Campo trampa para bots: oculto a personas y a lectores de pantalla. */}
      <div className="trampa" aria-hidden="true">
        <label htmlFor={id("w")}>No rellenes este campo</label>
        <input id={id("w")} name="web" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label className="check" htmlFor={id("p")}>
          <input id={id("p")} type="checkbox" name="privacidad" value="si" required defaultChecked={v.privacidad === "si"} {...a11y("privacidad")} />
          <span>
            Acepto que Hammer Padel use estos datos solo para responder a mi consulta (
            <Link href="/legal">privacidad</Link>).
          </span>
        </label>
        {ayuda("privacidad")}
      </div>

      <div className="cta-row">
        <button className="btn btn--accent btn--lg" type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar mensaje"}
        </button>
      </div>
    </form>
  );
}
