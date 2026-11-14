/**
 * Fuente única de precios y datos comerciales del prototipo.
 * [CONFIRMADO] por Hammer Padel: precios y localidades de alquiler.
 * [CONFIRMADO] 14/11/2026: precios con IVA incluido; envío de la máquina incluido;
 * recogebolas 6,99 € de envío por 1 unidad, gratis desde 2; devoluciones con envío a cargo del cliente.
 * Nada de especificaciones técnicas: están pendientes de documentación oficial.
 */

export const NOTA_IVA = "IVA incluido.";

/** Envío y devoluciones de la venta (confirmado por Xavi, 14/11/2026). */
export const envio = {
  maquina: "Envío incluido.",
  recogebolas: "Envío 6,99 € por un recogebolas. Gratis a partir de 2.",
  devoluciones: "En las devoluciones, el envío corre a cargo del cliente.",
} as const;

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
  /** [CONFIRMADO] 14/11/2026: el modelo se llama Hammer X MAX. */
  nombre: "Hammer X MAX",
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
  precioCentimos: 2500,
  precioTexto: "25 €",
  duracionMinutos: 90,
  duracionTexto: "90 minutos",
  resumen: "25 € por sesión de 90 minutos",
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
