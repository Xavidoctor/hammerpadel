/**
 * Hueco honesto para el producto. No dibuja ninguna máquina ni recogebolas:
 * su aspecto real está pendiente de fotografía o CAD. Se sustituirá por
 * <Image> con la fotografía/render definitivo.
 */
export function ProductSlot({
  producto,
  className = "",
  variante = "estudio",
}: {
  producto: string;
  className?: string;
  variante?: "estudio" | "pista";
}) {
  return (
    <figure className={`slot slot--${variante} ${className}`}>
      <div className="slot__frame" role="img" aria-label={`Espacio reservado para la fotografía real de ${producto}`}>
        <span className="slot__corner slot__corner--tl" aria-hidden="true" />
        <span className="slot__corner slot__corner--tr" aria-hidden="true" />
        <span className="slot__corner slot__corner--bl" aria-hidden="true" />
        <span className="slot__corner slot__corner--br" aria-hidden="true" />
      </div>
      <figcaption className="slot__label">{producto} · fotografía real pendiente</figcaption>
    </figure>
  );
}
