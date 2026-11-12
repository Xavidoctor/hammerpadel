import Link from "next/link";
import { alquiler, localidades, navegacion } from "@/content/catalogo";

export function SiteFooter() {
  return (
    <footer className="foot">
      <div className="foot__inner">
        <div>
          <p className="foot__mark">HAMMER PADEL</p>
          <p className="foot__soft">
            Alquiler en {localidades.map((l) => l.nombre).join(", ")} ({alquiler.comarca}).
          </p>
        </div>
        <nav aria-label="Pie de página">
          <ul className="foot__links">
            {navegacion.map((n) => (
              <li key={n.href}><Link href={n.href}>{n.texto}</Link></li>
            ))}
            <li><Link href="/legal">Legal</Link></li>
          </ul>
        </nav>
      </div>
      <p className="foot__proto">
        Prototipo local. Sin pagos, sin reservas reales y sin especificaciones técnicas hasta
        disponer de documentación verificada.
      </p>
    </footer>
  );
}
