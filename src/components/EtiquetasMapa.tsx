"use client";

import { useEffect, useRef } from "react";

/**
 * Nombres de los pueblos sobre el mapa de la escena de alquiler (solo escritorio).
 *
 * En escritorio el vídeo del mapa se renderiza SIN textos: el render
 * (produccion/escena-3) exporta, fotograma a fotograma, dónde cae cada nombre
 * y con qué tamaño y opacidad. Aquí se dibujan como texto real encima del
 * vídeo, sincronizados con su tiempo, así se ven nítidos a cualquier tamaño de
 * pantalla. En ventanas verticales el vídeo 9:16 ya lleva los nombres dentro.
 *
 * Formato de etiquetas*.json: { fps, aspecto, nombres, lados, f: [[x, y, alto, opacidad, encendido] x pueblos + mar] }
 * con x, y y alto en fracción del fotograma.
 */
type Datos = { fps: number; aspecto: number; nombres: string[]; lados: string[]; f: number[][][] };

const URL_169 = "/medios/alquiler/etiquetas.json";
const URL_UW = "/medios/alquiler/etiquetas-uw.json";

export function EtiquetasMapa() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const capa = ref.current;
    // Ventana vertical: vídeo 9:16, que ya lleva los nombres dentro.
    if (!capa || innerHeight > innerWidth) return;
    const stage = capa.parentElement as HTMLElement;
    const video = stage.querySelector("video");
    let datos: Datos | null = null;
    let spans: HTMLSpanElement[] = [];
    let raf = 0;
    let activo = false;
    let ultimo = "";
    let cancelado = false;

    const ultra = () => {
      const v = video?.dataset.hpVariante;
      return v ? v.startsWith("uw") : innerWidth / innerHeight >= 2;
    };

    const pintar = () => {
      raf = 0;
      if (!datos) return;
      const fps = datos.fps;
      const listo = video && video.readyState >= 1;
      const i = listo ? Math.round(video!.currentTime * fps) : 0; // pasado el último fotograma con mapa: sin nombres
      const cw = stage.clientWidth, ch = stage.clientHeight;
      const clave = `${i}|${cw}|${ch}`;
      if (clave !== ultimo) {
        ultimo = clave;
        // object-fit: cover, como el vídeo (proporción real del vídeo si ya la conocemos)
        const asp = video && video.videoWidth ? video.videoWidth / video.videoHeight : datos.aspecto;
        const esc = Math.max(cw / asp, ch);
        const dx = (cw - asp * esc) / 2, dy = (ch - esc) / 2;
        const fila = datos.f[i] ?? [];
        spans.forEach((s, k) => {
          const e = fila[k];
          if (!e || e[3] < 0.01) { s.style.opacity = "0"; return; }
          const [x, y, alto, op, on] = e;
          s.style.opacity = op.toFixed(3);
          s.style.fontSize = `${(alto * esc).toFixed(2)}px`;
          s.style.left = `${(dx + x * asp * esc).toFixed(1)}px`;
          s.style.top = `${(dy + y * esc).toFixed(1)}px`;
          s.classList.toggle("mapa__pueblo--on", on > 0.5);
        });
      }
      if (activo) raf = requestAnimationFrame(pintar);
    };

    const cargar = () => {
      fetch(ultra() ? URL_UW : URL_169)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d: Datos) => {
          if (cancelado) return;
          datos = d;
          capa.textContent = "";
          spans = [...d.nombres, "Mar Mediterráneo"].map((n, k) => {
            const s = document.createElement("span");
            s.textContent = n;
            s.className = k < d.nombres.length ? `mapa__pueblo mapa__pueblo--${d.lados[k]}` : "mapa__mar";
            capa.appendChild(s);
            return s;
          });
          pintar();
        })
        .catch(() => {});
    };

    const io = new IntersectionObserver(([e]) => {
      activo = e.isIntersecting;
      if (activo && !datos) cargar();
      if (activo && !raf) raf = requestAnimationFrame(pintar);
    });
    io.observe(stage);
    return () => {
      cancelado = true;
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="mapa__etiquetas" aria-hidden="true" />;
}
