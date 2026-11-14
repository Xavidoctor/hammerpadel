/**
 * Cómo funciona el servicio de alquiler.
 * [CONFIRMADO] por Xavi (14/11/2026): Hammer Padel lleva la máquina a la pista
 * del cliente; última hora de inicio 20:30, primera 8:00; pago en efectivo en la
 * sesión mientras no haya pago online.
 * [CONFIRMADO] (14/11/2026): de lunes a domingo, antelación mínima 6 h, confirmación
 * manual (Xavi o Marc), reserva solo desde la web, también urbanizaciones y pistas
 * privadas, 1 € por pelota perdida. Precio 25 € (antes 20 €) con 60 pelotas incluidas.
 * [PENDIENTE] política de cancelaciones y cambios.
 */
export const servicio = {
  primeraHora: "8:00",
  ultimaHora: "20:30",
  horarioTexto: "Sesiones que empiezan entre las 8:00 y las 20:30",
  entregaTexto: "Llevamos la máquina a tu pista",
  pagoTexto: "Pagas en efectivo al empezar la sesión",
  pagoNota: "El pago online al reservar llegará más adelante.",
  diasTexto: "De lunes a domingo",
  antelacionTexto: "Con al menos 6 horas de antelación",
  confirmacionTexto: "Te confirmamos la reserva personalmente",
  canalTexto: "Las reservas se hacen solo desde esta web",
  pistasTexto: "Pistas de club, de urbanización o privadas",
  pelotaPerdidaTexto: "1 € por cada pelota perdida",
  pelotasTexto: "Incluye 60 pelotas",
  recogebolasTexto: "Incluye un recogebolas para recoger más rápido y aprovechar el entrenamiento. El segundo, 2,50 € más por sesión",
} as const;
