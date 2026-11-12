import { NOTA_IVA } from "@/content/catalogo";

export function Price({ texto, sufijo, nota = true }: { texto: string; sufijo?: string; nota?: boolean }) {
  return (
    <p className="price">
      <span className="price__num">{texto}</span>
      {sufijo ? <span className="price__suf">{sufijo}</span> : null}
      {nota ? <span className="price__note">{NOTA_IVA}</span> : null}
    </p>
  );
}
