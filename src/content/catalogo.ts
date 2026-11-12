/**
 * Fuente única de precios y datos comerciales del prototipo.
 * [CONFIRMADO] por Hammer Padel: precios y localidades de alquiler.
 * Nada de especificaciones técnicas: están pendientes de documentación oficial.
 */

export const maquina = {
  nombre: "Hammer Padel",
  descripcion: "Máquina lanzapelotas para entrenar pádel de forma autónoma.",
  precioEuros: 2300,
  precioTexto: "2.300 €",
  ruta: "/comprar",
} as const;

export const recogebolas = {
  nombre: "Recogebolas Hammer",
  descripcion: "Accesorio para recoger pelotas de forma cómoda y rápida.",
  precioEuros: 85,
  precioTexto: "85 €",
  ruta: "/recogebolas",
} as const;

export const alquiler = {
  precioEuros: 20,
  precioTexto: "20 €",
  duracionMinutos: 90,
  duracionTexto: "90 minutos",
  resumen: "20 € por sesión de 90 minutos",
  ruta: "/alquiler",
  /** Orden de oeste a este. Ubicaciones exactas pendientes de definir. */
  localidades: ["Pedreguer", "Ondara", "La Xara", "Dénia"],
  comarca: "Marina Alta, Alicante",
} as const;

export const lemas = {
  principal: "Tu entrenamiento. Tu ritmo. Tu pista.",
  entrenar: "No esperes a tu compañero. Entrena.",
  repetir: "Repite. Mejora. Domina.",
  recoger: "Menos tiempo recogiendo. Más tiempo entrenando.",
} as const;

export const navegacion = [
  { href: "/comprar", texto: "Máquina" },
  { href: "/recogebolas", texto: "Recogebolas" },
  { href: "/alquiler", texto: "Alquiler" },
  { href: "/como-funciona", texto: "Cómo funciona" },
  { href: "/entrenamientos", texto: "Entrenamientos" },
  { href: "/clubes", texto: "Clubes" },
  { href: "/soporte", texto: "Soporte" },
  { href: "/contacto", texto: "Contacto" },
] as const;
