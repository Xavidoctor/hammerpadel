import type { Metadata } from "next";
import Link from "next/link";
import { Dato, LegalPage, Pendiente } from "@/components/Legal";
import { titular } from "@/content/legal";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo trata Hammer Padel los datos personales de quienes reservan, compran o escriben.",
  alternates: { canonical: "/legal/privacidad" },
};

export default function Privacidad() {
  return (
    <LegalPage titulo="Política de privacidad" ruta="/legal/privacidad">
      <p>
        Esta política explica cómo tratamos tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la
        Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>Responsable: <Dato valor={titular.razonSocial} falta="nombre o razón social" /> ({titular.nombreComercial})</li>
        <li>NIF: <Dato valor={titular.nif} falta="NIF" /></li>
        <li>Domicilio: <Dato valor={titular.domicilio} falta="dirección completa" /></li>
        <li>Email para temas de privacidad: <Dato valor={titular.email} falta="email de contacto" /></li>
      </ul>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li>Datos de contacto que nos das en los formularios: nombre, email, teléfono (opcional) y tu mensaje.</li>
        <li>Datos de la reserva: localidad, fecha y franja horaria que solicitas.</li>
        <li>Cuando compres o pagues: los datos necesarios para la factura y, si hay envío, la dirección de entrega.</li>
      </ul>
      <p>No pedimos datos especialmente protegidos (como datos de salud) ni los necesitamos.</p>

      <h2>3. Para qué los usamos y con qué base legal</h2>
      <dl className="spec">
        <div>
          <dt>Responder a tus consultas</dt>
          <dd>Base legal: tu solicitud y las medidas precontractuales que pides (art. 6.1.b RGPD).</dd>
        </div>
        <div>
          <dt>Gestionar reservas de alquiler</dt>
          <dd>Base legal: ejecución del contrato de alquiler (art. 6.1.b RGPD).</dd>
        </div>
        <div>
          <dt>Gestionar compras, envíos y garantía</dt>
          <dd>Base legal: ejecución del contrato de compraventa (art. 6.1.b RGPD).</dd>
        </div>
        <div>
          <dt>Facturación y obligaciones contables y fiscales</dt>
          <dd>Base legal: cumplimiento de obligaciones legales (art. 6.1.c RGPD).</dd>
        </div>
        <div>
          <dt>Enviarte novedades y promociones</dt>
          <dd>Solo si nos das tu consentimiento expreso (art. 6.1.a RGPD y art. 21 LSSI). Puedes retirarlo cuando quieras.</dd>
        </div>
      </dl>
      <p>No tomamos decisiones automatizadas ni elaboramos perfiles con tus datos.</p>

      <h2>4. Cuánto tiempo los conservamos</h2>
      <ul>
        <li>Consultas que no terminan en reserva ni compra: el tiempo necesario para responderte y, como máximo, un año.</li>
        <li>Reservas y compras: mientras dure la relación y, después, durante los plazos legales de reclamación.</li>
        <li>Facturas y documentación contable: seis años (Código de Comercio) y lo que exija la normativa tributaria.</li>
      </ul>
      <Pendiente>Confirmar con el asesor los plazos exactos de conservación que aplicará Hammer Padel.</Pendiente>

      <h2>5. A quién se comunican</h2>
      <p>
        No vendemos ni cedemos tus datos. Solo se comunican a las administraciones públicas cuando lo exige la ley
        (por ejemplo, la Agencia Tributaria) y a los proveedores que nos prestan servicios y actúan como
        encargados del tratamiento, con contrato y garantías conforme al RGPD.
      </p>
      <Pendiente>
        Lista de proveedores (alojamiento de la web, email, pasarela de pago, gestoría, transporte) y si alguno
        trata datos fuera del Espacio Económico Europeo. Se completará cuando estén elegidos.
      </Pendiente>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes pedir el acceso, la rectificación o la supresión de tus datos, la limitación de su tratamiento,
        oponerte a él y solicitar su portabilidad. Si nos diste tu consentimiento, puedes retirarlo en cualquier
        momento sin que afecte a lo ya tratado. Escríbenos a <Dato valor={titular.email} falta="email de contacto" />{" "}
        indicando qué derecho quieres ejercer. Te responderemos en el plazo de un mes.
      </p>
      <p>
        Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de
        Datos (<a href="https://www.aepd.es" rel="noopener">www.aepd.es</a>).
      </p>

      <h2>7. Menores de edad</h2>
      <p>
        Los menores de 14 años no pueden facilitarnos datos sin el consentimiento de sus padres o tutores
        (art. 7 LOPDGDD). Las reservas y compras deben hacerlas personas mayores de edad.
      </p>

      <h2>8. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a pérdidas, accesos no
        autorizados o alteraciones. Los datos de pago, cuando haya pago online, los gestionará directamente la
        pasarela de pago; Hammer Padel no verá ni guardará los datos de tu tarjeta.
      </p>

      <h2>9. Cookies</h2>
      <p>
        Lo que la web guarda en tu navegador se explica en la <Link href="/legal/cookies">política de cookies</Link>.
      </p>
    </LegalPage>
  );
}
