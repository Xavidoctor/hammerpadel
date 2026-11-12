import type { Metadata } from "next";
import Link from "next/link";
import { Price } from "@/components/Price";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { ProductSlot } from "@/components/ProductSlot";
import { lemas, recogebolas } from "@/content/catalogo";

export const metadata: Metadata = {
  title: "Recogebolas Hammer",
  description: `${recogebolas.descripcion} ${recogebolas.precioTexto}.`,
  alternates: { canonical: "/recogebolas" },
};

export default function Recogebolas() {
  return (
    <div className="page">
      <ProductJsonLd p={recogebolas} />
      <div className="product-page">
        <ProductSlot producto="Recogebolas Hammer" />
        <div className="stack">
          <p className="kicker">Accesorio</p>
          <h1 className="display">Recogebolas Hammer</h1>
          <p className="lede">{lemas.recoger} {recogebolas.descripcion}</p>
          <Price texto={recogebolas.precioTexto} />
          <div className="cta-row">
            <Link className="btn btn--accent btn--lg" href="/contacto?asunto=compra-recogebolas">Solicitar compra</Link>
            <Link className="btn btn--ghost" href="/comprar">Ver la máquina</Link>
          </div>
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
    </div>
  );
}
