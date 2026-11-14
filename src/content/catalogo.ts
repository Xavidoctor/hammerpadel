/**
 * Fuente única de precios y datos comerciales del prototipo.
 * [CONFIRMADO] por Hammer Padel: precios y localidades de alquiler.
 * [PENDIENTE] tratamiento del IVA: no se indica "IVA incluido" hasta confirmarlo.
 * Nada de especificaciones técnicas: están pendientes de documentación oficial.
 */

export const IVA_PENDIENTE = true;
export const NOTA_IVA = "Tratamiento del IVA pendiente de confirmar.";

export type Producto = {
  id: "maquina" | "recogebolas";
  nombre: string;
  descripcion: string;
  precioCentimos: number;
  precioTexto: string;
  ruta: string;
};

export const maquina: Producto = {
  id: "maquina",
  nombre: "Hammer Padel",
  descripcion: "Máquina lanzapelotas para entrenar pádel de forma autónoma.",
  precioCentimos: 249900,
  precioTexto: "2.499 €",
  ruta: "/comprar",
};

export const recogebolas: Producto = {
  id: "recogebolas",
  nombre: "Recogebolas Hammer",
  descripcion: "Accesorio para recoger pelotas de forma cómoda y rápida.",
  precioCentimos: 6500,
  precioTexto: "65 €",
  ruta: "/recogebolas",
};

export const productos = [maquina, recogebolas] as const;

export const alquiler = {
  precioCentimos: 2000,
  precioTexto: "20 €",
  duracionMinutos: 90,
  duracionTexto: "90 minutos",
  resumen: "20 € por sesión de 90 minutos",
  ruta: "/alquiler",
  comarca: "Marina Alta, Alicante",
} as const;

/** Orden de oeste a este. Ubicaciones exactas pendientes de definir. */
export const localidades = [
  { id: "pedreguer", nombre: "Pedreguer" },
  { id: "ondara", nombre: "Ondara" },
  { id: "la-xara", nombre: "La Xara" },
  { id: "denia", nombre: "Dénia" },
] as const;

export type LocalidadId = (typeof localidades)[number]["id"];

export const lemas = {
  principal: "Tu entrenamiento. Tu ritmo. Tu pista.",
  entrenar: "No esperes a tu compañero. Entrena.",
  repetir: "Repite. Mejora. Domina.",
  recoger: "Menos tiempo recogiendo. Más tiempo entrenando.",
} as const;

export const navegacion = [
  { href: "/alquiler", texto: "Alquiler" },
  { href: "/comprar", texto: "Comprar máquina" },
  { href: "/recogebolas", texto: "Recogebolas" },
  { href: "/como-funciona", texto: "Cómo funciona" },
  { href: "/entrenamientos", texto: "Entrenamientos" },
  { href: "/clubes", texto: "Clubes" },
  { href: "/soporte", texto: "Soporte" },
  { href: "/contacto", texto: "Contacto" },
] as const;
