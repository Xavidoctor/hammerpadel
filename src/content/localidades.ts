/**
 * Contenido de las páginas locales de alquiler (/alquiler/[localidad]).
 *
 * [CONFIRMADO] por Hammer Padel (2026-11-14): el alquiler se hace en la pista
 * del cliente (Hammer Padel lleva la máquina), 25 € / 90 min con 60 pelotas, reservas con
 * inicio entre las 8:00 y las 20:30, de lunes a domingo, con 6 h de antelación
 * mínima, confirmadas a mano por el equipo, solo desde la web; se atienden
 * urbanizaciones y pistas privadas; 1 € por pelota perdida; al principio, pago
 * en efectivo en la sesión. El Verger y Els Poblets añadidos el 14-11-2026.
 * En Ondara y Pedreguer el equipo se queda cerca
 * durante la sesión.
 *
 * [PENDIENTE] Datos propios de cada localidad. No se inventan clubes,
 * direcciones, reseñas ni horarios. Mientras una localidad no tenga sus datos
 * locales reales (`local`), su página se publica con `noindex` y queda fuera
 * del sitemap: cuatro páginas iguales cambiando el nombre del pueblo serían
 * contenido duplicado (ver docs/diseno-web.md, apartado 10.2).
 */
import { localidades, type LocalidadId } from "./catalogo";

export type PreguntaLocal = { pregunta: string; respuesta: string };

/** Lo que hace única a cada página. Rellenar solo con información real. */
export type DatosLocales = {
  /** Zonas, barrios o urbanizaciones donde se lleva la máquina. */
  zonas: string[];
  /** Qué tipo de pistas hay en la zona y dónde se puede usar la máquina. */
  pistas: string;
  /** Preguntas frecuentes reales de clientes de esta localidad. */
  preguntas: PreguntaLocal[];
};

export type PaginaLocalidad = {
  id: LocalidadId;
  nombre: string;
  /** Palabra clave principal de la página. */
  keyword: string;
  /** [CONFIRMADO] Cómo funciona la entrega en esta localidad. */
  entrega: string;
  /** null mientras falten datos locales verificados. */
  local: DatosLocales | null;
};

const keywords: Record<LocalidadId, string> = {
  denia: "Alquiler de máquina de pádel en Dénia",
  ondara: "Alquiler de máquina de pádel en Ondara",
  "la-xara": "Alquiler de máquina de pádel en La Xara",
  pedreguer: "Alquiler de máquina lanzapelotas en Pedreguer",
  "el-verger": "Alquiler de máquina de pádel en El Verger",
  "els-poblets": "Alquiler de máquina de pádel en Els Poblets",
};

const entregaCerca = "Montamos la máquina en unos minutos y nos quedamos cerca durante toda la sesión, por si necesitas algo. Al terminar, la recogemos.";
const entregaVuelta = "Montamos la máquina en unos minutos antes de empezar y la recogemos al terminar la sesión.";

const entregas: Record<LocalidadId, string> = {
  ondara: entregaCerca,
  pedreguer: entregaCerca,
  denia: entregaVuelta,
  "la-xara": entregaVuelta,
  // [PENDIENTE] Si el equipo se queda o vuelve en El Verger y Els Poblets: texto neutro.
  "el-verger": entregaVuelta,
  "els-poblets": entregaVuelta,
};

/** Datos locales verificados. Vacío hasta que Hammer Padel los facilite. */
const datosLocales: Partial<Record<LocalidadId, DatosLocales>> = {};

export const paginasLocalidad: PaginaLocalidad[] = localidades.map((l) => ({
  id: l.id,
  nombre: l.nombre,
  keyword: keywords[l.id],
  entrega: entregas[l.id],
  local: datosLocales[l.id] ?? null,
}));

/** Una página es indexable solo si tiene contenido local propio suficiente. */
export function esIndexable(p: PaginaLocalidad): boolean {
  const d = p.local;
  return !!d && d.zonas.length > 0 && d.pistas.trim() !== "" && d.preguntas.length > 0;
}

export function paginaLocalidad(id: string): PaginaLocalidad | undefined {
  return paginasLocalidad.find((p) => p.id === id);
}

export const rutaLocalidad = (id: LocalidadId) => `/alquiler/${id}`;

/** Horario confirmado: primera y última hora de inicio de una reserva. */
export const horarioAlquiler = { primeraReserva: "8:00", ultimaReserva: "20:30" } as const;

/** Condiciones confirmadas por Hammer Padel (2026-11-14). */
export const condicionesAlquiler = {
  dias: "De lunes a domingo",
  antelacionHoras: 6,
  confirmacion: "Confirmamos cada reserva personalmente",
  pistas: "Pistas de urbanizaciones y pistas privadas",
  pelotaPerdida: "1 € por cada pelota perdida",
} as const;
