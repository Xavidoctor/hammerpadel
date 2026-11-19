"use client";

import { useActionState } from "react";
import { REPARTIDORES } from "@/lib/reservas/ajustes";
import { entrar } from "./acciones";

export function Entrar() {
  const [error, accion, pendiente] = useActionState(entrar, null);
  return (
    <form action={accion} className="form admin__login">
      <div className="field">
        <label htmlFor="quien">Quién eres</label>
        <select id="quien" name="quien" required defaultValue="">
          <option value="" disabled>Elige</option>
          {REPARTIDORES.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" name="contrasena" type="password" autoComplete="current-password" required />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--accent" disabled={pendiente}>Entrar</button>
    </form>
  );
}
