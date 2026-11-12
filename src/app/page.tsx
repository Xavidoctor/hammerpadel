import Link from "next/link";
import { CourtSvg } from "@/components/CourtSvg";
import { ProductSlot } from "@/components/ProductSlot";
import { Price } from "@/components/Price";
import { MotionToggle, ScrollCraftStage } from "@/components/ScrollCraftStage";
import { alquiler, lemas, localidades, maquina, recogebolas } from "@/content/catalogo";
import { HORIZONTAL, VERTICAL, golpes, proyectar } from "@/lib/pista";
import { mediosPista } from "@/content/medios";

const pct = (v: number, t: number) => `${((v / t) * 100).toFixed(2)}%`;

export default function Inicio() {
  const medios = mediosPista();
  return (
    <ScrollCraftStage>
      {/* ESCENA 1 · LA PISTA. Usa los medios reales si existen (ver src/content/medios.ts). */}
      <section
        id="pista"
        className={`act act--pista${medios.foto ? " act--pista-real" : ""}`}
        data-sc-act={medios.video ? "scrub" : "pin"}
        data-sc-span="2.2"
        data-sc-drift="#0b0d10"
        aria-labelledby="t-hero"
      >
        <div data-sc-stage className="stage">
          {medios.foto ? (
            <>
              <picture>
                {medios.fotoMovil ? <source media="(max-width: 860px)" srcSet={medios.fotoMovil} /> : null}
                <img
                  className={medios.video ? "sc-stage__poster pista__photo" : "pista__photo pista__photo--fx"}
                  src={medios.foto}
                  alt=""
                  fetchPriority="high"
                />
              </picture>
              {medios.video ? (
                <video
                  data-sc-scrub
                  data-sc-src={medios.video}
                  {...(medios.videoMovil ? { "data-sc-src-mobile": medios.videoMovil } : {})}
                  muted
                  playsInline
                  aria-hidden="true"
                />
              ) : null}
            </>
          ) : (
            <>
              <div className="pista__sky" aria-hidden="true" />
              <div className="pista__court">
                <CourtSvg e={HORIZONTAL} className="only-wide" />
                <CourtSvg e={VERTICAL} className="only-tall" />
              </div>
            </>
          )}
          <div className="pista__haze" aria-hidden="true" />
          <div className="sc-scrim sc-scrim--lead only-wide" aria-hidden="true" />
          <div className="pista__product">
            <ProductSlot producto="Máquina Hammer Padel" variante="pista" />
          </div>
          <div className="pista__copy" data-sc-cue="0 1 0 0">
            <h1 id="t-hero" className="hero-title">
              <span className="hero-title__brand">Hammer Padel</span>
              <span className="hero-title__claim">Tu entrenamiento. Tu ritmo. Tu pista.</span>
            </h1>
            <div className="cta-row">
              <Link className="btn btn--accent" href={maquina.ruta}>
                Comprar máquina · {maquina.precioTexto}
              </Link>
              <Link className="btn btn--line" href={alquiler.ruta}>
                Alquilar · {alquiler.precioTexto} / 90 min
              </Link>
            </div>
            <MotionToggle />
          </div>
        </div>
      </section>

      {/* ESCENA 2 · ENTRENAMIENTO (animada: pin + trazas, movimiento propio) */}
      <section id="entrenamiento" className="act act--train" data-sc-act="pin" data-sc-span="3.4" data-sc-drift="#0a1020" aria-labelledby="t-train">
        <div data-sc-stage className="stage">
          <div className="train__court">
            <CourtSvg e={HORIZONTAL} className="only-wide" conFocos={false} conTrazas />
            <CourtSvg e={VERTICAL} className="only-tall" conFocos={false} conTrazas />
            {[HORIZONTAL, VERTICAL].map((e) => (
              <ul key={e.w} className={`train__labels ${e.w > e.h ? "only-wide" : "only-tall"}`} aria-hidden="true">
                {golpes.map((s, i) => {
                  const [x, y] = proyectar(e, s.x, 0, s.z);
                  const a = 0.06 + i * 0.1;
                  return (
                    <li
                      key={s.id}
                      className={`train__label train__label--${s.x < 0 ? "l" : "r"}`}
                      style={{ left: pct(x, e.w), top: pct(y, e.h) }}
                      data-sc-cue={`${a.toFixed(2)} ${(a + 0.2).toFixed(2)}`}
                    >
                      {s.texto}
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
          <div className="train__copy">
            <h2 id="t-train" className="sr-only">Entrenamiento autónomo</h2>
            <p className="train__lede" data-sc-cue="0 0.22 0">
              Una máquina. Tu lado de la pista. Cada bola donde la necesitas.
            </p>
            <ul className="sr-only">
              {golpes.slice(0, 6).map((s) => <li key={s.id}>{s.texto}</li>)}
              <li>Repetición</li>
            </ul>
            <p className="train__punch" data-sc-cue="0.7 1 0.15 0.05">
              No esperes a tu compañero. <em>Entrena.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ESCENA 3 · HAMMER PADEL (estática en el prototipo) */}
      <section id="maquina" className="flow flow--product" aria-labelledby="t-maquina">
        <div className="wrap split">
          <ProductSlot producto="Máquina Hammer Padel" />
          <div className="stack" data-sc-in>
            <p className="kicker">La máquina</p>
            <h2 id="t-maquina" className="display">Hammer Padel</h2>
            <p className="lede">{maquina.descripcion} Para jugadores, entrenadores, clubes y academias.</p>
            <Price texto={maquina.precioTexto} />
            <div className="cta-row">
              <Link className="btn btn--accent" href={maquina.ruta}>Comprar Hammer Padel</Link>
              <Link className="btn btn--ghost" href="/como-funciona">Cómo funciona</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ESCENA 4 · RECOGEBOLAS (estática en el prototipo) */}
      <section id="recogebolas" className="flow flow--balls" aria-labelledby="t-recoge">
        <div className="balls" aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 37) % 97}%`, top: `${58 + ((i * 23) % 38)}%` }} />
          ))}
        </div>
        <div className="wrap split split--rev">
          <div className="stack" data-sc-in>
            <h2 id="t-recoge" className="display display--md">
              Menos tiempo recogiendo.<br />Más tiempo entrenando.
            </h2>
            <p className="lede">{recogebolas.nombre}. {recogebolas.descripcion}</p>
            <Price texto={recogebolas.precioTexto} />
            <div className="cta-row">
              <Link className="btn btn--accent" href={recogebolas.ruta}>Comprar recogebolas</Link>
            </div>
          </div>
          <ProductSlot producto="Recogebolas Hammer" />
        </div>
      </section>

      {/* ESCENA 5 · ALQUILER (animada: scrub de clip provisional) */}
      <section id="alquiler" className="act act--rent" data-sc-act="scrub" data-sc-span="2.4" data-sc-dwell="0.3" data-sc-drift="#0b0d10" aria-labelledby="t-rent">
        <div data-sc-stage className="stage">
          <picture>
            <source media="(max-width: 860px)" srcSet="/prototipo/prototipo-alquiler-m-final.webp" />
            <img className="sc-stage__poster rent__poster" src="/prototipo/prototipo-alquiler-final.webp" alt="" width={1920} height={1080} loading="lazy" />
          </picture>
          <video
            data-sc-scrub
            data-sc-src="/prototipo/prototipo-alquiler.mp4"
            data-sc-src-mobile="/prototipo/prototipo-alquiler-m.mp4"
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="sc-scrim sc-scrim--lead" aria-hidden="true" />
          <div className="rent__copy" data-sc-cue="0.12 1 0.18 0.06">
            <p className="kicker">¿Quieres probarla?</p>
            <h2 id="t-rent" className="display display--md">Alquila Hammer Padel</h2>
            <p className="rent__price">
              <span className="price__num">{alquiler.precioTexto}</span>
              <span className="rent__dur">{alquiler.duracionTexto}</span>
            </p>
            <p className="rent__where">Disponible inicialmente en</p>
            <ul className="rent__towns">
              {localidades.map((l) => <li key={l.id}>{l.nombre}</li>)}
            </ul>
            <Link className="btn btn--accent" href={alquiler.ruta}>Reservar entrenamiento</Link>
          </div>
          <p className="rent__note">Mapa esquemático, no a escala.</p>
        </div>
      </section>

      {/* ESCENA 6 · CIERRE HACIA LA RESERVA */}
      <section id="reservar" className="flow flow--close" aria-labelledby="t-close">
        <div className="wrap close">
          <h2 id="t-close" className="display">Reservar entrenamiento</h2>
          <ol className="steps" data-sc-stagger="80">
            <li><span>1</span>Elige localidad</li>
            <li><span>2</span>Elige fecha</li>
            <li><span>3</span>Elige horario</li>
            <li><span>4</span>Reserva</li>
          </ol>
          <p className="lede">{alquiler.resumen}. {lemas.repetir}</p>
          <Link className="btn btn--accent btn--lg" href={alquiler.ruta}>Empezar reserva</Link>
        </div>
      </section>

      {/* Resumen indexable, útil también sin animación */}
      <section className="flow flow--about" aria-labelledby="t-about">
        <div className="wrap about">
          <h2 id="t-about" className="display display--sm">Qué es Hammer Padel</h2>
          <div className="about__cols">
            <p>
              Hammer Padel desarrolla, vende y alquila equipamiento para entrenar pádel. Su producto
              principal es una máquina lanzapelotas que permite entrenar de forma autónoma, repetir
              golpes y aprovechar mejor el tiempo en pista.
            </p>
            <p>
              Puedes comprar la máquina de entrenamiento de pádel por {maquina.precioTexto}, el
              recogebolas Hammer por {recogebolas.precioTexto}, o probarla con el alquiler de máquina
              de pádel en Dénia, Ondara, La Xara y Pedreguer por {alquiler.resumen}.
            </p>
          </div>
        </div>
      </section>
    </ScrollCraftStage>
  );
}
