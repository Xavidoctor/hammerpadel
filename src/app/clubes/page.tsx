import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { AppBloque } from "@/components/AppBloque";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { ProductPhoto } from "@/components/ProductPhoto";
import { alquiler, localidades, maquina, recogebolas } from "@/content/catalogo";
import { servicio } from "@/content/servicio";

export const metadata: Metadata = {
  title: "Máquina lanzapelotas para clubes, academias y entrenadores de pádel",
  description: `Hammer Padel para clubes, academias y entrenadores: alquiler por sesiones en la Marina Alta (${alquiler.resumen}) y compra de la máquina.`,
  alternates: { canonical: "/clubes" },
};

const perfiles = [
  {
    t: "Entrenadores",
    d: "Más repeticiones por clase y menos tiempo lanzando bolas a mano. Tú corriges, la máquina repite.",
    usos: ["Clases técnicas individuales", "Corrección de un golpe concreto", "Series de alta repetición"],
  },
  {
    t: "Academias",
    d: "Un recurso para que los alumnos practiquen lo trabajado en clase, también entre sesiones con el entrenador.",
    usos: ["Grupos de hasta 4 con entrenamientos preparados", "Práctica autónoma entre clases", "Campus y clínics"],
  },
  {
    t: "Clubes",
    d: "Un servicio más para socios que quieren entrenar cuando no encuentran compañero.",
    usos: ["Horas valle con pista libre", "Servicio de entrenamiento para socios", "Demostraciones y jornadas"],
  },
];

export default function Clubes() {
  return (
    <div className="page">
      <BreadcrumbJsonLd nombre="Clubes" ruta="/clubes" />
      <PageHead kicker="Profesionales" titulo="Para clubes y academias">
        <p className="lede">
          Entrenadores que repiten ejercicios técnicos, academias y clubes que quieren sacar más partido a
          cada hora de pista.
        </p>
      </PageHead>

      <div className="page__body sections">
        <section aria-labelledby="t-perfiles">
          <h2 id="t-perfiles" className="sr-only">Para quién</h2>
          <ul className="cards">
            {perfiles.map((p) => (
              <li className="card" key={p.t}>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
                <ul className="claves">
                  {p.usos.map((u) => <li key={u}>{u}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="t-opciones" className="split split--content">
          <ProductPhoto
            src="/medios/maquina/maquina.webp"
            alt="Máquina lanzapelotas Hammer X MAX, negra, con el logotipo HAMMER en la tolva llena de pelotas"
            ancho={888}
            alto={1156}
            className="photo--recorte"
          />
          <div className="stack">
            <h2 id="t-opciones" className="section-title">Dos formas de trabajar con nosotros</h2>
            <div className="options">
              <div className="option">
                <p className="kicker">Hoy</p>
                <h3>Alquiler por sesión</h3>
                <p className="option__price"><span className="price__num">{alquiler.precioTexto}</span> / {alquiler.duracionTexto}</p>
                <p>
                  Llevamos la máquina a vuestra pista en {localidades.map((l) => l.nombre).join(", ")}.{" "}
                  {servicio.horarioTexto}.
                </p>
                <Link className="btn btn--accent" href={alquiler.ruta}>Reservar sesión</Link>
              </div>
              <div className="option">
                <p className="kicker">Para tu centro</p>
                <h3>Compra</h3>
                <p className="option__price"><span className="price__num">{maquina.precioTexto}</span></p>
                <p>Máquina {maquina.nombre}, IVA y envío incluidos. Recogebolas Hammer por {recogebolas.precioTexto}.</p>
                <Link className="btn btn--ghost" href={maquina.ruta}>Ver la máquina</Link>
              </div>
            </div>
            <p className="notice">
              <strong>Pendiente.</strong> Condiciones para profesionales (varias máquinas, alquiler
              prolongado, bonos, precios por volumen, formación y soporte) por definir. Cuéntanos qué
              necesitas y te respondemos personalmente.
            </p>
          </div>
        </section>

        <AppBloque
          titulo="Clases de grupo, ya preparadas"
          intro="La app trae entrenamientos para grupos de hasta 4 personas. Prepara la clase antes de llegar y dedica la hora de pista a corregir."
        />

        <section aria-labelledby="t-form-clubes" className="sections__form">
          <h2 id="t-form-clubes" className="section-title">Hablemos de tu club</h2>
          <p className="lede">Cuéntanos cuántas pistas tenéis, dónde estáis y qué queréis entrenar.</p>
          <ContactForm asuntoFijo="clubes" conOrganizacion />
        </section>
      </div>
    </div>
  );
}
