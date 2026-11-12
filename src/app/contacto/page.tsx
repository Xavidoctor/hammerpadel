import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/ContactForm";
import { PageHead } from "@/components/PageHead";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacto comercial de Hammer Padel: compra, alquiler, clubes y soporte.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  return (
    <div className="page">
      <PageHead kicker="Contacto" titulo="Hablemos">
        <p className="lede">Compra, alquiler, clubes o soporte. Te respondemos personalmente.</p>
      </PageHead>
      <div className="page__body">
        <p className="notice" style={{ marginBottom: "var(--sc-7)" }}>
          <strong>Prototipo.</strong> Datos de contacto de la empresa pendientes. El formulario no envía nada todavía.
        </p>
        <Suspense fallback={null}><ContactForm /></Suspense>
      </div>
    </div>
  );
}
