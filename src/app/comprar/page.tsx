import type { Metadata } from "next";
import Link from "next/link";
import { Price } from "@/components/Price";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { ProductPhoto } from "@/components/ProductPhoto";
import { alquiler, envio, maquina } from "@/content/catalogo";

export const metadata: Metadata = {
  title: "Hammer X MAX · Comprar máquina lanzapelotas de pádel",
  description: `Máquina lanzapelotas ${maquina.nombre} de Hammer Padel para entrenar pádel de forma autónoma. ${maquina.precioTexto}.`,
  alternates: { canonical: "/comprar" },
};

export default function Comprar() {
  return (
    <div className="page">
      <ProductJsonLd p={maquina} />
      <div className="product-page">
        <ProductPhoto
          src="/medios/maquina/maquina.webp"
          alt="Máquina lanzapelotas Hammer X MAX, de color negro, con el logotipo Hammer Padel, asa y ruedas"
          ancho={888}
          alto={1156}
          className="photo--estudio"
        prioridad
        />
        <div className="stack">
          <p className="kicker">Máquina lanzapelotas de pádel</p>
          <h1 className="display">{maquina.nombre}</h1>
          <p className="lede">
            {maquina.descripcion} Pensada para jugadores que quieren entrenar individualmente,
            entrenadores que repiten ejercicios técnicos, clubes y academias.
          </p>
          <Price texto={maquina.precioTexto} envio={envio.maquina} />
          <div className="cta-row">
            <Link className="btn btn--accent btn--lg" href="/contacto?asunto=compra-maquina">Solicitar compra</Link>
            <Link className="btn btn--ghost" href={alquiler.ruta}>Pruébala antes: {alquiler.precioTexto} / 90 min</Link>
          </div>
          <p className="notice">
            <strong>Prototipo.</strong> La compra online se activará cuando se elija la pasarela de pago.
            De momento, la solicitud abre el formulario de contacto.
          </p>

          <div className="prose">
            <h2>Por qué entrenar con máquina</h2>
            <p>
              Entrenar con una máquina lanzapelotas permite repetir el mismo golpe muchas veces seguidas,
              sin depender de un compañero y aprovechando mejor el tiempo de pista.
            </p>
            <h2>Especificaciones técnicas</h2>
            <dl className="spec">
              {["Velocidad", "Capacidad de bolas", "Autonomía", "Dimensiones y peso", "Conectividad", "Garantía"].map((k) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd className="pending">Pendiente de documentación oficial</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
