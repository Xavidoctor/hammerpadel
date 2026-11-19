import type { Pregunta } from "@/components/Faq";
import { alquiler, envio, localidades, maquina, recogebolas } from "./catalogo";
import { app } from "./app";
import { servicio } from "./servicio";

const pueblos = localidades.map((l) => l.nombre).join(", ");

/**
 * Preguntas frecuentes. `pendiente: true` = la respuesta no está confirmada:
 * se muestra como pendiente y NO entra en los datos estructurados.
 */
export const faqAlquiler: Pregunta[] = [
  { p: "¿Cuánto cuesta alquilar la máquina?", r: `${alquiler.precioTexto} por sesión de ${alquiler.duracionTexto}, IVA incluido. La sesión incluye 60 pelotas y un recogebolas.` },
  { p: "¿Dónde está disponible el alquiler?", r: `De momento en ${pueblos} (${alquiler.comarca}).` },
  { p: "¿Tengo que ir a recoger la máquina?", r: `No. ${servicio.entregaTexto} y la recogemos al terminar.` },
  { p: "¿Qué días y a qué horas puedo reservar?", r: `${servicio.diasTexto}. ${servicio.horarioTexto}. Cada sesión dura ${alquiler.duracionTexto}.` },
  { p: "¿Cómo reservo?", r: `${servicio.canalTexto}. ${servicio.confirmacionTexto} (Xavi o Marc).` },
  { p: "¿Cómo se paga?", r: `${servicio.pagoTexto}. ${servicio.pagoNota}` },
  { p: "¿En qué pistas se puede usar?", r: `La pista la pones tú. ${servicio.pistasTexto}: también vamos a urbanizaciones y pistas particulares.` },
  { p: "¿Necesito la app para la sesión de alquiler?", r: `Sí. La máquina se controla con la app ${app.nombre}, gratis para iPhone y Android. Descárgala antes y prepara el entrenamiento en casa.` },
  { p: "¿Tengo que llevar pelotas?", r: `No. ${servicio.pelotasTexto} en cada sesión.` },
  { p: "¿Incluye recogebolas?", r: `Sí. ${servicio.recogebolasTexto}.` },
  { p: "¿Qué pasa si se pierde alguna pelota?", r: `Se cobra ${servicio.pelotaPerdidaTexto}.` },
  { p: "¿Puedo cancelar o cambiar mi reserva?", r: "La política de cancelaciones y cambios está pendiente de publicar.", pendiente: true },
  { p: "¿Con cuánta antelación tengo que reservar?", r: `${servicio.antelacionTexto}.` },
];

export const faqProducto: Pregunta[] = [
  { p: `¿Cuánto cuesta la máquina ${maquina.nombre}?`, r: `${maquina.precioTexto}, IVA incluido. ${envio.maquina} Se vende por separado del recogebolas.` },
  { p: "¿Cuánto cuesta el recogebolas?", r: `${recogebolas.precioTexto}, IVA incluido. Se vende por separado.` },
  { p: "¿Cuánto cuesta el envío?", r: `La máquina tiene el envío incluido. ${envio.recogebolas}` },
  { p: "¿Puedo devolver un producto?", r: `Sí. ${envio.devoluciones} El plazo y el procedimiento se publicarán con las condiciones de venta.` },
  { p: "¿Los precios llevan IVA?", r: "Sí, todos los precios de la web tienen el IVA incluido." },
  { p: "¿Puedo probar la máquina antes de comprarla?", r: `Sí. Puedes alquilarla por ${alquiler.precioTexto} la sesión de ${alquiler.duracionTexto} en ${pueblos}.` },
  { p: "¿Se puede comprar online?", r: "Todavía no. De momento la compra se solicita desde el formulario de contacto y te respondemos personalmente." },
  { p: "¿La máquina tiene app?", r: `Sí, ${app.nombre}. Tiene entrenamientos preparados para jugar solo o en grupos de hasta 4 personas, puedes personalizarlos y prepararlos antes de ir a la pista.` },
  { p: "¿Pueden entrenar varias personas a la vez?", r: "Sí. La app incluye entrenamientos preparados para grupos de hasta 4 personas." },
  { p: "¿En qué móviles funciona la app y cuánto cuesta?", r: `${app.plataformasTexto}. ${app.conexionTexto}.` },
  { p: "¿Cuánta autonomía tiene la batería? ¿A qué velocidad lanza?", r: "Las especificaciones técnicas se publicarán con la documentación oficial. No damos datos sin verificar.", pendiente: true },
  { p: "¿Cuánto tarda el envío?", r: "Plazos de entrega pendientes de definir.", pendiente: true },
];
