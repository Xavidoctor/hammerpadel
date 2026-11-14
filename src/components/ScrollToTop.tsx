"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Al cambiar de página, la nueva se abre arriba del todo.
 * Next ya lo intenta, pero con el scroll suave de Scroll Craft y la cabecera fija
 * se quedaba a medio camino. Excepciones: los enlaces con ancla (#seccion) van a
 * su sección, y el botón «atrás» del navegador recupera la posición anterior.
 */
export function ScrollToTop() {
  const ruta = usePathname();
  const primera = useRef(true);
  const atras = useRef(false);

  useEffect(() => {
    const alVolver = () => { atras.current = true; };
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
  }, []);

  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    if (atras.current) { atras.current = false; return; }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [ruta]);

  return null;
}
