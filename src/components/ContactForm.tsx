"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

const ASUNTOS = [
  { id: "compra-maquina", texto: "Comprar la máquina Hammer X MAX" },
  { id: "compra-recogebolas", texto: "Comprar el recogebolas" },
  { id: "alquiler", texto: "Alquiler" },
  { id: "clubes", texto: "Clubes y academias" },
  { id: "soporte", texto: "Soporte" },
  { id: "otro", texto: "Otro" },
];

/** PROTOTIPO: valida en el navegador y no envía nada. */
export function ContactForm() {
  const uid = useId();
  const params = useSearchParams();
  const inicial = ASUNTOS.some((a) => a.id === params.get("asunto")) ? params.get("asunto")! : "otro";
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  if (ok) {
    return (
      <div className="result" role="status">
        <h2>Mensaje preparado (prototipo)</h2>
        <p>En este prototipo el formulario no envía nada. El envío real se activará tras aprobar el proveedor de email.</p>
        <button type="button" className="btn btn--ghost" onClick={() => setOk(false)}>Volver</button>
      </div>
    );
  }

  return (
    <form
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (!String(f.get("nombre") ?? "").trim() || !/^\S+@\S+\.\S+$/.test(String(f.get("email") ?? ""))) {
          setError("Escribe tu nombre y un email válido.");
          return;
        }
        setError("");
        setOk(true);
      }}
    >
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
          <label htmlFor={`${uid}-a`}>Asunto</label>
          <select id={`${uid}-a`} name="asunto" defaultValue={inicial}>
            {ASUNTOS.map((a) => <option key={a.id} value={a.id}>{a.texto}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${uid}-m`}>Mensaje</label>
        <textarea id={`${uid}-m`} name="mensaje" />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="cta-row"><button className="btn btn--accent btn--lg" type="submit">Enviar</button></div>
    </form>
  );
}
