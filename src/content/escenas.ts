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
    recursoFuturo: "Foto real apagada con capas de luz calculadas; más adelante render Blender por capas" },
  { id: "entrenamiento", numero: 2, titulo: "Entrenamiento", dispositivo: "scrub", animadaEnPrototipo: true,
    recursoFuturo: "Máquina 3D propia (Three.js, produccion/escena-2) lanzando bolas; más adelante render Blender con fotos reales de la máquina" },
  { id: "alquiler", numero: 3, titulo: "Alquiler en la Marina Alta (actividad principal)", dispositivo: "scrub", animadaEnPrototipo: true,
    recursoFuturo: "Render propio: mapa de la Marina Alta, bajada tipo dron a la pista y llegada de la Hammer X MAX (produccion/escena-3)" },
  { id: "reserva", numero: 4, titulo: "Reserva", dispositivo: "flow", animadaEnPrototipo: false,
    recursoFuturo: "Plano fijo de la máquina en pista, fotografía real" },
  { id: "producto", numero: 5, titulo: "Comprar la máquina", dispositivo: "flow", animadaEnPrototipo: false,
    recursoFuturo: "Fotografía de estudio o render Blender a partir de CAD/medidas reales" },
  { id: "recogebolas", numero: 6, titulo: "Recogebolas", dispositivo: "flow", animadaEnPrototipo: false,
    recursoFuturo: "Vídeo real del recogebolas ya integrado" },
];
