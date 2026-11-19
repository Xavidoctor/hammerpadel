/**
 * Límite sencillo de envíos por IP en memoria (por instancia del servidor).
 * Suficiente para un formulario de contacto pequeño; no necesita ningún servicio.
 */
const VENTANA_MS = 10 * 60 * 1000;
const MAXIMO = 5;
const registro = new Map<string, number[]>();

export function permitido(clave: string, ahora = Date.now()) {
  const recientes = (registro.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAXIMO) {
    registro.set(clave, recientes);
    return false;
  }
  recientes.push(ahora);
  registro.set(clave, recientes);
  if (registro.size > 5000) registro.clear();
  return true;
}
