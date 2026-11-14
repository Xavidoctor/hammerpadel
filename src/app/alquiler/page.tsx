import type { Metadata } from "next";
import { BookingRequest } from "@/components/BookingRequest";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { Price } from "@/components/Price";
import { alquiler, localidades } from "@/content/catalogo";
import { rutaLocalidad } from "@/content/localidades";

export const metadata: Metadata = {
  title: "Alquiler de máquina lanzapelotas de pádel en la Marina Alta",
  description: `Alquila la máquina Hammer Padel por ${alquiler.resumen} en Dénia, Ondara, La Xara y Pedreguer.`,
  alternates: { canonical: "/alquiler" },
};

export default function Alquiler() {
  return (
    <div className="page">
      <PageHead kicker="Alquiler" titulo="Alquila Hammer Padel">
        <Price texto={alquiler.precioTexto} sufijo={`/ ${alquiler.duracionTexto} · ${alquiler.pelotasTexto}`} />
        <p className="lede">
          Entrena sin comprar la máquina, o pruébala antes de decidir. Disponible inicialmente en{" "}
          {localidades.map((l) => l.nombre).join(", ")}.
        </p>
      </PageHead>
      <div id="reservar" className="reservar-ancla">
        <BookingRequest />
      </div>

      <section className="page__body prose" aria-labelledby="t-local">
        <h2 id="t-local">Alquiler de máquina de pádel por localidad</h2>
        <p>
          Llevamos la máquina a tu pista. Consulta cómo funciona el alquiler en cada localidad:
        </p>
        <ul className="cards">
          {localidades.map((l) => (
            <li key={l.id} className="card">
              <h3><Link href={rutaLocalidad(l.id)}>Alquiler de máquina de pádel en {l.nombre}</Link></h3>
            </li>
          ))}
        </ul>
        <h2>Condiciones</h2>
        <ul>
          <li>
            Sesión de 90 minutos por {alquiler.precioTexto} con {alquiler.pelotasIncluidas} pelotas incluidas.
            Pago en efectivo en la sesión.
          </li>
          <li>Reserva con al menos 6 horas de antelación. Xavi o Marc te confirman la reserva.</li>
          <li>Te llevamos la máquina a clubes, urbanizaciones y pistas privadas.</li>
          <li>Pelotas perdidas: 1 € por pelota.</li>
          <li>La máquina se controla desde el móvil con la app gratuita HammerPadel Control (iPhone y Android, por Bluetooth): descárgala antes de la sesión.</li>
        </ul>
        <p className="pending">
          Cancelaciones, reprogramaciones, fianza y responsabilidad por daños: pendientes de aprobación.
        </p>
      </section>
    </div>
  );
}
