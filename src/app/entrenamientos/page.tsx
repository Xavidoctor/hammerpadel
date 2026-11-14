import type { Metadata } from "next";
import Link from "next/link";
import { CtaAlquiler } from "@/components/CtaAlquiler";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { alquiler, lemas } from "@/content/catalogo";

export const metadata: Metadata = {
  title: "Entrenamiento individual de pádel con máquina lanzapelotas",
  description:
    "Ejercicios de pádel para entrenar solo con máquina lanzapelotas: derecha, revés, volea, bandeja, víbora, remate y desplazamientos. Cómo organizar una sesión de 90 minutos.",
  alternates: { canonical: "/entrenamientos" },
};

type Nivel = "Iniciación" | "Intermedio" | "Avanzado";

/** Contenido editorial general de pádel. No describe funciones de la máquina. */
const golpes: { t: string; nivel: Nivel; foco: string; d: string; claves: string[] }[] = [
  {
    t: "Derecha de fondo",
    nivel: "Iniciación",
    foco: "Fondo de pista",
    d: "La base de todo. Repite desde la misma posición hasta que el gesto salga solo; después cambia la altura del contacto.",
    claves: ["Prepara la pala pronto", "Golpea delante del cuerpo", "Termina el gesto hacia el objetivo"],
  },
  {
    t: "Revés de fondo",
    nivel: "Iniciación",
    foco: "Fondo de pista",
    d: "Trabaja la preparación temprana y el apoyo. La repetición fija la técnica antes de añadir velocidad.",
    claves: ["Hombros girados antes del bote", "Peso en la pierna de delante", "Pala firme en el impacto"],
  },
  {
    t: "Salida de pared",
    nivel: "Intermedio",
    foco: "Fondo y cristal",
    d: "Deja que la bola pase, rebote en el cristal y gánale la posición. Es el golpe que más se entrena solo.",
    claves: ["Acompaña la bola, no la persigas", "Espera a que baje", "Distancia lateral con la pared"],
  },
  {
    t: "Volea",
    nivel: "Iniciación",
    foco: "Red",
    d: "Junto a la red, piernas flexionadas y golpe corto. Ideal para series rápidas de muchas repeticiones.",
    claves: ["Gesto corto, sin swing", "Pala por delante y arriba", "Paso hacia la bola"],
  },
  {
    t: "Bandeja",
    nivel: "Intermedio",
    foco: "Red, bola alta",
    d: "Golpe defensivo por arriba para conservar la red. Prioriza colocar la bola antes que la potencia.",
    claves: ["Perfil lateral", "Contacto a la altura de la cabeza", "Bola profunda y controlada"],
  },
  {
    t: "Víbora",
    nivel: "Avanzado",
    foco: "Red, bola alta",
    d: "Variante con más efecto lateral y velocidad. Empieza por series cortas para cuidar el hombro.",
    claves: ["Calienta bien el hombro", "Contacto más lateral que en la bandeja", "Pocas repeticiones al principio"],
  },
  {
    t: "Remate",
    nivel: "Avanzado",
    foco: "Red, bola alta",
    d: "Golpe ganador por arriba. Repetirlo en serie permite ajustar el punto de impacto sin presión de partido.",
    claves: ["Coloca los pies antes de golpear", "Brazo libre señalando la bola", "Elige dirección antes que fuerza"],
  },
  {
    t: "Desplazamientos",
    nivel: "Intermedio",
    foco: "Toda la pista",
    d: "Moverse bien es la mitad del golpe. Alterna zonas para trabajar apoyos, frenadas y recuperación.",
    claves: ["Pasos cortos al llegar", "Vuelve al centro tras cada golpe", "Mirada en la bola, no en los pies"],
  },
];

const sesion = [
  { min: "10 min", t: "Calentamiento", d: "Movilidad articular, desplazamientos suaves y golpes sin fuerza." },
  { min: "25 min", t: "Golpe principal", d: "Un solo golpe, en series cortas con pausas. Calidad antes que cantidad." },
  { min: "25 min", t: "Golpe secundario", d: "Otro golpe o el mismo desde otra zona de la pista." },
  { min: "20 min", t: "Combinación", d: "Encadena dos golpes (por ejemplo, fondo y subida a la red) para acercarte al juego real." },
  { min: "10 min", t: "Vuelta a la calma", d: "Recoge, estira y apunta qué has notado para la próxima sesión." },
];

export default function Entrenamientos() {
  return (
    <div className="page">
      <BreadcrumbJsonLd nombre="Entrenamientos" ruta="/entrenamientos" />
      <PageHead kicker="Entrenamientos" titulo="Golpe a golpe">
        <p className="lede">
          {lemas.repetir} Ejercicios de pádel para entrenar solo con máquina lanzapelotas, organizados por
          golpe y por nivel.
        </p>
      </PageHead>

      <div className="page__body sections">
        <section aria-labelledby="t-golpes">
          <h2 id="t-golpes" className="section-title">Ejercicios por golpe</h2>
          <ul className="cards">
            {golpes.map((g) => (
              <li className="card card--drill" key={g.t}>
                <p className="tags">
                  <span className="tag tag--accent">{g.nivel}</span>
                  <span className="tag">{g.foco}</span>
                </p>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
                <ul className="claves">
                  {g.claves.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="t-sesion" className="prose-wide">
          <h2 id="t-sesion" className="section-title">Una sesión de {alquiler.duracionTexto}, organizada</h2>
          <p className="lede">Una propuesta para aprovechar una sesión de alquiler. Ajústala a tu nivel y a tu forma física.</p>
          <ol className="timeline">
            {sesion.map((s) => (
              <li key={s.t}>
                <span className="timeline__min">{s.min}</span>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="t-consejos" className="prose">
          <h2 id="t-consejos">Consejos para entrenar solo</h2>
          <ul>
            <li>Trabaja un objetivo por serie: un golpe, una zona, una dirección.</li>
            <li>Haz series cortas y descansa entre ellas. Un gesto cansado se repite mal.</li>
            <li>Grábate con el móvil de vez en cuando para ver el gesto desde fuera.</li>
            <li>Si tienes entrenador, pídele un plan y úsalo en tus sesiones con la máquina.</li>
            <li>Ante dolor o molestias, para. Si tienes una lesión, consulta antes con un profesional.</li>
          </ul>
          <p className="notice">
            <strong>Contenido orientativo.</strong> Las rutinas específicas para la máquina Hammer Padel
            (ajustes por ejercicio) se añadirán cuando estén validadas con la documentación oficial y con
            entrenadores. ¿Eres entrenador y quieres colaborar? <Link href="/clubes">Escríbenos</Link>.
          </p>
        </section>
      </div>

      <CtaAlquiler titulo="Pon en práctica estos ejercicios" />
    </div>
  );
}
