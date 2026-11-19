import type { Metadata } from "next";
import Link from "next/link";
import { Price } from "@/components/Price";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { ProductPhoto } from "@/components/ProductPhoto";
import { ProductVideo } from "@/components/ProductVideo";
import { ZonaRecogebolas } from "@/components/ZonaRecogebolas";
import { envio, lemas, recogebolas } from "@/content/catalogo";

export const metadata: Metadata = {
  title: "Recogebolas Hammer",
  description: `${recogebolas.descripcion} ${recogebolas.precioTexto}.`,
  alternates: { canonical: "/recogebolas" },
};

export default function Recogebolas() {
  return (
    // toda la página es zona del recogebolas: con el ratón, el cursor recoge las pelotas del fondo
    <ZonaRecogebolas total={30}>
    <div className="page">
      <ProductJsonLd p={recogebolas} />
      <div className="product-page">
        <ProductVideo
          base="/medios/recogebolas/recogebolas-3d"
          descripcion="Recogebolas Hammer en 3D rodando por una pista azul y recogiendo las pelotas, que se quedan dentro de la cesta"
          className="pvideo--hero"
        />
        <div className="stack">
          <p className="kicker">Accesorio</p>
          <h1 className="display">Recogebolas Hammer</h1>
          <p className="lede">{lemas.recoger} {recogebolas.descripcion}</p>
          <Price texto={recogebolas.precioTexto} envio={envio.recogebolas} />
          <div className="cta-row">
            <Link className="btn btn--accent btn--lg" href="/contacto?asunto=compra-recogebolas">Solicitar compra</Link>
            <Link className="btn btn--ghost" href="/comprar">Ver la máquina</Link>
          </div>
          <p className="balls__pista">
            <span className="solo-raton">Pasa el ratón por el fondo: recoge tú las pelotas.</span>
            <span className="solo-tactil">Toca una pelota y, sin soltar, desliza el dedo para recoger las demás.</span>
          </p>
          <p className="notice">
            <strong>Prototipo.</strong> Se vende por separado. Packs y promociones no están definidos.
          </p>
          <dl className="spec">
            {["Material", "Capacidad", "Dimensiones"].map((k) => (
              <div key={k}><dt>{k}</dt><dd className="pending">Pendiente de documentación oficial</dd></div>
            ))}
          </dl>
        </div>
      </div>

      <section className="uso" aria-labelledby="t-uso">
        <h2 id="t-uso" className="display display--md">Así se usa</h2>
        <div className="uso__grid">
          <ProductVideo
            base="/medios/recogebolas/recogebolas"
            descripcion="Recogebolas Hammer recogiendo pelotas en pista y vaciándolas en la máquina"
          />
          <div className="uso__fotos">
            <ProductPhoto
              src="/medios/recogebolas/completo.webp"
              alt="Recogebolas Hammer completo: mango largo con dos empuñaduras y cesta de varillas con el logotipo Hammer"
              ancho={898}
              alto={1123}
              claro
              pie="El recogebolas completo"
            />
            <ProductPhoto
              src="/medios/recogebolas/detalle.webp"
              alt="Detalle de la cesta del recogebolas Hammer con el logotipo en el disco central"
              ancho={1000}
              alto={1000}
              pie="Detalle de la cesta"
            />
          </div>
        </div>
      </section>
    </div>
    </ZonaRecogebolas>
  );
}
