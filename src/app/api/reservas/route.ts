import { localidades } from "@/content/catalogo";
import { avisarTelegram, escaparHtml as e } from "@/lib/avisos/telegram";
import { REPARTIDORES } from "@/lib/reservas/ajustes";
import { repositorio } from "@/lib/reservas/repositorio";
import { MENSAJES_RECHAZO, validarSolicitud } from "@/lib/reservas/solicitud";
import { hhmm } from "@/lib/reservas/tiempo";
import { RepositorioPostgres } from "@/lib/reservas/postgres";

export const dynamic = "force-dynamic";

/** POST /api/reservas: graba una reserva pendiente de confirmar por Xavi o Marc. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ errores: ["Solicitud no válida."] }, { status: 400 });
  }
  const v = validarSolicitud(body);
  if (!v.ok) return Response.json({ errores: v.errores }, { status: v.bot ? 400 : 422 });

  const repo = await repositorio();
  if (!(repo instanceof RepositorioPostgres)) {
    return Response.json({ prototipo: true, errores: ["Las reservas todavía no están activas."] }, { status: 503 });
  }

  const r = await repo.crearReserva(v.datos, new Date());
  if (!r.ok) {
    return Response.json({ motivo: r.motivo, errores: [MENSAJES_RECHAZO[r.motivo]] }, { status: 409 });
  }

  const d = v.datos;
  const loc = localidades.find((l) => l.id === d.localidadId)?.nombre ?? d.localidadId;
  const rep = REPARTIDORES.find((x) => x.id === r.repartidorId)?.nombre ?? r.repartidorId;
  const origen = new URL(req.url).origin;
  await avisarTelegram(
    [
      `<b>Nueva reserva (pendiente de confirmar)</b>`,
      `${e(loc)} · ${d.fecha} · ${hhmm(d.inicio)}–${hhmm(d.inicio + 90)}`,
      `Pista: ${e(d.pista)}`,
      d.segundoRecogebolas ? `Recogebolas: 2 (uno extra, +2,50 €)` : `Recogebolas: 1 (incluido)`,
      `Cliente: ${e(d.nombre)} · ${e(d.telefono)} · ${e(d.email)}`,
      `Asignada a: ${e(rep)} · máquina ${e(r.maquinaId)}`,
      `<a href="${origen}/admin">Abrir el panel</a>`,
    ].join("\n"),
  );

  return Response.json({ id: r.id, estado: "pendiente" }, { status: 201 });
}
