import { localidades } from "@/content/catalogo";
import { disponibilidadPublica } from "@/lib/reservas/consulta";
import { repositorio } from "@/lib/reservas/repositorio";

export const dynamic = "force-dynamic";

/** GET /api/disponibilidad?localidad=denia → horas libres de los próximos días. */
export async function GET(req: Request) {
  const localidad = new URL(req.url).searchParams.get("localidad") ?? "";
  if (!localidades.some((l) => l.id === localidad)) {
    return Response.json({ error: "Localidad no válida." }, { status: 400 });
  }
  const datos = await disponibilidadPublica(repositorio(), localidad, new Date());
  return Response.json(datos, { headers: { "Cache-Control": "no-store" } });
}
