import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Entrenamientos de pádel con máquina",
  description: "Ideas de entrenamiento individual de pádel con máquina lanzapelotas: derecha, revés, bandeja, víbora, volea y desplazamiento.",
  alternates: { canonical: "/entrenamientos" },
};

const bloques = [
  { t: "Derecha", d: "Repite el golpe desde la misma posición hasta que el gesto salga solo. Después, varía la altura de contacto." },
  { t: "Revés", d: "Trabaja la preparación temprana y el apoyo. La repetición fija la técnica antes de añadir velocidad." },
  { t: "Bandeja", d: "Golpe defensivo por arriba. Practica el control de la colocación antes que la potencia." },
  { t: "Víbora", d: "Variante con más efecto lateral. Empieza por series cortas para cuidar el hombro." },
  { t: "Volea", d: "Junto a la red, piernas flexionadas y golpe corto. Ideal para series rápidas." },
  { t: "Desplazamiento", d: "Moverse bien es la mitad del golpe. Alterna zonas para trabajar los apoyos." },
];

export default function Entrenamientos() {
  return (
    <div className="page">
      <PageHead kicker="Entrenamientos" titulo="Golpe a golpe">
        <p className="lede">Repite. Mejora. Domina. Ejercicios generales para entrenar en solitario.</p>
      </PageHead>
      <div className="page__body">
        <ul className="cards">
          {bloques.map((b) => (
            <li className="card" key={b.t}><h3>{b.t}</h3><p>{b.d}</p></li>
          ))}
        </ul>
        <p className="notice" style={{ marginTop: "var(--sc-7)" }}>
          <strong>Contenido provisional.</strong> Las rutinas específicas para la máquina Hammer Padel se
          añadirán cuando estén validadas con la documentación y con entrenadores.
        </p>
      </div>
    </div>
  );
}
