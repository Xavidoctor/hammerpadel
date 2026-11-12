import type { Metadata } from "next";
import { BookingRequest } from "@/components/BookingRequest";
import { PageHead } from "@/components/PageHead";
import { Price } from "@/components/Price";
import { alquiler, localidades } from "@/content/catalogo";

export const metadata: Metadata = {
  title: "Alquiler de máquina lanzapelotas de pádel en la Marina Alta",
  description: `Alquila la máquina Hammer Padel por ${alquiler.resumen} en Dénia, Ondara, La Xara y Pedreguer.`,
  alternates: { canonical: "/alquiler" },
};

export default function Alquiler() {
  return (
    <div className="page">
      <PageHead kicker="Alquiler" titulo="Alquila Hammer Padel">
        <Price texto={alquiler.precioTexto} sufijo={`/ ${alquiler.duracionTexto}`} />
        <p className="lede">
          Entrena sin comprar la máquina, o pruébala antes de decidir. Disponible inicialmente en{" "}
          {localidades.map((l) => l.nombre).join(", ")}.
        </p>
      </PageHead>
      <BookingRequest />

      <section className="page__body prose" aria-labelledby="t-local">
        <h2 id="t-local">Alquiler de máquina de pádel por localidad</h2>
        {localidades.map((l) => (
          <div key={l.id}>
            <h3>Alquiler de máquina de pádel en {l.nombre}</h3>
            <p className="pending">
              Información de la zona (pistas donde usarla, entrega y recogida) pendiente de definir.
            </p>
          </div>
        ))}
        <h2>Condiciones</h2>
        <p className="pending">
          Cancelaciones, reprogramaciones, fianza y responsabilidad por daños: pendientes de aprobación.
        </p>
      </section>
    </div>
  );
}
