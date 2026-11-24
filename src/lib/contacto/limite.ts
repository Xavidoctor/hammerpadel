import { crearLimitador } from "@/lib/servidor/limitador";

/**
 * Límite de envíos del formulario de contacto por IP: 5 cada 10 minutos.
 * Suficiente para un formulario pequeño; no necesita ningún servicio.
 */
export const permitido = crearLimitador({ ventanaMs: 10 * 60 * 1000, maximo: 5 });
