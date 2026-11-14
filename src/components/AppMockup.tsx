import { app } from "@/content/app";

/**
 * Maqueta de la app HammerPadel Control en dos móviles.
 * ILUSTRACIÓN: no hay capturas reales todavía. Solo enseña funciones confirmadas por Xavi
 * (Bluetooth con la máquina, entrenamientos preparados para 1 a 4 personas, personalizables,
 * se preparan antes de llegar a la pista). Sin batería, velocidades ni otros datos inventados.
 * Decorativa (aria-hidden): el texto real de la sección ya cuenta lo mismo.
 */

function Bluetooth() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M7 7l10 10-5 4V3l5 4L7 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Persona() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" />
    </svg>
  );
}

function Barra() {
  return (
    <div className="tel__barra">
      <span>9:41</span>
      <span className="tel__isla" />
      <span className="tel__iconos"><Bluetooth /></span>
    </div>
  );
}

export function AppMockup({ className = "" }: { className?: string }) {
  return (
    <figure className={`mock ${className}`} aria-hidden="true">
      <div className="mock__escena">
        {/* atrás: conexión con la máquina */}
        <div className="tel tel--atras">
          <div className="tel__pantalla">
            <Barra />
            <p className="tel__app">{app.nombre}</p>
            <div className="tel__maquina">
              {/* eslint-disable-next-line @next/next/no-img-element -- maqueta decorativa */}
              <img src="/medios/maquina/maquina.webp" alt="" width={888} height={1156} decoding="async" />
            </div>
            <p className="tel__nombre">Hammer X MAX</p>
            <p className="tel__estado"><span className="tel__punto" />Conectada por Bluetooth</p>
            <p className="tel__boton tel__boton--borde">Elegir entrenamiento</p>
          </div>
        </div>

        {/* delante: entrenamientos preparados */}
        <div className="tel tel--delante">
          <div className="tel__pantalla">
            <Barra />
            <p className="tel__app">{app.nombre}</p>
            <p className="tel__con"><span className="tel__punto" />Hammer X MAX conectada</p>
            <p className="tel__tit">Entrenamientos</p>
            <div className="tel__seg">
              <span>Individual</span>
              <span className="is-on">Grupo · hasta 4</span>
            </div>
            <p className="tel__sub">Jugadores</p>
            <div className="tel__jug">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={n <= 2 ? "is-on" : ""}><Persona /></span>
              ))}
            </div>
            <ul className="tel__lista">
              <li className="is-on"><b>Derecha</b><span>Preparado</span></li>
              <li><b>Revés</b><span>Preparado</span></li>
              <li><b>Bandeja</b><span>Preparado</span></li>
              <li className="tel__mio"><b>Mi entrenamiento</b><span>Personalizado</span></li>
            </ul>
            <p className="tel__boton">Lista para la pista</p>
          </div>
        </div>
      </div>
      <figcaption>Ilustración. No es una captura de la app.</figcaption>
    </figure>
  );
}
