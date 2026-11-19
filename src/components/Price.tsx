import { NOTA_IVA } from "@/content/catalogo";

export function Price({ texto, sufijo, nota = true, envio }: { texto: string; sufijo?: string; nota?: boolean; envio?: string }) {
  return (
    <p className="price">
      <span className="price__num">{texto}</span>
      {sufijo ? <span className="price__suf">{sufijo}</span> : null}
      {nota ? <span className="price__note">{NOTA_IVA}{envio ? ` ${envio}` : ""}</span> : null}
    </p>
  );
}
