import type { Producto } from "@/content/catalogo";

/** Datos estructurados Product + Offer. Solo datos confirmados. */
export function ProductJsonLd({ p }: { p: Producto }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.nombre,
    description: p.descripcion,
    brand: { "@type": "Brand", name: "Hammer Padel" },
    offers: {
      "@type": "Offer",
      price: (p.precioCentimos / 100).toFixed(2),
      priceCurrency: "EUR",
      // Sin "availability" ni envío: pendientes de definir.
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
