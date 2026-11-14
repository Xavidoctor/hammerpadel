import type { MetadataRoute } from "next";
import { URL_SITIO } from "@/lib/sitio";

const BASE = URL_SITIO;
const rutas = ["", "/comprar", "/recogebolas", "/alquiler", "/como-funciona", "/entrenamientos", "/clubes", "/soporte", "/contacto"];

export default function sitemap(): MetadataRoute.Sitemap {
  return rutas.map((r) => ({ url: `${BASE}${r}` }));
}
