"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Zona interactiva del recogebolas: en la portada, desde la sección del recogebolas hasta
 * el final; y en la página de producto /recogebolas.
 * Pelotas realistas (renderizadas desde el modelo 3D, produccion/escena-4/sprites.html)
 * repartidas por el fondo. Con ratón, sobre el fondo oscuro el cursor se convierte en el
 * Recogebolas Hammer y al pasar por encima de una pelota la recoge: la pelota entra y la
 * cesta del cursor se va llenando. Solo con ratón: en móvil y tabletas no se muestra.
 *
 * Es decoración (aria-hidden): no tapa ni bloquea el texto ni el botón de compra; sobre
 * ellos vuelve el cursor normal. Sin JavaScript se ven las pelotas quietas.
 */

const FRAMES = 29; // cursor-recogebolas.webp: cesta con 0..28 pelotas
const SPRITE = 320; // px de cada fotograma del cursor en el archivo
const ESCALA = 0.62; // tamaño en pantalla del cursor
const FOCO = { x: 114, y: 238 }; // centro de la cesta dentro del fotograma (px del archivo)
const RADIO_CESTA = 52; // px en pantalla

// Pelotas repartidas por toda la zona (en % de su ancho y alto), de forma uniforme pero
// irregular (secuencia de la razón áurea), y tamaño en px.
const frac = (v: number) => v - Math.floor(v);
function repartir(total: number) {
  return Array.from({ length: total }, (_, i) => ({
    x: Math.round((1 + frac(i * 0.618034 + 0.13) * 95) * 100) / 100,
    y: Math.round((1 + ((i + 0.15 + frac(i * 0.7548777) * 0.7) / total) * 96) * 100) / 100,
    t: 22 + ((i * 13) % 15),
    v: i % 8,
    g: (i * 47) % 360,
  }));
}

// Sobre enlaces, botones, el vídeo y la cabecera vuelve el cursor normal; el resto es fondo.
// La zona sigue activa por debajo hasta el final de la página (pie incluido).
const ZONAS_NORMALES = "a, button, input, select, textarea, video, .pvideo, header, dialog";
// Lo que tapa o bloquea una pelota: ahí no se puede poner ninguna (se movería a un hueco libre).
const OBSTACULOS = "a, button, input, select, textarea, video, .pvideo, .photo, img, .notice, .galeria";
const SOLO_RATON = "(hover: hover) and (pointer: fine)";

type Pelota = ReturnType<typeof repartir>[number];

/** Mueve a un hueco libre cercano las pelotas que caen debajo de un botón, enlace, foto o vídeo,
 *  para que todas se vean y se puedan recoger. Medidas en px relativas a la zona. */
function liberar(pelotas: Pelota[], zona: HTMLElement): Pelota[] {
  const z = zona.getBoundingClientRect();
  const W = z.width, H = z.height;
  const MARGEN = 18; // la cesta tiene que poder tocar la pelota sin pisar el obstáculo
  const cajas = Array.from(zona.querySelectorAll<HTMLElement>(OBSTACULOS))
    .filter((e) => !e.closest(".balls, .balls__cursor, .balls__cuenta"))
    .map((e) => e.getBoundingClientRect())
    .filter((r) => r.width > 0 && r.height > 0)
    .map((r) => ({ x0: r.left - z.left - MARGEN, y0: r.top - z.top - MARGEN, x1: r.right - z.left + MARGEN, y1: r.bottom - z.top + MARGEN }));
  const libre = (x: number, y: number, t: number) =>
    x >= 8 && y >= 8 && x + t <= W - 8 && y + t <= H - 8 &&
    cajas.every((c) => x + t < c.x0 || x > c.x1 || y + t < c.y0 || y > c.y1);
  const puestas: { x: number; y: number; t: number }[] = [];
  const separada = (x: number, y: number, t: number) => puestas.every((q) => Math.hypot(q.x - x, q.y - y) > (q.t + t) / 2 + 6);
  return pelotas.map((p) => {
    let x = (p.x / 100) * W, y = (p.y / 100) * H;
    if (!(libre(x, y, p.t) && separada(x, y, p.t))) {
      buscar: for (let r = 24; r < Math.max(W, H); r += 24) {
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r;
          if (libre(nx, ny, p.t) && separada(nx, ny, p.t)) { x = nx; y = ny; break buscar; }
        }
      }
    }
    puestas.push({ x, y, t: p.t });
    return { ...p, x: (x / W) * 100, y: (y / H) * 100 };
  });
}

export function ZonaRecogebolas({ children, total = 28 }: { children: React.ReactNode; total?: number }) {
  const TOTAL = total;
  const [PELOTAS, setPelotas] = useState(() => repartir(total));
  const posiciones = useRef(PELOTAS);
  useEffect(() => {
    posiciones.current = PELOTAS;
  }, [PELOTAS]);
  const zona = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const [recogidas, setRecogidas] = useState<boolean[]>(() => Array(TOTAL).fill(false));
  const estado = useRef({ recogidas: Array(TOTAL).fill(false) as boolean[], n: 0, ultimoX: 0 });
  const [cuenta, setCuenta] = useState(0);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const el = campo.current;
    const seccion = zona.current;
    const cur = cursor.current;
    if (!el || !seccion || !cur) return;
    // solo con ratón: en móvil y tabletas no hay recogebolas (ni pelotas, ver CSS)
    if (!window.matchMedia(SOLO_RATON).matches) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    seccion.classList.add("balls--juego");
    if (reducido) seccion.classList.add("balls--quieto");
    let rellenar = 0;

    const pintarCursor = (n: number) => {
      // la cesta tiene 29 estados (0..28 pelotas): se reparte la cuenta entre ellos
      const f = Math.round((Math.min(n, TOTAL) / TOTAL) * (FRAMES - 1));
      cur.style.backgroundPosition = `${-f * SPRITE * ESCALA}px 0`;
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
        const p = posiciones.current[i];
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
      const sobreFondo =
        e.clientY >= seccion.getBoundingClientRect().top && !(e.target as Element).closest(ZONAS_NORMALES);
      setActivo(sobreFondo);
      if (!sobreFondo) return;
      const vx = e.clientX - estado.current.ultimoX;
      estado.current.ultimoX = e.clientX;
      colocar(e.clientX, e.clientY, reducido ? 0 : Math.max(-10, Math.min(10, vx * 0.6)));
      buscar(e.clientX, e.clientY, RADIO_CESTA);
    };
    const salir = () => setActivo(false);

    const raiz = document.documentElement;
    document.addEventListener("pointermove", mover);
    raiz.addEventListener("pointerleave", salir);
    return () => {
      document.removeEventListener("pointermove", mover);
      raiz.removeEventListener("pointerleave", salir);
      raiz.classList.remove("hp-cursor-recogebolas");
      seccion.classList.remove("balls--juego", "balls--quieto");
      window.clearTimeout(rellenar);
    };
  }, [TOTAL]);

  // Ninguna pelota debajo de botones, enlaces, fotos o vídeos: se recolocan al cargar y al
  // cambiar el tamaño de la zona (cambia el reparto del texto y las imágenes).
  useEffect(() => {
    const z = zona.current;
    if (!z || !window.matchMedia(SOLO_RATON).matches) return;
    let t = 0;
    const recolocar = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setPelotas(liberar(repartir(TOTAL), z)), 120);
    };
    recolocar();
    const ro = new ResizeObserver(recolocar);
    ro.observe(z);
    window.addEventListener("load", recolocar);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", recolocar);
      window.clearTimeout(t);
    };
  }, [TOTAL]);

  // sin cursor del sistema mientras se ve el recogebolas (también sobre el pie)
  useEffect(() => {
    document.documentElement.classList.toggle("hp-cursor-recogebolas", activo);
  }, [activo]);

  return (
    <div ref={zona} className="zona-recogebolas">
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
      <p className={`balls__cuenta${cuenta && activo ? " is-visible" : ""}`} aria-hidden="true">
        {cuenta === TOTAL ? "¡Pista recogida!" : `${cuenta} / ${TOTAL} pelotas`}
      </p>
      {children}
    </div>
  );
}
