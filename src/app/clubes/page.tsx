import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Clubes, academias y entrenadores",
  description: "Hammer Padel para clubes, academias y entrenadores de pádel.",
  alternates: { canonical: "/clubes" },
};

export default function Clubes() {
  return (
    <div className="page">
      <PageHead kicker="Profesionales" titulo="Para clubes y academias">
        <p className="lede">Entrenadores que repiten ejercicios técnicos, academias que quieren más horas útiles de pista.</p>
      </PageHead>
      <div className="page__body">
        <ul className="cards">
          <li className="card"><h3>Entrenadores</h3><p>Más repeticiones por sesión y menos tiempo lanzando bolas a mano.</p></li>
          <li className="card"><h3>Academias</h3><p>Entrenamiento autónomo para alumnos entre clases.</p></li>
          <li className="card"><h3>Clubes</h3><p>Un servicio más para tus socios.</p></li>
        </ul>
        <p className="notice" style={{ marginTop: "var(--sc-7)" }}>
          <strong>Pendiente.</strong> Condiciones para profesionales (volumen, alquiler prolongado, soporte) por definir.
        </p>
        <p style={{ marginTop: "var(--sc-6)" }}>
          <Link className="btn btn--accent" href="/contacto?asunto=clubes">Hablar con Hammer Padel</Link>
        </p>
      </div>
    </div>
  );
}
