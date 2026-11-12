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
