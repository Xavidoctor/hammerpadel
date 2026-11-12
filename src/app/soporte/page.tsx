import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Soporte",
  description: "Manuales, garantía y asistencia de Hammer Padel.",
  alternates: { canonical: "/soporte" },
};

export default function Soporte() {
  return (
    <div className="page">
      <PageHead kicker="Soporte" titulo="Manuales y asistencia" />
      <div className="page__body">
        <ul className="cards">
          <li className="card"><h3>Manual de la máquina</h3><p className="pending">Pendiente de publicación.</p></li>
          <li className="card"><h3>Garantía</h3><p className="pending">Condiciones pendientes de definir.</p></li>
          <li className="card"><h3>Repuestos</h3><p className="pending">Disponibles en una fase posterior.</p></li>
          <li className="card"><h3>Contacto técnico</h3><p><Link href="/contacto?asunto=soporte">Escríbenos</Link></p></li>
        </ul>
      </div>
    </div>
  );
}
