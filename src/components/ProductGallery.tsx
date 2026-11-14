"use client";

import { useState } from "react";

export type FotoGaleria = { src: string; alt: string; ancho: number; alto: number; nombre: string };

/**
 * Galería sencilla de fotos de producto: una grande y miniaturas para cambiarla.
 * Sin JS se ve la primera foto y las miniaturas como imágenes normales.
 */
export function ProductGallery({ fotos, className = "" }: { fotos: FotoGaleria[]; className?: string }) {
  const [activa, setActiva] = useState(0);
  const f = fotos[activa];
  return (
    <div className={`galeria ${className}`}>
      <figure className="photo photo--recorte">
        {/* eslint-disable-next-line @next/next/no-img-element -- export estático, imagen ya optimizada */}
        <img src={f.src} alt={f.alt} width={f.ancho} height={f.alto} loading="eager" fetchPriority="high" decoding="async" />
      </figure>
      <ul className="galeria__miniaturas" aria-label="Otras vistas de la máquina">
        {fotos.map((g, i) => (
          <li key={g.src}>
            <button
              type="button"
              className="galeria__mini"
              aria-pressed={i === activa}
              aria-label={`Ver ${g.nombre}`}
              onClick={() => setActiva(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura */}
              <img src={g.src} alt="" width={g.ancho} height={g.alto} loading="lazy" decoding="async" />
              <span>{g.nombre}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
