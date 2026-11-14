import type { Pregunta } from "@/components/Faq";
import { alquiler, localidades, maquina, recogebolas } from "./catalogo";
import { servicio } from "./servicio";

const pueblos = localidades.map((l) => l.nombre).join(", ");

/**
 * Preguntas frecuentes. `pendiente: true` = la respuesta no está confirmada:
 * se muestra como pendiente y NO entra en los datos estructurados.
 */
export const faqAlquiler: Pregunta[] = [
  { p: "¿Cuánto cuesta alquilar la máquina?", r: `${alquiler.precioTexto} por sesión de ${alquiler.duracionTexto}.` },
  { p: "¿Dónde está disponible el alquiler?", r: `De momento en ${pueblos} (${alquiler.comarca}).` },
  { p: "¿Tengo que ir a recoger la máquina?", r: `No. ${servicio.entregaTexto} y la recogemos al terminar.` },
  { p: "¿A qué horas puedo reservar?", r: `${servicio.horarioTexto}. Cada sesión dura ${alquiler.duracionTexto}.` },
  { p: "¿Cómo se paga?", r: `${servicio.pagoTexto}. ${servicio.pagoNota}` },
  { p: "¿Necesito tener reservada la pista?", r: "Pendiente de confirmar qué pistas admiten la máquina y cómo se coordina la reserva de pista.", pendiente: true },
  { p: "¿Puedo cancelar o cambiar mi reserva?", r: "La política de cancelaciones y cambios está pendiente de publicar.", pendiente: true },
  { p: "¿Con cuánta antelación tengo que reservar?", r: "Pendiente de confirmar.", pendiente: true },
];

export const faqProducto: Pregunta[] = [
  { p: "¿Cuánto cuesta la máquina Hammer Padel?", r: `${maquina.precioTexto}. Se vende por separado del recogebolas.` },
  { p: "¿Cuánto cuesta el recogebolas?", r: `${recogebolas.precioTexto}. Se vende por separado.` },
  { p: "¿Puedo probar la máquina antes de comprarla?", r: `Sí. Puedes alquilarla por ${alquiler.precioTexto} la sesión de ${alquiler.duracionTexto} en ${pueblos}.` },
  { p: "¿Se puede comprar online?", r: "Todavía no. De momento la compra se solicita desde el formulario de contacto y te respondemos personalmente." },
  { p: "¿Cuánta autonomía tiene la batería? ¿A qué velocidad lanza?", r: "Las especificaciones técnicas se publicarán con la documentación oficial. No damos datos sin verificar.", pendiente: true },
  { p: "¿Hacéis envíos? ¿Cuánto tarda?", r: "Envíos y plazos de entrega pendientes de definir.", pendiente: true },
];
