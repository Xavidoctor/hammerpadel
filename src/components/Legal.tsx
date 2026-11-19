import Link from "next/link";
import { PageHead } from "./PageHead";
import { documentosLegales, legalActualizado, type DatoPendiente } from "@/content/legal";

/** Muestra un dato del titular o, si falta, un marcador visible para no publicarlo vacío. */
export function Dato({ valor, falta }: { valor: DatoPendiente; falta: string }) {
  if (valor) return <>{valor}</>;
  return <mark className="falta">[Pendiente: {falta}]</mark>;
}

/** Condición comercial que Hammer Padel aún no ha decidido. */
export function Pendiente({ children }: { children: React.ReactNode }) {
  return (
    <p className="pendiente-legal">
      <strong>Pendiente de definir.</strong> {children}
    </p>
  );
}

export function LegalPage({ titulo, ruta, children }: { titulo: string; ruta: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <PageHead kicker="Legal" titulo={titulo}>
        <p className="hint">Última actualización: {legalActualizado}</p>
        <p className="notice">
          <strong>Borrador.</strong> Este texto aún no está en vigor. Debe revisarlo un profesional
          (abogado o consultor de protección de datos) y completarse con los datos marcados como pendientes
          antes de publicar la web o abrir reservas y ventas.
        </p>
      </PageHead>
      <div className="page__body legal">
        <article className="prose">{children}</article>
        <nav className="legal__nav" aria-label="Textos legales">
          <p className="kicker">Textos legales</p>
          <ul>
            {documentosLegales.map((d) => (
              <li key={d.href}>
                <Link href={d.href} aria-current={d.href === ruta ? "page" : undefined}>{d.titulo}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
