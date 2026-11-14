/**
 * Dirección pública de la web, para metadatos, Open Graph y sitemap.
 *
 * - SITE_URL: se fija a mano en Netlify cuando haya dominio propio
 *   (p. ej. https://hammerpadel.es).
 * - URL: la pone Netlify sola en cada build (dirección principal del sitio).
 * - En local, http://localhost:3000.
 */
export const URL_SITIO = (process.env.SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/+$/, "");
