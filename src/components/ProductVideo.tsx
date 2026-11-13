"use client";

import { useEffect, useRef } from "react";

/**
 * Vídeo real de producto (vertical 9:16, sin audio, en bucle).
 * Reglas de rendimiento del sitio (docs/diseno-web.md §15):
 *  - Lo primero que se pinta es el póster; el vídeo nunca entra en la carga inicial
 *    (preload="none" y solo se reproduce tras el evento load).
 *  - Solo se reproduce cuando está a la vista.
 *  - Con movimiento reducido, ahorro de datos, red lenta o "Ver sin animación"
 *    se queda en el póster y no se descarga ni un byte de vídeo.
 *  - Sin JavaScript se ve el póster.
 */
export function ProductVideo({
  base,
  descripcion,
  className = "",
}: {
  /** Ruta sin extensión: se esperan base.webm, base.mp4 y base-poster.webp. */
  base: string;
  /** Descripción accesible de lo que muestra el vídeo. */
  descripcion: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const root = document.documentElement;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    let sinAnimacion = false;
    try {
      sinAnimacion = localStorage.getItem("hp-sin-animacion") === "1";
    } catch {}
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ligero =
      reducido ||
      sinAnimacion ||
      root.classList.contains("hp-static") ||
      nav.connection?.saveData === true ||
      /(^|-)2g$|^3g$/.test(nav.connection?.effectiveType ?? "");
    if (ligero) return;

    let observer: IntersectionObserver | null = null;
    const arrancar = () => {
      observer = new IntersectionObserver(
        ([entrada]) => {
          if (entrada.isIntersecting) video.play().catch(() => {});
          else video.pause();
        },
        { threshold: 0.25 },
      );
      observer.observe(video);
    };

    if (document.readyState === "complete") arrancar();
    else window.addEventListener("load", arrancar, { once: true });

    return () => {
      window.removeEventListener("load", arrancar);
      observer?.disconnect();
    };
  }, []);

  return (
    <figure className={`pvideo ${className}`}>
      <video
        ref={ref}
        className="pvideo__media"
        poster={`${base}-poster.webp`}
        muted
        loop
        playsInline
        preload="none"
        aria-label={descripcion}
      >
        <source src={`${base}.webm`} type="video/webm" />
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
    </figure>
  );
}
