import type { Metadata } from "next";
import Link from "next/link";
import { Dato, LegalPage } from "@/components/Legal";
import { titular } from "@/content/legal";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Datos del titular de la web de Hammer Padel y condiciones de uso.",
  alternates: { canonical: "/legal/aviso-legal" },
};

export default function AvisoLegal() {
  return (
    <LegalPage titulo="Aviso legal" ruta="/legal/aviso-legal">
      <h2>1. Titular de la web</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de
        Comercio Electrónico (LSSI), se informa de los datos del titular de esta web:
      </p>
      <ul>
        <li>Titular: <Dato valor={titular.razonSocial} falta="nombre o razón social" /></li>
        <li>Nombre comercial: {titular.nombreComercial}</li>
        <li>NIF: <Dato valor={titular.nif} falta="NIF" /></li>
        <li>Domicilio: <Dato valor={titular.domicilio} falta="dirección completa" /></li>
        <li>Email: <Dato valor={titular.email} falta="email de contacto" /></li>
        <li>Teléfono: <Dato valor={titular.telefono} falta="teléfono (opcional)" /></li>
        <li>
          Datos registrales: <Dato valor={titular.registroMercantil} falta="Registro Mercantil (solo si es una sociedad)" />
        </li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        Esta web presenta los productos y servicios de Hammer Padel: el alquiler de máquinas lanzapelotas de pádel
        por sesiones y la venta de la máquina Hammer Padel y del recogebolas Hammer. Las condiciones de cada
        servicio están en las <Link href="/legal/condiciones-alquiler">condiciones de alquiler</Link> y en las{" "}
        <Link href="/legal/condiciones-venta">condiciones de venta</Link>.
      </p>

      <h2>3. Uso de la web</h2>
      <p>
        Quien navega por la web se compromete a usarla de forma lícita, sin dañar su funcionamiento ni el de los
        sistemas que la sostienen, y a no introducir datos falsos o de terceros sin su autorización en los
        formularios.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        La marca y el logotipo Hammer Padel, los textos, fotografías, vídeos, diseños y el código de esta web
        pertenecen a su titular o se usan con permiso de sus autores. No se pueden reproducir, distribuir ni
        transformar sin autorización expresa, salvo para uso personal y privado.
      </p>

      <h2>5. Responsabilidad</h2>
      <p>
        Hammer Padel procura que la información publicada sea correcta y esté actualizada, pero puede contener
        errores puntuales que se corregirán en cuanto se detecten. Hammer Padel no responde de interrupciones
        del servicio ajenas a su control ni del uso indebido de la web por parte de terceros.
      </p>

      <h2>6. Enlaces</h2>
      <p>
        Si la web enlaza a sitios de terceros, Hammer Padel no controla ni responde de su contenido. Retiraremos
        cualquier enlace en cuanto tengamos conocimiento de que lleva a contenidos ilícitos.
      </p>

      <h2>7. Protección de datos y cookies</h2>
      <p>
        El tratamiento de datos personales se explica en la <Link href="/legal/privacidad">política de privacidad</Link> y
        el uso del almacenamiento del navegador en la <Link href="/legal/cookies">política de cookies</Link>.
      </p>

      <h2>8. Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. Cuando el usuario sea un consumidor, cualquier
        controversia se someterá a los juzgados y tribunales que correspondan según la normativa de consumo,
        normalmente los de su domicilio.
      </p>
    </LegalPage>
  );
}
