import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page">
      <header className="page__head">
        <p className="kicker">404</p>
        <h1 className="display">Bola fuera</h1>
        <p className="lede">Esta página no existe.</p>
        <p><Link className="btn btn--accent" href="/">Volver al inicio</Link></p>
      </header>
    </div>
  );
}
