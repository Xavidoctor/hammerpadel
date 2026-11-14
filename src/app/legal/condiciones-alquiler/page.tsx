import type { Metadata } from "next";
import Link from "next/link";
import { Dato, LegalPage, Pendiente } from "@/components/Legal";
import { alquiler, localidades, NOTA_IVA } from "@/content/catalogo";
import { titular } from "@/content/legal";

export const metadata: Metadata = {
  title: "Condiciones de alquiler",
  description: `Condiciones del alquiler de la máquina lanzapelotas Hammer Padel: ${alquiler.resumen}.`,
  alternates: { canonical: "/legal/condiciones-alquiler" },
};

const nombres = localidades.map((l) => l.nombre);
const zona = `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;

export default function CondicionesAlquiler() {
  return (
    <LegalPage titulo="Condiciones de alquiler" ruta="/legal/condiciones-alquiler">
      <p>
        Estas condiciones regulan el alquiler por sesiones de la máquina lanzapelotas Hammer Padel entre{" "}
        <Dato valor={titular.razonSocial} falta="nombre o razón social" /> ({titular.nombreComercial}) y la persona
        que hace la reserva. Al solicitar una reserva confirmas que las has leído y aceptas.
      </p>

      <h2>1. El servicio</h2>
      <ul>
        <li>Alquiler de una máquina lanzapelotas Hammer Padel durante una sesión de {alquiler.duracionTexto}.</li>
        <li>Hammer Padel lleva la máquina a la pista que indiques y la recoge al terminar.</li>
        <li>Zona de servicio: {zona} ({alquiler.comarca}).</li>
        <li>Horario de inicio de las sesiones: de 8:00 a 20:30 (la última sesión empieza a las 20:30).</li>
      </ul>
      <Pendiente>
        Días de servicio, antelación mínima para reservar y margen entre sesiones por el traslado de la máquina.
      </Pendiente>

      <h2>2. La pista</h2>
      <p>
        Hammer Padel no dispone de instalaciones propias. La reserva y el pago de la pista corren a cargo del
        cliente, que debe tener permiso del club o del titular de la pista para usar la máquina.
      </p>
      <Pendiente>Si las pelotas están incluidas en el alquiler o las aporta el cliente.</Pendiente>

      <h2>3. Precio y pago</h2>
      <ul>
        <li>Precio: {alquiler.resumen}.</li>
        <li>De momento, el pago se hace en efectivo al comienzo de la sesión. Más adelante se podrá pagar online al reservar.</li>
      </ul>
      <Pendiente>{NOTA_IVA} Si se entrega factura o justificante y en qué momento.</Pendiente>

      <h2>4. Reserva y confirmación</h2>
      <p>
        Por ahora la web envía una <em>solicitud</em> de reserva. La reserva solo está confirmada cuando Hammer Padel te
        lo comunica por email o teléfono con la fecha, la hora y la pista.
      </p>

      <h2>5. Cancelaciones, cambios y retrasos</h2>
      <Pendiente>
        Plazo para cancelar sin coste, qué pasa si cancelas tarde o no te presentas, cómo cambiar la fecha, qué
        ocurre si la sesión empieza tarde por causa del cliente y qué pasa si Hammer Padel tiene que cancelar
        (avería, mal tiempo en pistas exteriores u otra causa).
      </Pendiente>

      <h2>6. Uso de la máquina</h2>
      <ul>
        <li>Usa la máquina siguiendo las indicaciones que te dé Hammer Padel al entregarla.</li>
        <li>No la desmontes, no la mojes ni la uses fuera de la pista indicada.</li>
        <li>Avisa en cuanto notes cualquier fallo.</li>
      </ul>
      <Pendiente>
        Responsabilidad por daños causados por mal uso, si se pide fianza, edad mínima y supervisión de menores, y
        si se exige un seguro.
      </Pendiente>

      <h2>7. Derecho de desistimiento</h2>
      <Pendiente>
        Confirmar con un profesional si se aplica la excepción del artículo 103.l) del Texto Refundido de la Ley
        General para la Defensa de los Consumidores y Usuarios (servicios de esparcimiento con fecha concreta) o si
        debe ofrecerse el desistimiento de 14 días en las reservas hechas a distancia.
      </Pendiente>

      <h2>8. Reclamaciones</h2>
      <p>
        Puedes escribirnos a <Dato valor={titular.email} falta="email de contacto" /> o desde la{" "}
        <Link href="/contacto?asunto=alquiler">página de contacto</Link>. Responderemos lo antes posible.
      </p>
      <Pendiente>
        Disponibilidad de hojas de reclamaciones (obligatorias en la Comunitat Valenciana) y adhesión o no a
        arbitraje de consumo.
      </Pendiente>

      <h2>9. Datos personales y legislación</h2>
      <p>
        Tus datos se tratan según la <Link href="/legal/privacidad">política de privacidad</Link>. Estas condiciones
        se rigen por la legislación española y no limitan los derechos que la ley reconoce a los consumidores.
      </p>
    </LegalPage>
  );
}
