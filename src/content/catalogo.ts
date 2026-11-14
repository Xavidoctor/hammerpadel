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
  pelotasTexto: "60 pelotas incluidas",
  resumen: "25 € por sesión de 90 minutos",
  pelotas: 60,
  pelotasIncluidas: 60,
  incluyeTexto: "60 pelotas y 1 recogebolas incluidos",
  /** [CONFIRMADO] Xavi 14-11-2026: cada sesión incluye 1 recogebolas; un segundo cuesta 2,50 € más por sesión. */
  recogebolasIncluidos: 1,
  recogebolasTexto: "1 recogebolas incluido",
  recogebolasExtraCentimos: 250,
  recogebolasExtraTexto: "2,50 €",
  recogebolasExtraFrase: "Si queréis un segundo recogebolas, son 2,50 € más por sesión",
  ruta: "/alquiler",
  comarca: "Marina Alta, Alicante",
} as const;

/** Orden de oeste a este. Ubicaciones exactas pendientes de definir. */
export const localidades = [
  { id: "pedreguer", nombre: "Pedreguer" },
  { id: "el-verger", nombre: "El Verger" },
  { id: "ondara", nombre: "Ondara" },
  { id: "els-poblets", nombre: "Els Poblets" },
  { id: "la-xara", nombre: "La Xara" },
  { id: "denia", nombre: "Dénia" },
] as const;

export type LocalidadId = (typeof localidades)[number]["id"];

/** "Pedreguer, El Verger, … y Dénia" */
export const listaLocalidades = localidades
  .map((l) => l.nombre)
  .join(", ")
  .replace(/, ([^,]*)$/, " y $1");
/** Alias usado por la portada del prototipo. */
export const localidadesTexto = listaLocalidades;

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
