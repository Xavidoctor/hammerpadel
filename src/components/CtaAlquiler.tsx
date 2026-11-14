import Link from "next/link";
import { alquiler, localidades } from "@/content/catalogo";

/**
 * Franja de cierre común a las páginas de contenido: el alquiler es la
 * actividad principal, así que todas terminan invitando a reservar.
 */
export function CtaAlquiler({
  titulo = "Pruébala en tu pista",
  texto,
}: {
  titulo?: string;
  texto?: string;
}) {
  return (
    <section className="cta-band" aria-labelledby="t-cta-alquiler">
      <div className="cta-band__inner">
        <div className="stack">
          <p className="kicker">Alquiler · {alquiler.comarca}</p>
          <h2 id="t-cta-alquiler" className="display display--md">{titulo}</h2>
          <p className="cta-band__price">
            <span className="price__num">{alquiler.precioTexto}</span>
            <span className="cta-band__dur">/ {alquiler.duracionTexto}</span>
          </p>
          <p className="lede">
            {texto ?? `En ${localidades.map((l) => l.nombre).join(", ")}. Entrena sin comprar la máquina.`}
          </p>
        </div>
        <div className="cta-row">
          <Link className="btn btn--accent btn--lg" href={alquiler.ruta}>Reservar sesión</Link>
          <Link className="btn btn--ghost" href="/contacto?asunto=alquiler">Preguntar</Link>
        </div>
      </div>
    </section>
  );
}
