import type { Metadata } from "next";
import Link from "next/link";
import { CtaAlquiler } from "@/components/CtaAlquiler";
import { Faq } from "@/components/Faq";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/PageHead";
import { faqAlquiler, faqProducto } from "@/content/faq";

export const metadata: Metadata = {
  title: "Soporte: preguntas frecuentes, garantía y manuales",
  description:
    "Preguntas frecuentes sobre el alquiler y la compra de la máquina lanzapelotas Hammer Padel, garantía, manuales y asistencia.",
  alternates: { canonical: "/soporte" },
};

const manuales = [
  { t: "Manual de uso de la máquina", d: "Puesta en marcha, carga de pelotas y ajustes." },
  { t: "Guía rápida", d: "Una hoja para llevar a la pista." },
  { t: "Mantenimiento y limpieza", d: "Cuidados para alargar la vida de la máquina." },
  { t: "Recogebolas Hammer", d: "Montaje y uso." },
];

export default function Soporte() {
  return (
    <div className="page">
      <BreadcrumbJsonLd nombre="Soporte" ruta="/soporte" />
      <PageHead kicker="Soporte" titulo="Te ayudamos">
        <p className="lede">Preguntas frecuentes, garantía y manuales. Si no encuentras la respuesta, escríbenos.</p>
        <nav aria-label="En esta página" className="toc">
          <a href="#faq-alquiler">Alquiler</a>
          <a href="#faq-compra">Compra</a>
          <a href="#garantia">Garantía</a>
          <a href="#manuales">Manuales</a>
          <Link href="/contacto?asunto=soporte">Contacto técnico</Link>
        </nav>
      </PageHead>

      <div className="page__body sections">
        <section aria-labelledby="t-faq-alquiler">
          <h2 id="t-faq-alquiler" className="section-title">Preguntas sobre el alquiler</h2>
          <Faq id="faq-alquiler" preguntas={faqAlquiler} />
        </section>

        <section aria-labelledby="t-faq-compra">
          <h2 id="t-faq-compra" className="section-title">Preguntas sobre la compra</h2>
          <Faq id="faq-compra" preguntas={faqProducto} />
        </section>

        <section aria-labelledby="t-garantia" id="garantia" className="prose">
          <h2 id="t-garantia">Garantía</h2>
          <p>
            Si compras como consumidor, tienes la garantía legal de conformidad que establece la ley española
            para productos nuevos: 3 años desde la entrega.
          </p>
          <p className="pending">
            Garantía comercial adicional, cómo tramitarla, compras de empresas y clubes, y cobertura de
            piezas y batería: pendientes de definir.
          </p>
        </section>

        <section aria-labelledby="t-manuales" id="manuales">
          <h2 id="t-manuales" className="section-title">Manuales</h2>
          <ul className="cards">
            {manuales.map((m) => (
              <li className="card" key={m.t}>
                <h3>{m.t}</h3>
                <p>{m.d}</p>
                <p className="pending">Pendiente de publicación (PDF).</p>
              </li>
            ))}
            <li className="card card--accent">
              <h3>¿Algo no funciona?</h3>
              <p>Cuéntanos qué pasa y, si puedes, adjunta una foto o un vídeo en tu respuesta a nuestro email.</p>
              <Link className="btn btn--accent" href="/contacto?asunto=soporte">Contactar con soporte</Link>
            </li>
          </ul>
          <p className="notice" style={{ marginTop: "var(--sc-6)" }}>
            <strong>Repuestos.</strong> La venta de repuestos y accesorios llegará en una fase posterior.
          </p>
        </section>
      </div>

      <CtaAlquiler titulo="¿Aún no la has probado?" />
    </div>
  );
}
