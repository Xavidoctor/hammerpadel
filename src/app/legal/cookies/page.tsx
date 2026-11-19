import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué guarda la web de Hammer Padel en tu navegador. Hoy no usamos cookies de analítica ni de publicidad.",
  alternates: { canonical: "/legal/cookies" },
};

export default function Cookies() {
  return (
    <LegalPage titulo="Política de cookies" ruta="/legal/cookies">
      <p>
        Esta política cumple el artículo 22.2 de la Ley 34/2002 (LSSI) y sigue la Guía sobre el uso de las cookies de
        la Agencia Española de Protección de Datos.
      </p>

      <h2>1. Qué son las cookies</h2>
      <p>
        Son pequeños archivos que una web guarda en tu navegador. Otras técnicas parecidas, como el almacenamiento
        local del navegador, se rigen por las mismas normas.
      </p>

      <h2>2. Qué usa esta web</h2>
      <p>
        <strong>Hoy no usamos cookies de analítica, de publicidad ni de terceros.</strong> Las tipografías, imágenes y
        vídeos se sirven desde nuestro propio dominio, sin llamar a servicios externos.
      </p>
      <p>Solo se guarda un dato en tu navegador, y únicamente si tú lo pides:</p>
      <dl className="spec">
        <div><dt>Nombre</dt><dd>hp-sin-animacion</dd></div>
        <div><dt>Tipo</dt><dd>Almacenamiento local del navegador (propio)</dd></div>
        <div><dt>Finalidad</dt><dd>Recordar que has pedido ver la web sin animaciones.</dd></div>
        <div><dt>Cuándo se guarda</dt><dd>Al pulsar el botón para desactivar las animaciones.</dd></div>
        <div><dt>Duración</dt><dd>Hasta que vuelvas a activar las animaciones o borres los datos del navegador.</dd></div>
      </dl>
      <p>
        Es un dato técnico necesario para darte un servicio que pides expresamente, por eso está exento de
        consentimiento y la web no muestra un aviso de cookies.
      </p>

      <h2>3. Cómo borrarlo</h2>
      <p>
        Puedes eliminarlo volviendo a activar las animaciones o borrando los datos de navegación desde la
        configuración de tu navegador (Chrome, Safari, Firefox o Edge).
      </p>

      <h2>4. Cambios futuros</h2>
      <p>
        Si en el futuro incorporamos analítica, una pasarela de pago u otros servicios que usen cookies no
        necesarias, actualizaremos esta política y te pediremos el consentimiento antes de activarlas, con la
        opción de rechazarlas tan fácil como aceptarlas.
      </p>
      <p>
        Más información sobre tus datos en la <Link href="/legal/privacidad">política de privacidad</Link>.
      </p>
    </LegalPage>
  );
}
