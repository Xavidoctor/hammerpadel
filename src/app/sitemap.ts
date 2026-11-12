import type { MetadataRoute } from "next";

const BASE = "http://localhost:3000"; // Sustituir por el dominio definitivo.
const rutas = ["", "/comprar", "/recogebolas", "/alquiler", "/como-funciona", "/entrenamientos", "/clubes", "/soporte", "/contacto"];

export default function sitemap(): MetadataRoute.Sitemap {
  return rutas.map((r) => ({ url: `${BASE}${r}` }));
}
