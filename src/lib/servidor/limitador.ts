/**
 * Límites sencillos de intentos por clave (normalmente la IP) guardados en
 * memoria de cada instancia del servidor. No necesitan ningún servicio externo.
 * En Netlify cada función puede tener varias instancias, así que es un freno,
 * no una garantía: las reservas tienen además un tope global en la base de datos.
 */
export function crearLimitador({ ventanaMs, maximo }: { ventanaMs: number; maximo: number }) {
  const registro = new Map<string, number[]>();
  return function permitido(clave: string, ahora = Date.now()): boolean {
    const recientes = (registro.get(clave) ?? []).filter((t) => ahora - t < ventanaMs);
    if (recientes.length >= maximo) {
      registro.set(clave, recientes);
      return false;
    }
    recientes.push(ahora);
    registro.set(clave, recientes);
    if (registro.size > 5000) registro.clear();
    return true;
  };
}

/**
 * IP del visitante. Primero la cabecera que pone Netlify (el visitante no la
 * puede falsificar); si no, la última entrada de X-Forwarded-For, que añade el
 * proxy (la primera la puede escribir cualquiera).
 */
export function ipCliente(h: Pick<Headers, "get">): string {
  const netlify = h.get("x-nf-client-connection-ip")?.trim();
  if (netlify) return netlify;
  const reenviada = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return reenviada.at(-1) || h.get("x-real-ip")?.trim() || "local";
}

/**
 * true si la petición viene de otra web (un formulario o script ajeno). Los
 * navegadores siempre envían Origin en un POST; sin Origin (curl, pruebas) se deja pasar
 * y lo frenan los demás límites.
 */
export function origenAjeno(h: Pick<Headers, "get">): boolean {
  const origen = h.get("origin");
  if (!origen) return false;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  try {
    return new URL(origen).host !== host;
  } catch {
    return true;
  }
}
