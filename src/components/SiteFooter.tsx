import Link from "next/link";
import { alquiler, localidades, navegacion } from "@/content/catalogo";
import { documentosLegales } from "@/content/legal";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="foot__inner">
        <div>
          <p className="foot__mark">
            <Logo className="foot__logo" />
            <span className="sr-only">Hammer Padel</span>
          </p>
          <p className="foot__soft">
            Alquiler en {localidades.map((l) => l.nombre).join(", ")} ({alquiler.comarca}).
          </p>
        </div>
        <nav aria-label="Pie de página">
          <ul className="foot__links">
            {navegacion.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.texto}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <nav className="foot__legal" aria-label="Textos legales">
        <ul>
          {documentosLegales.map((d) => (
            <li key={d.href}><Link href={d.href}>{d.titulo}</Link></li>
          ))}
        </ul>
      </nav>
      <p className="foot__proto">
        Prototipo local. Sin pagos, sin reservas reales y sin especificaciones técnicas hasta
        disponer de documentación verificada.
      </p>
    </footer>
  );
}
