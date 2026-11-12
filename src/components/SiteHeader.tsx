"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navegacion } from "@/content/catalogo";

export function SiteHeader() {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [abierto]);

  return (
    <header className="bar" data-open={abierto || undefined}>
      <Link href="/" className="bar__mark" aria-label="Hammer Padel, inicio">
        HAMMER<span>PADEL</span>
      </Link>
      <nav aria-label="Principal" className="bar__nav" id="menu-principal">
        <ul>
          {navegacion.map((n) => (
            <li key={n.href}>
              <Link href={n.href} onClick={() => setAbierto(false)} aria-current={ruta === n.href ? "page" : undefined}>
                {n.texto}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link href="/alquiler" className="bar__cta">Reservar</Link>
      <button
        type="button"
        className="bar__toggle"
        aria-expanded={abierto}
        aria-controls="menu-principal"
        onClick={() => setAbierto((v) => !v)}
      >
        {abierto ? "Cerrar" : "Menú"}
      </button>
    </header>
  );
}
