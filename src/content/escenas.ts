/**
 * Estructura de las seis escenas de la landing (storyboard del documento de
 * diseño). En el prototipo solo tres están animadas con Scroll Craft; las otras
 * tres son secciones HTML estáticas preparadas para animarse más adelante con
 * recursos propios (Blender y fotografía real).
 */
export type Escena = {
  id: string;
  numero: number;
  titulo: string;
  dispositivo: "pin" | "scrub" | "flow";
  animadaEnPrototipo: boolean;
  recursoFuturo: string;
};

export const escenas: Escena[] = [
  { id: "pista", numero: 1, titulo: "La pista", dispositivo: "pin", animadaEnPrototipo: true,
    recursoFuturo: "Render Blender de pista nocturna por capas + fotografía real de la máquina recortada" },
  { id: "entrenamiento", numero: 2, titulo: "Entrenamiento", dispositivo: "pin", animadaEnPrototipo: true,
    recursoFuturo: "Vídeo real de sesión (jugador a contraluz) o render Blender; trazas en SVG" },
  { id: "producto", numero: 3, titulo: "Hammer Padel", dispositivo: "flow", animadaEnPrototipo: false,
    recursoFuturo: "Fotografía de estudio o render Blender a partir de CAD/medidas reales" },
  { id: "recogebolas", numero: 4, titulo: "Recogebolas", dispositivo: "flow", animadaEnPrototipo: false,
    recursoFuturo: "Vídeo real del recogebolas ya integrado; falta la toma de escena para Scroll World" },
  { id: "alquiler", numero: 5, titulo: "Alquiler en la Marina Alta", dispositivo: "scrub", animadaEnPrototipo: true,
    recursoFuturo: "Clip Blender de la pista al mapa (el actual es un esquema provisional)" },
  { id: "reserva", numero: 6, titulo: "Cierre hacia la reserva", dispositivo: "flow", animadaEnPrototipo: false,
    recursoFuturo: "Plano fijo de la máquina en pista, fotografía real" },
];
