import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/PageHead";
import { Price } from "@/components/Price";
import { RentalJsonLd } from "@/components/RentalJsonLd";
import { alquiler, maquina } from "@/content/catalogo";
import {
  condicionesAlquiler as c,
  esIndexable,
  horarioAlquiler,
  paginaLocalidad,
  paginasLocalidad,
  rutaLocalidad,
} from "@/content/localidades";
import { URL_SITIO } from "@/lib/sitio";

type Props = { params: Promise<{ localidad: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return paginasLocalidad.map((p) => ({ localidad: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = paginaLocalidad((await params).localidad);
  if (!p) return {};
  return {
    title: p.keyword,
    description: `Llevamos la máquina lanzapelotas ${maquina.nombre} a tu pista en ${p.nombre}, también en urbanizaciones y pistas privadas. ${alquiler.resumen}, de lunes a domingo de ${horarioAlquiler.primeraReserva} a ${horarioAlquiler.ultimaReserva}.`,
    alternates: { canonical: rutaLocalidad(p.id) },
    // Sin contenido local propio, la página no se indexa (evita contenido duplicado).
    ...(esIndexable(p) ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function AlquilerLocalidad({ params }: Props) {
  const p = paginaLocalidad((await params).localidad);
  if (!p) notFound();
  const otras = paginasLocalidad.filter((o) => o.id !== p.id);
  const reservar = `${alquiler.ruta}#reservar`;

  return (
    <div className="page">
      <RentalJsonLd p={p} base={URL_SITIO} />
      <nav className="crumbs" aria-label="Ruta de navegación">
        <ol>
          <li><Link href="/">Inicio</Link></li>
          <li><Link href={alquiler.ruta}>Alquiler</Link></li>
          <li aria-current="page">{p.nombre}</li>
        </ol>
      </nav>

      <PageHead kicker={`Alquiler en ${p.nombre}`} titulo={p.keyword}>
        <Price texto={alquiler.precioTexto} sufijo={`/ ${alquiler.duracionTexto}`} />
        <p className="lede">
          Llevamos la máquina lanzapelotas {maquina.nombre} a tu pista en {p.nombre}. Tú solo tienes que
          entrenar: sin comprarla, sin esperar a un compañero.
        </p>
        <div className="cta-row">
          <Link className="btn btn--accent btn--lg" href={reservar}>Reservar en {p.nombre}</Link>
          <Link className="btn btn--ghost" href={maquina.ruta}>Ver la máquina</Link>
        </div>
      </PageHead>

      <div className="page__body local">
        <section aria-labelledby="t-pasos">
          <h2 id="t-pasos" className="local__h2">Así funciona en {p.nombre}</h2>
          <ol className="steps">
            <li><span>1</span>Reservas en la web y te confirmamos la reserva.</li>
            <li><span>2</span>Te llevamos la máquina a tu pista.</li>
            <li><span>3</span>Entrenas {alquiler.duracionTexto} a tu ritmo.</li>
            <li><span>4</span>Pagas en la sesión.</li>
          </ol>
        </section>

        <section className="prose" aria-labelledby="t-datos">
          <h2 id="t-datos">Precio, horario y condiciones</h2>
          <dl className="spec">
            <div><dt>Precio</dt><dd>{alquiler.resumen}</dd></div>
            <div>
              <dt>Horario</dt>
              <dd>{c.dias}. Reservas con inicio entre las {horarioAlquiler.primeraReserva} y las {horarioAlquiler.ultimaReserva}</dd>
            </div>
            <div><dt>Antelación</dt><dd>Reserva con al menos {c.antelacionHoras} horas. {c.confirmacion}.</dd></div>
            <div><dt>Dónde</dt><dd>{c.pistas} de {p.nombre}: nosotros llevamos la máquina</dd></div>
            <div><dt>Entrega</dt><dd>{p.entrega}</dd></div>
            <div><dt>Pelotas</dt><dd>{alquiler.pelotasTexto}. {c.pelotaPerdida}.</dd></div>
            <div><dt>Pago</dt><dd>De momento, en efectivo al empezar la sesión. El pago online llegará más adelante.</dd></div>
          </dl>
        </section>

        <section className="prose" aria-labelledby="t-local">
          <h2 id="t-local">Alquiler de máquina de pádel en {p.nombre}</h2>
          {p.local ? (
            <>
              <h3>Zonas donde la llevamos</h3>
              <ul>{p.local.zonas.map((z) => <li key={z}>{z}</li>)}</ul>
              <h3>Pistas</h3>
              <p>{p.local.pistas}</p>
              {p.local.preguntas.length ? (
                <>
                  <h3>Preguntas frecuentes en {p.nombre}</h3>
                  {p.local.preguntas.map((q) => (
                    <details key={q.pregunta} className="faq">
                      <summary>{q.pregunta}</summary>
                      <p>{q.respuesta}</p>
                    </details>
                  ))}
                </>
              ) : null}
            </>
          ) : (
            <p className="pending">
              Zonas y urbanizaciones de {p.nombre} donde ya llevamos la máquina y preguntas frecuentes
              de la zona: información pendiente de publicar.
            </p>
          )}
          <p>
            ¿No sabes qué trabajar en {alquiler.duracionTexto}? Mira los{" "}
            <Link href="/entrenamientos">ejercicios de entrenamiento con máquina</Link>. Y si después
            quieres tenerla siempre, la <Link href={maquina.ruta}>{maquina.nombre}</Link> también se
            vende.
          </p>
        </section>

        <section aria-labelledby="t-otras">
          <h2 id="t-otras" className="local__h2">También en la Marina Alta</h2>
          <ul className="cards">
            {otras.map((o) => (
              <li key={o.id} className="card">
                <h3><Link href={rutaLocalidad(o.id)}>Alquiler en {o.nombre}</Link></h3>
                <p>{alquiler.precioTexto} / {alquiler.duracionTexto}, en tu pista.</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="cta-row">
          <Link className="btn btn--accent btn--lg" href={reservar}>Reservar en {p.nombre}</Link>
        </div>
      </div>
    </div>
  );
}
