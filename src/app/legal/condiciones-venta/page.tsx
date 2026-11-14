import type { Metadata } from "next";
import Link from "next/link";
import { Dato, LegalPage, Pendiente } from "@/components/Legal";
import { maquina, NOTA_IVA, recogebolas } from "@/content/catalogo";
import { titular } from "@/content/legal";

export const metadata: Metadata = {
  title: "Condiciones de venta",
  description: "Condiciones de compra de la máquina lanzapelotas Hammer Padel y del recogebolas Hammer.",
  alternates: { canonical: "/legal/condiciones-venta" },
};

export default function CondicionesVenta() {
  return (
    <LegalPage titulo="Condiciones de venta" ruta="/legal/condiciones-venta">
      <p>
        Estas condiciones regulan la compra de productos Hammer Padel a{" "}
        <Dato valor={titular.razonSocial} falta="nombre o razón social" />, con NIF{" "}
        <Dato valor={titular.nif} falta="NIF" /> y domicilio en <Dato valor={titular.domicilio} falta="dirección completa" />.
      </p>

      <h2>1. Productos y precios</h2>
      <dl className="spec">
        <div><dt>{maquina.nombre}</dt><dd>{maquina.precioTexto}</dd></div>
        <div><dt>{recogebolas.nombre}</dt><dd>{recogebolas.precioTexto}</dd></div>
      </dl>
      <p>Ambos productos se venden por separado. El precio aplicable es el que figura en la web al hacer el pedido.</p>
      <Pendiente>{NOTA_IVA} Gastos de envío, si los hay.</Pendiente>

      <h2>2. Cómo comprar</h2>
      <p>
        De momento la compra no se hace online: solicitas el producto desde la{" "}
        <Link href="/contacto?asunto=compra-maquina">página de contacto</Link> y Hammer Padel te confirma por escrito el
        pedido, el precio final, la forma de pago y la entrega antes de que pagues nada.
      </p>
      <Pendiente>Formas de pago aceptadas y si habrá financiación.</Pendiente>

      <h2>3. Entrega</h2>
      <Pendiente>Zonas de envío, plazos, transportista o entrega en mano, y qué hacer si el producto llega dañado.</Pendiente>

      <h2>4. Derecho de desistimiento</h2>
      <p>
        Si eres consumidor y compras a distancia (por la web, email o teléfono), tienes 14 días naturales desde que
        recibes el producto para desistir de la compra sin dar explicaciones, como establece el Texto Refundido de
        la Ley General para la Defensa de los Consumidores y Usuarios. Para ejercerlo, comunícalo a{" "}
        <Dato valor={titular.email} falta="email de contacto" />. Te devolveremos lo pagado, incluido el envío
        ordinario, en un máximo de 14 días desde que nos lo comuniques; podemos esperar a recibir el producto de vuelta.
      </p>
      <Pendiente>
        Quién paga los costes de devolución, dirección a la que devolver el producto y modelo de formulario de
        desistimiento.
      </Pendiente>

      <h2>5. Garantía</h2>
      <p>
        Si eres consumidor, los productos nuevos tienen la garantía legal de conformidad de tres años desde la
        entrega. Si aparece una falta de conformidad, puedes pedir la reparación o la sustitución del producto y,
        en su caso, la rebaja del precio o la resolución del contrato.
      </p>
      <Pendiente>
        Garantía comercial adicional (si la hay), cómo gestionar una reparación y servicio de repuestos. Las compras
        de empresas, clubes y academias tendrán condiciones propias.
      </Pendiente>

      <h2>6. Reclamaciones</h2>
      <p>
        Puedes escribirnos a <Dato valor={titular.email} falta="email de contacto" /> o desde la{" "}
        <Link href="/contacto?asunto=soporte">página de contacto</Link>.
      </p>
      <Pendiente>
        Disponibilidad de hojas de reclamaciones (obligatorias en la Comunitat Valenciana) y adhesión o no a
        arbitraje de consumo.
      </Pendiente>

      <h2>7. Datos personales y legislación</h2>
      <p>
        Tus datos se tratan según la <Link href="/legal/privacidad">política de privacidad</Link>. Estas condiciones
        se rigen por la legislación española y no limitan los derechos que la ley reconoce a los consumidores.
      </p>
    </LegalPage>
  );
}
