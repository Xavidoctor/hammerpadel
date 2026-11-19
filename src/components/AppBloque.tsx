import { app } from "@/content/app";
import { AppMockup } from "@/components/AppMockup";

/** Presentación de la app de la máquina. Solo funciones confirmadas. */
export function AppBloque({ titulo, intro, id = "t-app" }: { titulo?: string; intro?: string; id?: string }) {
  return (
    <section className="app-block" aria-labelledby={id}>
      <div className="stack">
        <p className="kicker">App · {app.nombre}</p>
        <h2 id={id} className="section-title">{titulo ?? "Tu entrenamiento, preparado en el móvil"}</h2>
        <p className="lede">{intro ?? app.lema}</p>
        <AppMockup className="app-block__mock" />
      </div>
      <ul className="app-block__list">
        {app.puntos.map((p, i) => (
          <li key={p.t}>
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </li>
        ))}
      </ul>
      <p className="pending app-block__note">{app.pendiente}</p>
    </section>
  );
}
