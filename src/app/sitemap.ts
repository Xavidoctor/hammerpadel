import type { MetadataRoute } from "next";
import { esIndexable, paginasLocalidad, rutaLocalidad } from "@/content/localidades";
import { URL_SITIO as BASE } from "@/lib/sitio";

const rutas = ["", "/comprar", "/recogebolas", "/alquiler", "/como-funciona", "/entrenamientos", "/clubes", "/soporte", "/contacto", "/legal", "/legal/aviso-legal", "/legal/privacidad", "/legal/cookies", "/legal/condiciones-alquiler", "/legal/condiciones-venta"];

/** Las páginas por localidad entran solo cuando tienen contenido local propio. */
export const rutasLocalidad = paginasLocalidad.filter(esIndexable).map((p) => rutaLocalidad(p.id));

export default function sitemap(): MetadataRoute.Sitemap {
  return [...rutas, ...rutasLocalidad].map((r) => ({ url: `${BASE}${r}` }));
}
