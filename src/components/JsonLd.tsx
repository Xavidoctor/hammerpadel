/** Inserta datos estructurados schema.org. Solo datos confirmados. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

/** Migas de pan: Inicio > página. Las URL son relativas mientras no haya dominio. */
export function BreadcrumbJsonLd({ nombre, ruta }: { nombre: string; ruta: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: "/" },
          { "@type": "ListItem", position: 2, name: nombre, item: ruta },
        ],
      }}
    />
  );
}
