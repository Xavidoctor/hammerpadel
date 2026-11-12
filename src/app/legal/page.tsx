import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = { title: "Legal", alternates: { canonical: "/legal" } };

export default function Legal() {
  return (
    <div className="page">
      <PageHead kicker="Legal" titulo="Información legal" />
      <div className="page__body">
        <ul className="cards">
          {["Aviso legal", "Política de privacidad", "Política de cookies", "Condiciones de venta", "Condiciones de alquiler"].map((t) => (
            <li className="card" key={t}><h3>{t}</h3><p className="pending">Pendiente de redactar y revisar antes de publicar.</p></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
