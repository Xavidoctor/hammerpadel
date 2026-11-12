import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { alquiler } from "@/content/catalogo";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Cómo funciona entrenar con la máquina lanzapelotas Hammer Padel y cómo funciona el alquiler.",
  alternates: { canonical: "/como-funciona" },
};

export default function ComoFunciona() {
  return (
    <div className="page">
      <PageHead kicker="Cómo funciona" titulo="Tú golpeas. Ella repite.">
        <p className="lede">Entrenamiento autónomo: la máquina lanza, tú repites el golpe hasta dominarlo.</p>
      </PageHead>
      <div className="page__body">
        <p className="notice">
          <strong>Pendiente.</strong> El funcionamiento detallado de la máquina (modos, ajustes, carga,
          batería) se publicará con la documentación técnica oficial. No mostramos datos sin verificar.
        </p>
        <div className="prose">
          <h2>Entrenar con máquina</h2>
          <ol className="cards">
            <li className="card"><h3>1. Prepara la sesión</h3><p>Coloca la máquina en tu pista y decide qué golpe vas a trabajar.</p></li>
            <li className="card"><h3>2. Repite</h3><p>Golpe tras golpe, sin esperar a un compañero.</p></li>
            <li className="card"><h3>3. Recoge rápido</h3><p>Con el recogebolas Hammer vuelves antes a entrenar.</p></li>
          </ol>
          <h2>Cómo funciona el alquiler</h2>
          <p>
            Eliges localidad, fecha y horario, y reservas una sesión de {alquiler.duracionTexto} por{" "}
            {alquiler.precioTexto}. La entrega y las pistas donde usarla están pendientes de definir.
          </p>
          <p><Link href="/alquiler">Ir a la reserva</Link></p>
        </div>
      </div>
    </div>
  );
}
