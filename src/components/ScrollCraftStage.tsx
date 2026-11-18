"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Monta el motor Scroll Craft (vendorizado, sin modificar) sobre HTML ya
 * renderizado en servidor. Niveles de experiencia:
 *  - completo: motor activo.
 *  - estático: no se carga el motor (sin animación elegida, ahorro de datos,
 *    red lenta, poca memoria). El HTML se muestra tal cual.
 * prefers-reduced-motion lo gestiona el propio motor (cues sin desplazamiento,
 * sin vídeo, solo póster).
 */
const noop = () => () => {};

/**
 * Cada escena tiene su vídeo en varias resoluciones y formatos (ver
 * produccion/LEEME-videos-escritorio.md). Antes de montar el motor se elige el
 * que encaja con la VENTANA, para no estirar ni recortar de más:
 *  - ventana vertical (más alta que ancha): vídeo vertical 9:16 (móvil)
 *  - ventana de proporción 2:1 o más (lo normal en un PC con la barra del
 *    navegador y la de tareas, o en monitores ultrapanorámicos): versión 21:9
 *  - resto: 16:9 a 1920x1080 o, en pantallas grandes o de alta densidad, 2560x1440
 * Se decide por la forma de la ventana y no por su ancho: un portátil con la
 * escala de Windows al 150 % puede tener menos de 860 px de ancho y no por eso
 * debe recibir el vídeo vertical (se vería con un zoom enorme).
 */
export function varianteVideo(ancho: number, alto: number, dpr: number) {
  if (alto > ancho) return "m";
  const fisicoAncho = ancho * dpr, fisicoAlto = alto * dpr;
  if (ancho / alto >= 2) return fisicoAncho > 2700 ? "uw" : "uwhd";
  return fisicoAncho > 2100 || fisicoAlto > 1200 ? "2k" : "hd";
}
function elegirVideos(raiz: HTMLElement) {
  const v = varianteVideo(innerWidth, innerHeight, devicePixelRatio || 1);
  raiz.querySelectorAll<HTMLVideoElement>("video[data-hp-base]").forEach((el) => {
    const base = el.dataset.hpBase!;
    const src = v === "m" ? el.getAttribute("data-sc-src-mobile") || `${base}.mp4` : v === "hd" ? `${base}.mp4` : `${base}-${v}.mp4`;
    el.setAttribute("data-sc-src", src);
    // El motor da prioridad al vídeo móvil por ancho de ventana: se decide aquí.
    el.removeAttribute("data-sc-src-mobile");
    el.dataset.hpVariante = v;
  });
}

function leerPreferencia() {
  try {
    return localStorage.getItem("hp-sin-animacion") === "1";
  } catch {
    return false;
  }
}

export function ScrollCraftStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const nav = navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
    };
    const ligero =
      root.classList.contains("hp-static") ||
      leerPreferencia() ||
      nav.connection?.saveData === true ||
      /(^|-)2g$|^3g$/.test(nav.connection?.effectiveType ?? "") ||
      (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2);

    if (ligero) {
      root.classList.add("hp-static");
      return;
    }

    let api: { destroy?: () => void } | undefined;
    let cancelado = false;
    // Si el motor no llega en 4 s, se muestra todo estático.
    const red = setTimeout(() => {
      if (!api) root.classList.add("hp-static");
    }, 4000);

    // @ts-ignore: motor vendorizado (IIFE sin exports) que define window.ScrollCraft
    import("../vendor/scrollcraft/scrollcraft.js")
      .then(() => {
        if (cancelado || !ref.current || !window.ScrollCraft) return;
        elegirVideos(ref.current);
        api = window.ScrollCraft.mount(ref.current);
        root.classList.add("hp-motion");
      })
      .catch(() => root.classList.add("hp-static"));

    return () => {
      cancelado = true;
      clearTimeout(red);
      api?.destroy?.();
      root.classList.remove("hp-motion");
    };
  }, []);

  return (
    <div ref={ref} className="world">
      <span data-sc-progress aria-hidden="true" />
      {children}
    </div>
  );
}

/** Botón para elegir ver la landing sin animación (se recuerda en este navegador). */
export function MotionToggle() {
  const estatico = useSyncExternalStore(noop, leerPreferencia, () => false);
  const alternar = () => {
    try {
      if (estatico) localStorage.removeItem("hp-sin-animacion");
      else localStorage.setItem("hp-sin-animacion", "1");
    } catch {}
    location.reload();
  };
  return (
    <button type="button" className="motion-toggle" onClick={alternar}>
      {estatico ? "Activar animación" : "Ver sin animación"}
    </button>
  );
}
