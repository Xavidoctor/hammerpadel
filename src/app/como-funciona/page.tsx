import type { Metadata } from "next";
import Link from "next/link";
import { CtaAlquiler } from "@/components/CtaAlquiler";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { ProductPhoto } from "@/components/ProductPhoto";
import { ProductVideo } from "@/components/ProductVideo";
import { alquiler, lemas, localidades, maquina, recogebolas } from "@/content/catalogo";
import { servicio } from "@/content/servicio";

export const metadata: Metadata = {
  title: "Cómo funciona el alquiler de máquina lanzapelotas de pádel",
  description: `Reserva, te llevamos la máquina Hammer Padel a tu pista y entrenas ${alquiler.duracionTexto} por ${alquiler.precioTexto}. ${localidades.map((l) => l.nombre).join(", ")}.`,
  alternates: { canonical: "/como-funciona" },
};

const pasos = [
  {
    t: "Reserva tu sesión",
    d: `Elige localidad, día y hora. Cada sesión dura ${alquiler.duracionTexto} y cuesta ${alquiler.precioTexto}.`,
  },
  { t: "Te la llevamos", d: `${servicio.entregaTexto}, en ${localidades.map((l) => l.nombre).join(", ")}.` },
  { t: "Entrena a tu ritmo", d: "Tú golpeas, la máquina repite. Sin esperar a un compañero." },
  { t: "Paga en la pista", d: `${servicio.pagoTexto}. ${servicio.pagoNota}` },
];

export default function ComoFunciona() {
  return (
    <div className="page">
      <BreadcrumbJsonLd nombre="Cómo funciona" ruta="/como-funciona" />
      <PageHead kicker="Cómo funciona" titulo="Tú golpeas. Ella repite.">
        <p className="lede">
          Alquila la máquina lanzapelotas Hammer Padel por sesiones de {alquiler.duracionTexto}: la
          llevamos a tu pista y tú solo te preocupas de entrenar.
        </p>
      </PageHead>

      <div className="page__body sections">
        <section aria-labelledby="t-alquiler">
          <h2 id="t-alquiler" className="section-title">El alquiler, paso a paso</h2>
          <ol className="steps steps--cards">
            {pasos.map((p, i) => (
              <li key={p.t}>
                <span aria-hidden="true">{i + 1}</span>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>
          <dl className="spec spec--compact">
            <div><dt>Precio</dt><dd>{alquiler.resumen}</dd></div>
            <div><dt>Horario</dt><dd>{servicio.horarioTexto}</dd></div>
            <div><dt>Dónde</dt><dd>{localidades.map((l) => l.nombre).join(", ")} ({alquiler.comarca})</dd></div>
            <div><dt>Pago</dt><dd>En efectivo, en la sesión</dd></div>
            <div><dt>Días de servicio y antelación</dt><dd className="pending">Pendiente de confirmar</dd></div>
            <div><dt>Cancelaciones</dt><dd className="pending">Pendiente de confirmar</dd></div>
          </dl>
          <p className="notice">
            <strong>A tener en cuenta.</strong> La sesión se hace en una pista que tú eliges. Qué pistas
            admiten la máquina y quién reserva la pista se confirmarán al publicar las condiciones de alquiler.
          </p>
        </section>

        <section aria-labelledby="t-entrenar" className="split split--content">
          <ProductPhoto
            src="/medios/maquina/maquina.webp"
            alt="Máquina lanzapelotas Hammer Padel, de color negro, con asa y ruedas"
            ancho={888}
            alto={1156}
            className="photo--estudio"
          />
          <div className="stack">
            <h2 id="t-entrenar" className="section-title">Entrenar con máquina</h2>
            <p className="lede">{lemas.entrenar}</p>
            <div className="prose">
              <p>
                Con una máquina lanzapelotas trabajas un golpe concreto muchas veces seguidas. La repetición
                fija el gesto, y como no dependes de un compañero, aprovechas cada minuto de pista.
              </p>
              <ul>
                <li><strong>Jugadores</strong> que quieren entrenar solos y a su ritmo.</li>
                <li><strong>Entrenadores</strong> que necesitan repetir ejercicios técnicos sin lanzar a mano.</li>
                <li><strong>Quien piensa comprar</strong> y quiere probar la máquina antes.</li>
              </ul>
              <p><Link href="/entrenamientos">Ideas de ejercicios por golpe</Link></p>
            </div>
            <p className="notice">
              <strong>Pendiente.</strong> Modos, ajustes, carga de pelotas y batería se explicarán con la
              documentación técnica oficial. No publicamos datos sin verificar.
            </p>
          </div>
        </section>

        <section aria-labelledby="t-recoger" className="uso uso--flush">
          <h2 id="t-recoger" className="section-title">Y al acabar la serie, recoge en segundos</h2>
          <div className="uso__grid">
            <ProductVideo
              base="/medios/recogebolas/recogebolas"
              descripcion="Recogebolas Hammer recogiendo pelotas en pista y vaciándolas en la máquina"
            />
            <div className="stack">
              <p className="lede">{lemas.recoger}</p>
              <p className="prose">
                El recogebolas Hammer recoge las pelotas del suelo sin agacharte y las vacía directamente
                en la máquina. Se vende por separado por {recogebolas.precioTexto}.
              </p>
              <div className="cta-row">
                <Link className="btn btn--ghost" href={recogebolas.ruta}>Ver el recogebolas</Link>
                <Link className="btn btn--ghost" href={maquina.ruta}>Comprar la máquina · {maquina.precioTexto}</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CtaAlquiler />
    </div>
  );
}
