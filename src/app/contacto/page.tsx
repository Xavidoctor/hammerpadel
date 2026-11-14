import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { alquiler, localidades } from "@/content/catalogo";
import { ASUNTOS, contacto, enlaceWhatsapp } from "@/content/contacto";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Contacta con Hammer Padel: alquiler de máquina lanzapelotas en ${localidades.map((l) => l.nombre).join(", ")}, compra, clubes y soporte.`,
  alternates: { canonical: "/contacto" },
};

export default async function Contacto({ searchParams }: { searchParams: Promise<{ asunto?: string | string[] }> }) {
  // El asunto llega en la URL desde los botones de la web (?asunto=soporte, etc.).
  // Se lee en el servidor para que el formulario funcione también sin JavaScript.
  const { asunto } = await searchParams;
  const asuntoInicial = ASUNTOS.find((a) => a.id === asunto)?.id ?? "alquiler";
  const wa = enlaceWhatsapp("Hola, escribo desde la web de Hammer Padel.");
  return (
    <div className="page">
      <BreadcrumbJsonLd nombre="Contacto" ruta="/contacto" />
      <PageHead kicker="Contacto" titulo="Hablemos">
        <p className="lede">Alquiler, compra, clubes o soporte. Te respondemos personalmente.</p>
      </PageHead>

      <div className="page__body contact">
        <div className="contact__form">
          <ContactForm asuntoInicial={asuntoInicial} />
        </div>

        <aside className="contact__side" aria-labelledby="t-canales">
          <h2 id="t-canales" className="section-title section-title--sm">Otros canales</h2>
          <dl className="spec spec--compact">
            <div>
              <dt>Email</dt>
              <dd>{contacto.email ? <a href={`mailto:${contacto.email}`}>{contacto.email}</a> : <span className="pending">Pendiente</span>}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{wa ? <a href={wa}>Escribir por WhatsApp</a> : <span className="pending">Pendiente</span>}</dd>
            </div>
            <div>
              <dt>Zona de alquiler</dt>
              <dd>{localidades.map((l) => l.nombre).join(", ")} ({alquiler.comarca})</dd>
            </div>
          </dl>
          <p className="hint">¿Quieres reservar? Es más rápido desde <Link href={alquiler.ruta}>la página de alquiler</Link>.</p>
          <p className="hint">¿Una duda frecuente? Mira el <Link href="/soporte">soporte</Link>.</p>
        </aside>
      </div>
    </div>
  );
}
