/**
 * Cómo funciona el servicio de alquiler.
 * [CONFIRMADO] por Xavi (14/11/2026): Hammer Padel lleva la máquina a la pista
 * del cliente; última hora de inicio 20:30, primera 8:00; pago en efectivo en la
 * sesión mientras no haya pago online.
 * [PENDIENTE] días de servicio, antelación mínima, cancelaciones, quién reserva la pista.
 */
export const servicio = {
  primeraHora: "8:00",
  ultimaHora: "20:30",
  horarioTexto: "Sesiones que empiezan entre las 8:00 y las 20:30",
  entregaTexto: "Llevamos la máquina a tu pista",
  pagoTexto: "Pagas en efectivo al empezar la sesión",
  pagoNota: "El pago online al reservar llegará más adelante.",
} as const;
