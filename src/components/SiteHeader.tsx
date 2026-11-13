"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navegacion } from "@/content/catalogo";
import { Logo } from "./Logo";

export function SiteHeader() {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();

  // El menú se cierra con Escape, al tocar fuera, al hacer scroll o al ensanchar la ventana.
  useEffect(() => {
    if (!abierto) return;
    const cerrar = () => setAbierto(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    const onFuera = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".bar")) cerrar();
    };
    const y0 = scrollY;
    const onScroll = () => Math.abs(scrollY - y0) > 40 && cerrar();
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onFuera);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", cerrar);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onFuera);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", cerrar);
    };
  }, [abierto]);

  return (
    <header className="bar" data-open={abierto || undefined}>
      <Link href="/" className="bar__mark" aria-label="Hammer Padel, inicio">
        <Logo className="bar__logo" />
        <span>PADEL</span>
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
