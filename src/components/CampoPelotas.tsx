"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fondo interactivo de la escena del recogebolas en la portada.
 * Pelotas realistas (renderizadas desde el modelo 3D, produccion/escena-4/sprites.html)
 * repartidas por el fondo. Con ratón, sobre el fondo oscuro el cursor se convierte en el
 * Recogebolas Hammer y al pasar por encima de una pelota la recoge: la pelota entra y la
 * cesta del cursor se va llenando. En pantallas táctiles se recogen tocándolas.
 *
 * Es decoración (aria-hidden): no tapa ni bloquea el texto ni el botón de compra; sobre
 * ellos vuelve el cursor normal. Sin JavaScript se ven las pelotas quietas.
 */

const TOTAL = 28;
const FRAMES = 29; // cursor-recogebolas.webp: cesta con 0..28 pelotas
const SPRITE = 320; // px de cada fotograma del cursor en el archivo
const ESCALA = 0.62; // tamaño en pantalla del cursor
const FOCO = { x: 114, y: 238 }; // centro de la cesta dentro del fotograma (px del archivo)
const RADIO_CESTA = 52; // px en pantalla

// Posiciones fijas (en % de la sección) y tamaño en px; banda baja y márgenes laterales.
const PELOTAS = Array.from({ length: TOTAL }, (_, i) => ({
  x: (i * 37 + 3) % 97,
  y: i % 7 === 0 ? 14 + ((i * 29) % 30) : 56 + ((i * 23) % 38),
  t: 22 + ((i * 13) % 15),
  v: i % 8,
  g: (i * 47) % 360,
}));

// Sobre enlaces, botones y el vídeo vuelve el cursor normal; el resto de la sección es fondo.
const ZONAS_NORMALES = "a, button, input, video, .pvideo";

export function CampoPelotas() {
  const campo = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [recogidas, setRecogidas] = useState<boolean[]>(() => Array(TOTAL).fill(false));
  const estado = useRef({ recogidas: Array(TOTAL).fill(false) as boolean[], n: 0, ultimoX: 0 });
  const [cuenta, setCuenta] = useState(0);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const el = campo.current;
    const seccion = el?.parentElement;
    const cur = cursor.current;
    if (!el || !seccion || !cur) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    seccion.classList.add("balls--juego");
    if (reducido) seccion.classList.add("balls--quieto");
    let ocultarTactil = 0;
    let rellenar = 0;

    const pintarCursor = (n: number) => {
      cur.style.backgroundPosition = `${-Math.min(n, FRAMES - 1) * SPRITE * ESCALA}px 0`;
    };
    const recoger = (i: number) => {
      const st = estado.current;
      if (st.recogidas[i]) return;
      st.recogidas[i] = true;
      st.n += 1;
      setRecogidas([...st.recogidas]);
      setCuenta(st.n);
      // la cesta se llena cuando la pelota ya ha entrado
      window.setTimeout(() => pintarCursor(st.n), reducido ? 0 : 200);
      if (st.n === TOTAL) {
        rellenar = window.setTimeout(() => {
          st.recogidas = Array(TOTAL).fill(false);
          st.n = 0;
          setRecogidas([...st.recogidas]);
          setCuenta(0);
          pintarCursor(0);
        }, 2600);
      }
    };
    const buscar = (cx: number, cy: number, radio: number) => {
      const r = seccion.getBoundingClientRect();
      const bolas = el.children;
      for (let i = 0; i < TOTAL; i++) {
        if (estado.current.recogidas[i]) continue;
        const b = bolas[i] as HTMLElement;
        const p = PELOTAS[i];
        const bx = r.left + (p.x / 100) * r.width + p.t / 2;
        const by = r.top + (p.y / 100) * r.height + p.t / 2;
        if (Math.hypot(bx - cx, by - cy) < radio + p.t / 2) {
          b.style.setProperty("--dx", `${cx - bx}px`);
          b.style.setProperty("--dy", `${cy - by}px`);
          recoger(i);
        }
      }
    };
    const colocar = (x: number, y: number, inclinacion = 0) => {
      cur.style.transform = `translate3d(${x - FOCO.x * ESCALA}px, ${y - FOCO.y * ESCALA}px, 0) rotate(${inclinacion}deg)`;
    };

    const mover = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const sobreFondo = !(e.target as Element).closest(ZONAS_NORMALES);
      setActivo(sobreFondo);
      if (!sobreFondo) return;
      const vx = e.clientX - estado.current.ultimoX;
      estado.current.ultimoX = e.clientX;
      colocar(e.clientX, e.clientY, reducido ? 0 : Math.max(-10, Math.min(10, vx * 0.6)));
      buscar(e.clientX, e.clientY, RADIO_CESTA);
    };
    const salir = () => setActivo(false);
    const tocar = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || (e.target as Element).closest(ZONAS_NORMALES)) return;
      // en táctil el recogebolas aparece donde tocas, recoge y se va
      colocar(e.clientX, e.clientY);
      setActivo(true);
      buscar(e.clientX, e.clientY, RADIO_CESTA + 10);
      window.clearTimeout(ocultarTactil);
      ocultarTactil = window.setTimeout(() => setActivo(false), 900);
    };

    seccion.addEventListener("pointermove", mover);
    seccion.addEventListener("pointerleave", salir);
    seccion.addEventListener("pointerdown", tocar);
    return () => {
      seccion.removeEventListener("pointermove", mover);
      seccion.removeEventListener("pointerleave", salir);
      seccion.removeEventListener("pointerdown", tocar);
      seccion.classList.remove("balls--juego", "balls--quieto");
      window.clearTimeout(ocultarTactil);
      window.clearTimeout(rellenar);
    };
  }, []);

  return (
    <>
      <div ref={campo} className="balls" aria-hidden="true">
        {PELOTAS.map((p, i) => (
          <span
            key={i}
            className={recogidas[i] ? "is-recogida" : undefined}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.t,
              height: p.t,
              backgroundPosition: `${(p.v / 7) * 100}% 0`,
              rotate: `${p.g}deg`,
            }}
          />
        ))}
      </div>
      <div ref={cursor} className={`balls__cursor${activo ? " is-activo" : ""}`} aria-hidden="true" />
      <p className={`balls__cuenta${cuenta ? " is-visible" : ""}`} aria-hidden="true">
        {cuenta === TOTAL ? "¡Pista recogida!" : `${cuenta} / ${TOTAL} pelotas`}
      </p>
    </>
  );
}
