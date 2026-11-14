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
    default: "Hammer Padel · Alquiler de máquina lanzapelotas de pádel",
    template: "%s · Hammer Padel",
  },
  description:
    "Alquila la máquina lanzapelotas Hammer Padel por sesiones de 90 minutos en Dénia, Ondara, La Xara y Pedreguer. También a la venta, con su recogebolas.",
  robots: PROTOTIPO ? { index: false, follow: false } : undefined,
  openGraph: { locale: "es_ES", type: "website", siteName: "Hammer Padel" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

// Sin JavaScript (o si un entorno bloquea los scripts) todo el contenido animable
// se muestra estático y el menú queda como lista normal. Se hace con <noscript>
// en vez de un script en línea, que algunos alojamientos bloquean.
const sinJs = `
.world [data-sc-act]{--sc-p:1!important}
.pista__frame{--t:1!important}
[data-sc-cue],[data-sc-in],[data-sc-stagger]>*{opacity:1!important;transform:none!important}
.train__punch{position:relative!important;top:auto!important;padding-top:60vh}
.train__lede{position:relative!important;top:auto!important;padding-top:var(--sc-8)}
.rent__copy{position:relative!important;left:auto!important;bottom:auto!important;padding:40vh var(--sc-gutter) var(--sc-8)}
.motion-toggle,.bar__toggle{display:none!important}
@media (max-width:1100px){.bar{height:auto;flex-wrap:wrap;padding-block:var(--sc-3)}.bar__nav{position:static!important;display:block!important;background:none;border:0;padding:0;width:100%}.bar__nav ul{flex-direction:row;flex-wrap:wrap;gap:var(--sc-2) var(--sc-4)}.bar__nav a{border:0;font-size:var(--sc-t-sm);padding:var(--sc-1) 0}}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={GeistSans.variable} suppressHydrationWarning>
      <head>
        <noscript>
          <style>{sinJs}</style>
        </noscript>
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
