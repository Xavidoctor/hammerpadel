import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { documentosLegales } from "@/content/legal";

export const metadata: Metadata = {
  title: "Información legal",
  description: "Aviso legal, privacidad, cookies y condiciones de alquiler y de venta de Hammer Padel.",
  alternates: { canonical: "/legal" },
};

export default function Legal() {
  return (
    <div className="page">
      <PageHead kicker="Legal" titulo="Información legal">
        <p className="notice">
          <strong>Borradores.</strong> Pendientes de completar con los datos del titular y de revisión profesional antes de publicar.
        </p>
      </PageHead>
      <div className="page__body">
        <ul className="cards">
          {documentosLegales.map((d) => (
            <li className="card" key={d.href}>
              <h2 className="card__title"><Link href={d.href}>{d.titulo}</Link></h2>
              <p>{d.resumen}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
