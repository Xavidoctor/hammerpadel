import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource-variable/archivo/wdth.css";
import "../vendor/scrollcraft/scrollcraft.css";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/** PROTOTIPO LOCAL: no indexar hasta aprobar la publicación. */
export const PROTOTIPO = true;

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "Hammer Padel · Máquina lanzapelotas de pádel",
    template: "%s · Hammer Padel",
  },
  description:
    "Hammer Padel: máquina lanzapelotas para entrenar pádel de forma autónoma, recogebolas y alquiler por sesiones en la Marina Alta.",
  robots: PROTOTIPO ? { index: false, follow: false } : undefined,
  openGraph: { locale: "es_ES", type: "website", siteName: "Hammer Padel" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

// Marca <html> con .js antes del primer pintado. Sin esta clase (sin JS) todo el
// contenido animable se muestra estático: ninguna animación oculta texto o CTA.
const preferencia = `(function(){var d=document.documentElement;d.classList.add('js');try{if(localStorage.getItem('hp-sin-animacion')==='1')d.classList.add('hp-static')}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferencia }} />
      </head>
      <body>
        <a className="skip" href="#contenido">Saltar al contenido</a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
