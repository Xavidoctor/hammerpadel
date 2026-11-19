import { alquiler, maquina } from "@/content/catalogo";
import { rutaLocalidad, type PaginaLocalidad } from "@/content/localidades";

/**
 * Datos estructurados del alquiler en una localidad: Service + Offer y
 * BreadcrumbList. Sin LocalBusiness ni dirección (no hay instalación propia),
 * sin reseñas y sin horario por días (no confirmado).
 */
export function RentalJsonLd({ p, base }: { p: PaginaLocalidad; base: string }) {
  const url = `${base}${rutaLocalidad(p.id)}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: p.keyword,
      serviceType: "Alquiler de máquina lanzapelotas de pádel",
      description: `Alquiler de la máquina lanzapelotas ${maquina.nombre} en ${p.nombre}: la llevamos a tu pista. ${alquiler.resumen}.`,
      url,
      provider: { "@type": "Organization", name: "Hammer Padel" },
      areaServed: {
        "@type": "City",
        name: p.nombre,
        containedInPlace: { "@type": "AdministrativeArea", name: "Marina Alta, Alicante" },
      },
      offers: {
        "@type": "Offer",
        price: (alquiler.precioCentimos / 100).toFixed(2),
        priceCurrency: "EUR",
        description: `Sesión de ${alquiler.duracionMinutos} minutos con ${alquiler.pelotas} pelotas y un recogebolas incluidos. Segundo recogebolas: ${alquiler.recogebolasExtraTexto} más por sesión.`,
        eligibleDuration: { "@type": "QuantitativeValue", value: alquiler.duracionMinutos, unitCode: "MIN" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: `${base}/` },
        { "@type": "ListItem", position: 2, name: "Alquiler", item: `${base}${alquiler.ruta}` },
        { "@type": "ListItem", position: 3, name: p.nombre, item: url },
      ],
    },
  ];
  const faq = p.local?.preguntas.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: p.local.preguntas.map((q) => ({
          "@type": "Question",
          name: q.pregunta,
          acceptedAnswer: { "@type": "Answer", text: q.respuesta },
        })),
      }
    : null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faq ? [...data, faq] : data) }}
    />
  );
}
