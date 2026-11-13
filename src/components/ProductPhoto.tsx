/**
 * Fotografía real de producto (aportada por Hammer Padel).
 * `claro` envuelve las fotos de fondo blanco en un panel claro para que no
 * choquen con el lienzo oscuro.
 */
export function ProductPhoto({
  src,
  alt,
  ancho,
  alto,
  claro = false,
  prioridad = false,
  pie,
  className = "",
}: {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  claro?: boolean;
  prioridad?: boolean;
  pie?: string;
  className?: string;
}) {
  return (
    <figure className={`photo${claro ? " photo--claro" : ""} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- export estático, imagen ya optimizada */}
      <img
        src={src}
        alt={alt}
        width={ancho}
        height={alto}
        loading={prioridad ? "eager" : "lazy"}
        fetchPriority={prioridad ? "high" : undefined}
        decoding="async"
      />
      {pie ? <figcaption>{pie}</figcaption> : null}
    </figure>
  );
}
