import type { MetadataRoute } from "next";

// PROTOTIPO: no indexar. Cambiar a allow al aprobar la publicación.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
