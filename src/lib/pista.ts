/**
 * Geometría de una pista de pádel esquemática (10 x 20 m, líneas de saque a
 * 6,95 m de la red) proyectada en perspectiva para dibujarla en SVG.
 * Se usa con dos encuadres nativos: horizontal (escritorio) y vertical (móvil).
 * No representa ninguna instalación concreta.
 */
export type Encuadre = {
  w: number; h: number; cx: number; cy: number; f: number; camZ: number; camY: number;
};

export const HORIZONTAL: Encuadre = { w: 1600, h: 900, cx: 800, cy: 300, f: 860, camZ: 26, camY: 3.4 };
export const VERTICAL: Encuadre = { w: 900, h: 1600, cx: 450, cy: 700, f: 820, camZ: 26.5, camY: 4.6 };

export type P = [number, number];

export function proyectar(e: Encuadre, x: number, y: number, z: number): P {
  const d = Math.max(0.5, e.camZ - z);
  return [e.cx + (x * e.f) / d, e.cy + ((e.camY - y) * e.f) / d];
}

const r = (n: number) => Math.round(n * 10) / 10;
const pts = (ps: P[]) => ps.map(([x, y]) => `${r(x)},${r(y)}`).join(" ");

export function pista(e: Encuadre) {
  const p = (x: number, y: number, z: number) => proyectar(e, x, y, z);
  const suelo = pts([p(-5, 0, 0), p(5, 0, 0), p(5, 0, 20), p(-5, 0, 20)]);
  const lineas: [P, P][] = [
    [p(-5, 0, 0), p(5, 0, 0)],
    [p(5, 0, 0), p(5, 0, 20)],
    [p(5, 0, 20), p(-5, 0, 20)],
    [p(-5, 0, 20), p(-5, 0, 0)],
    [p(-5, 0, 3.05), p(5, 0, 3.05)],
    [p(-5, 0, 16.95), p(5, 0, 16.95)],
    [p(0, 0, 3.05), p(0, 0, 16.95)],
  ];
  const red: [P, P] = [p(-5, 0.88, 10), p(5, 0.88, 10)];
  const redPoste: [P, P][] = [
    [p(-5, 0, 10), p(-5, 0.88, 10)],
    [p(5, 0, 10), p(5, 0.88, 10)],
  ];
  const cristalFondo = pts([p(-5, 0, 0), p(5, 0, 0), p(5, 3, 0), p(-5, 3, 0)]);
  const cristalLados: string[] = [
    pts([p(-5, 0, 0), p(-5, 3, 0), p(-5, 3, 2), p(-5, 2, 4), p(-5, 0, 4)]),
    pts([p(5, 0, 0), p(5, 3, 0), p(5, 3, 2), p(5, 2, 4), p(5, 0, 4)]),
  ];
  const mallaLados: [P, P][] = [
    [p(-5, 4, 0), p(-5, 4, 20)],
    [p(5, 4, 0), p(5, 4, 20)],
    [p(-5, 4, 0), p(5, 4, 0)],
  ];
  const focos = [
    { x: -5.6, z: 3 }, { x: 5.6, z: 3 }, { x: -5.6, z: 10 }, { x: 5.6, z: 10 }, { x: -5.6, z: 17 }, { x: 5.6, z: 17 },
  ].map((f, i) => ({ i, base: p(f.x, 0, f.z), cabeza: p(f.x, 6, f.z), escala: e.f / (e.camZ - f.z) }));

  return { suelo, lineas, red, redPoste, cristalFondo, cristalLados, mallaLados, focos };
}

/** Golpes del entrenamiento: punto de bote en el campo del jugador (x, z en metros). */
export const golpes = [
  { id: "derecha", texto: "Derecha", x: 2.6, z: 16.2 },
  { id: "reves", texto: "Revés", x: -2.7, z: 16.4 },
  { id: "bandeja", texto: "Bandeja", x: 1.8, z: 18.6 },
  { id: "vibora", texto: "Víbora", x: -1.6, z: 18.8 },
  { id: "volea", texto: "Volea", x: 1.1, z: 12.6 },
  { id: "desplazamiento", texto: "Desplazamiento", x: -3.9, z: 13.4 },
  { id: "repeticion", texto: "Repetición", x: 2.6, z: 16.2 },
] as const;

/** Origen de las bolas: fondo de pista contrario, centrado (posición orientativa). */
export const ORIGEN = { x: 0, y: 0.9, z: 1.2 };

export function trayectoria(e: Encuadre, x: number, z: number, desvio = 0) {
  const a = proyectar(e, ORIGEN.x, ORIGEN.y, ORIGEN.z);
  const b = proyectar(e, x + desvio, 0, z + desvio * 0.6);
  const alto = proyectar(e, (ORIGEN.x + x) / 2, 3.6 + Math.abs(desvio), (ORIGEN.z + z) / 2 + 2);
  return { d: `M ${r(a[0])} ${r(a[1])} Q ${r(alto[0])} ${r(alto[1])} ${r(b[0])} ${r(b[1])}`, fin: b };
}
