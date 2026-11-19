"use server";

import { headers } from "next/headers";
import { createTransport } from "nodemailer";
import { contacto } from "@/content/contacto";
import { permitido } from "@/lib/contacto/limite";
import { asuntoCorreo, cuerpoCorreo, enlaceMailto, validar, type Campo } from "@/lib/contacto/mensaje";

export type EstadoContacto = {
  estado: "inicial" | "error" | "enviado" | "sin-configurar" | "fallo";
  errores?: Partial<Record<Campo, string>>;
  aviso?: string;
  mailto?: string;
  /** Lo que escribió el visitante, para no perderlo si hay que corregir algo. */
  valores?: Record<string, string>;
  /** Cambia en cada respuesta para que el formulario se vuelva a pintar con `valores`. */
  marca?: number;
};

const CAMPOS = ["nombre", "email", "telefono", "organizacion", "localidad", "asunto", "mensaje", "privacidad"] as const;
const recoger = (f: FormData) =>
  Object.fromEntries(CAMPOS.map((k) => [k, String(f.get(k) ?? "").slice(0, 4000)]));

/**
 * Envío gratuito, sin contratar servicios: el servidor de la web manda el
 * mensaje por SMTP con una cuenta de correo que Hammer Padel ya tiene
 * (p. ej. Gmail con una «contraseña de aplicación»). Variables de entorno:
 *   CONTACTO_SMTP_USER   cuenta que envía (p. ej. la de Gmail)
 *   CONTACTO_SMTP_PASS   contraseña de aplicación de esa cuenta
 *   CONTACTO_DESTINO     quién recibe (opcional; por defecto, la misma cuenta)
 *   CONTACTO_SMTP_HOST   opcional, por defecto smtp.gmail.com (puerto 465)
 * Sin configurar, el formulario ofrece abrir el correo del visitante (mailto).
 */
export async function enviarContacto(previo: EstadoContacto, f: FormData): Promise<EstadoContacto> {
  return { ...(await procesar(f)), marca: (previo.marca ?? 0) + 1 };
}

async function procesar(f: FormData): Promise<EstadoContacto> {
  const v = validar(f);
  if (!v.ok) {
    // A los bots se les responde como si hubiera ido bien.
    if (v.spam) return { estado: "enviado" };
    return { estado: "error", errores: v.errores, aviso: "Revisa los campos marcados.", valores: recoger(f) };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  if (!permitido(ip)) {
    return {
      estado: "fallo",
      aviso: "Has enviado varios mensajes seguidos. Espera unos minutos y vuelve a intentarlo.",
      valores: recoger(f),
    };
  }

  const usuario = process.env.CONTACTO_SMTP_USER;
  const clave = process.env.CONTACTO_SMTP_PASS;
  const destino = process.env.CONTACTO_DESTINO || usuario;

  if (!usuario || !clave || !destino) {
    const publico = contacto.email;
    return {
      estado: "sin-configurar",
      mailto: publico ? enlaceMailto(publico, v.datos) : undefined,
      valores: recoger(f),
    };
  }

  try {
    const transporte = createTransport({
      host: process.env.CONTACTO_SMTP_HOST || "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: usuario, pass: clave },
    });
    await transporte.sendMail({
      from: { name: "Web Hammer Padel", address: usuario },
      to: destino,
      replyTo: { name: v.datos.nombre, address: v.datos.email },
      subject: asuntoCorreo(v.datos),
      text: cuerpoCorreo(v.datos),
    });
    return { estado: "enviado" };
  } catch (e) {
    console.error("[contacto] fallo al enviar", e instanceof Error ? e.message : e);
    return {
      estado: "fallo",
      aviso: "No hemos podido enviar el mensaje. Inténtalo de nuevo en unos minutos.",
      mailto: contacto.email ? enlaceMailto(contacto.email, v.datos) : undefined,
      valores: recoger(f),
    };
  }
}
