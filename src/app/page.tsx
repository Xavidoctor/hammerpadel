import Link from "next/link";
import { CourtSvg } from "@/components/CourtSvg";
import { ProductPhoto } from "@/components/ProductPhoto";
import { ProductSlot } from "@/components/ProductSlot";
import { ProductVideo } from "@/components/ProductVideo";
import { Price } from "@/components/Price";
import { MotionToggle, ScrollCraftStage } from "@/components/ScrollCraftStage";
import { alquiler, lemas, localidades, maquina, recogebolas } from "@/content/catalogo";
import { HORIZONTAL, VERTICAL, golpes } from "@/lib/pista";
import { mediosPista } from "@/content/medios";

/** Focos de la foto iluminada (en % del encuadre 1671x941), de fondo a primer plano. */
const LAMPARAS = [
  { x: 38.3, y: 45.7, orden: 0 }, { x: 61.7, y: 45.7, orden: 0 },
  { x: 29.1, y: 28.8, orden: 1 }, { x: 70.8, y: 28.8, orden: 1 },
  { x: 18.3, y: 6.5, orden: 2 }, { x: 81.7, y: 6.5, orden: 2 },
];

/** Instante (0..1 del scroll de la escena 2) en que la máquina lanza cada bola; igual que SALIDAS en produccion/escena-2/escena.js. */
const SALIDAS = golpes.map((_, i) => 0.03 + i * 0.1);

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
          {medios.foto && !medios.video ? (
            <div className="pista__frame">
              <img className="pista__layer pista__foto" src={medios.foto} width={2200} height={1238}
                alt="Máquina Hammer Padel en una pista de pádel azul" fetchPriority="high" />
              {medios.luces.map((src, n) => (
                <img key={src} className="pista__layer pista__luz" src={src} alt="" aria-hidden="true"
                  style={{ ["--n" as string]: n }} />
              ))}
              <div className="pista__suelo" aria-hidden="true" />
              {LAMPARAS.map((l, i) => (
                <span key={i} className="pista__lamp" aria-hidden="true"
                  style={{ left: `${l.x}%`, top: `${l.y}%`, ["--n" as string]: l.orden }}>
                  <span className="pista__beam" />
                </span>
              ))}
            </div>
          ) : medios.foto ? (
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
          {medios.fotoIncluyeMaquina ? null : (
            <div className="pista__product">
              <ProductSlot producto="Máquina Hammer Padel" variante="pista" />
            </div>
          )}
          <div className="pista__copy" data-sc-cue="0 1 0 0">
            <h1 id="t-hero" className="hero-title">
              <span className="hero-title__brand">Hammer Padel</span>
              <span className="hero-title__claim">Tu entrenamiento. Tu ritmo. Tu pista.</span>
            </h1>
            <p className="hero-sub">
              Alquila la máquina lanzapelotas por {alquiler.precioTexto} la sesión de 90 minutos en{" "}
              {localidades.map((l) => l.nombre).join(", ").replace(/, ([^,]*)$/, " y $1")}.
            </p>
            <div className="cta-row">
              <Link className="btn btn--accent" href={alquiler.ruta}>
                Reservar sesión · {alquiler.precioTexto} / 90 min
              </Link>
              <Link className="btn btn--line" href={maquina.ruta}>
                Comprar · {maquina.precioTexto}
              </Link>
            </div>
            <MotionToggle />
          </div>
        </div>
      </section>

      {/* ESCENA 2 · ENTRENAMIENTO: la máquina Hammer en 3D lanzando bolas (render propio, scrub por scroll).
          Fuente del render: produccion/escena-2. Los rótulos siguen los instantes de lanzamiento (SALIDAS). */}
      <section id="entrenamiento" className="act act--train" data-sc-act="scrub" data-sc-span="3.4" data-sc-dwell="0.2" data-sc-drift="#0a1020" aria-labelledby="t-train">
        <div data-sc-stage className="stage">
          <picture>
            <source media="(max-width: 860px)" srcSet="/medios/entrenamiento/poster-m.webp" />
            <img className="sc-stage__poster train__poster" src="/medios/entrenamiento/poster.webp" width={1920} height={1080} loading="lazy"
              alt="Máquina lanzapelotas Hammer Padel en 3D lanzando una bola en una pista azul" />
          </picture>
          <video
            data-sc-scrub
            data-sc-src="/medios/entrenamiento/maquina-3d.mp4"
            data-sc-src-mobile="/medios/entrenamiento/maquina-3d-m.mp4"
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="sc-scrim sc-scrim--lead" aria-hidden="true" />
          <ul className="train__ticker" aria-hidden="true">
            {golpes.map((s, i) => {
              const a = SALIDAS[i];
              return (
                <li key={s.id} className="train__label" data-sc-cue={`${a.toFixed(2)} ${(a + 0.1).toFixed(2)} 0.15 0.2`}>
                  <span className="train__num">{String(i + 1).padStart(2, "0")}</span> {s.texto}
                </li>
              );
            })}
          </ul>
          <div className="train__copy">
            <h2 id="t-train" className="sr-only">Entrenamiento autónomo</h2>
            <p className="train__lede" data-sc-cue="0 0.22 0">
              Una máquina. Tu lado de la pista. Cada bola donde la necesitas.
            </p>
            <ul className="sr-only">
              {golpes.slice(0, 6).map((s) => <li key={s.id}>{s.texto}</li>)}
              <li>Repetición</li>
            </ul>
            <p className="train__punch" data-sc-cue="0.72 1 0.15 0.05">
              No esperes a tu compañero. <em>Entrena.</em>
            </p>
          </div>
        </div>
      </section>

      {/* ESCENA 3 · ALQUILER, la actividad principal (animada: scrub de clip provisional) */}
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
            <p className="kicker">Entrena sin comprarla</p>
            <h2 id="t-rent" className="display display--md">Alquila Hammer Padel</h2>
            <p className="rent__price">
              <span className="price__num">{alquiler.precioTexto}</span>
              <span className="rent__dur">{alquiler.duracionTexto}</span>
            </p>
            <p className="rent__where">{alquiler.pelotasTexto}</p>
            <p className="rent__where">Disponible inicialmente en</p>
            <ul className="rent__towns">
              {localidades.map((l) => <li key={l.id}>{l.nombre}</li>)}
            </ul>
            <Link className="btn btn--accent" href={alquiler.ruta}>Reservar entrenamiento</Link>
          </div>
          <p className="rent__note">Mapa esquemático, no a escala.</p>
        </div>
      </section>

      {/* ESCENA 4 · RESERVA */}
      <section id="reservar" className="flow flow--close" aria-labelledby="t-close">
        <div className="wrap close">
          <h2 id="t-close" className="display">Reservar entrenamiento</h2>
          <ol className="steps" data-sc-stagger="80">
            <li><span>1</span>Elige localidad</li>
            <li><span>2</span>Elige fecha</li>
            <li><span>3</span>Elige horario</li>
            <li><span>4</span>Reserva</li>
          </ol>
          <p className="lede">{alquiler.resumen}, {alquiler.pelotasTexto}. {lemas.repetir}</p>
          <Link className="btn btn--accent btn--lg" href={alquiler.ruta}>Empezar reserva</Link>
        </div>
      </section>

      {/* ESCENA 5 · COMPRA DE LA MÁQUINA (venta, secundaria al alquiler) */}
      <section id="maquina" className="flow flow--product" aria-labelledby="t-maquina">
        <div className="wrap split">
          <ProductPhoto
            src="/medios/maquina/maquina.webp"
            alt="Máquina lanzapelotas Hammer Padel, de color negro, con el logotipo Hammer Padel, asa y ruedas"
            ancho={888}
            alto={1156}
            className="photo--estudio"
          />
          <div className="stack" data-sc-in>
            <p className="kicker">¿Prefieres tenerla siempre?</p>
            <h2 id="t-maquina" className="display">Hammer Padel</h2>
            <p className="lede">{maquina.descripcion} Para jugadores, entrenadores, clubes y academias. Pruébala antes con una sesión de alquiler.</p>
            <Price texto={maquina.precioTexto} />
            <div className="cta-row">
              <Link className="btn btn--accent" href={maquina.ruta}>Comprar Hammer Padel</Link>
              <Link className="btn btn--ghost" href={alquiler.ruta}>Probarla antes</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ESCENA 6 · RECOGEBOLAS (venta) */}
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
          <ProductVideo base="/medios/recogebolas/recogebolas" descripcion="Recogebolas Hammer recogiendo pelotas en pista y vaciándolas en la máquina" />
        </div>
      </section>

      {/* Resumen indexable, útil también sin animación */}
      <section className="flow flow--about" aria-labelledby="t-about">
        <div className="wrap about">
          <h2 id="t-about" className="display display--sm">Qué es Hammer Padel</h2>
          <div className="about__cols">
            <p>
              Hammer Padel alquila una máquina lanzapelotas para entrenar pádel de forma autónoma:
              repetir golpes, trabajar situaciones de juego y aprovechar mejor el tiempo en pista.
              El alquiler de máquina de pádel está disponible en Dénia, Ondara, La Xara y Pedreguer
              por {alquiler.resumen}.
            </p>
            <p>
              Si prefieres tenerla siempre, puedes comprar la máquina de entrenamiento de pádel por{" "}
              {maquina.precioTexto} y el recogebolas Hammer por {recogebolas.precioTexto}.
            </p>
          </div>
        </div>
      </section>
    </ScrollCraftStage>
  );
}
