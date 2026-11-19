"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, DURACION_S, contrasenaCorrecta, crearCookie, leerCookie } from "@/lib/admin/sesion";
import { MAQUINAS, REPARTIDORES } from "@/lib/reservas/ajustes";
import { RepositorioPostgres } from "@/lib/reservas/postgres";
import { db } from "@/lib/servidor/db";
import { esFecha } from "@/lib/reservas/tiempo";
import type { EstadoReserva } from "@/lib/reservas/tipos";

async function usuario(): Promise<string> {
  const quien = leerCookie((await cookies()).get(COOKIE)?.value);
  if (!quien) redirect("/admin");
  return quien;
}

function repo(): RepositorioPostgres {
  const conexion = db();
  if (!conexion) throw new Error("Falta DATABASE_URL");
  return new RepositorioPostgres(conexion);
}

export async function entrar(_: string | null, f: FormData): Promise<string | null> {
  const quien = String(f.get("quien") ?? "");
  if (!REPARTIDORES.some((r) => r.id === quien)) return "Elige quién eres.";
  if (!contrasenaCorrecta(String(f.get("contrasena") ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // frena intentos repetidos
    return "Contraseña incorrecta.";
  }
  (await cookies()).set(COOKIE, crearCookie(quien), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/admin", maxAge: DURACION_S,
  });
  redirect("/admin");
}

export async function salir() {
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
  redirect("/admin");
}

const ESTADOS: EstadoReserva[] = ["confirmada", "cancelada", "completada", "no_presentado", "pendiente"];

export async function cambiarEstado(f: FormData) {
  const quien = await usuario();
  const estado = String(f.get("estado")) as EstadoReserva;
  if (!ESTADOS.includes(estado)) return;
  await repo().cambiarEstado(String(f.get("id")), estado, quien);
  revalidatePath("/admin");
}

const minutos = (hhmm: string) => {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

export async function crearBloqueo(f: FormData) {
  await usuario();
  const fecha = String(f.get("fecha"));
  const todoElDia = f.get("todo") === "on";
  const inicio = todoElDia ? 0 : minutos(String(f.get("desde")));
  const fin = todoElDia ? 1440 : minutos(String(f.get("hasta")));
  if (!esFecha(fecha) || !(inicio < fin)) return;
  const para = String(f.get("para") ?? "");
  await repo().crearBloqueo({
    fecha,
    fechaFin: fecha,
    inicio,
    fin,
    repartidorId: REPARTIDORES.some((r) => r.id === para) ? para : undefined,
    maquinaId: MAQUINAS.some((m) => m.id === para) ? para : undefined,
    motivo: MAQUINAS.some((m) => m.id === para) ? "mantenimiento" : "manual",
    nota: String(f.get("nota") ?? "").slice(0, 200) || undefined,
  });
  revalidatePath("/admin");
}

export async function borrarBloqueo(f: FormData) {
  await usuario();
  await repo().borrarBloqueo(Number(f.get("id")));
  revalidatePath("/admin");
}
