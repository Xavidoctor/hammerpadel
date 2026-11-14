/**
 * App de la máquina.
 * [CONFIRMADO] por Xavi (14/11/2026): se llama «HammerPadel Control»; es gratis, para
 * iPhone y Android, se conecta a la máquina por Bluetooth y es la forma de controlarla
 * (también en las sesiones de alquiler). Entrenamientos preparados para jugar solo y
 * para grupos de hasta 4 personas; personalizables; se preparan antes de llegar a la pista.
 * [PENDIENTE] enlaces de descarga y capturas reales.
 */
export const app = {
  nombre: "HammerPadel Control",
  lema: "Prepara el entrenamiento en casa. En la pista, solo entrena.",
  datos: ["Gratis", "iPhone y Android", "Bluetooth"],
  puntos: [
    { t: "Controla la máquina", d: "Desde el móvil, por Bluetooth. También en las sesiones de alquiler." },
    { t: "Entrenamientos preparados", d: "Para entrenar solo o en grupo, de hasta 4 personas." },
    { t: "A tu medida", d: "Personaliza cada entrenamiento a tu gusto." },
    { t: "Listo antes de llegar", d: "Prepara la sesión antes de ir a la pista y no pierdas tiempo allí." },
  ],
  pendiente: "Enlaces de descarga: próximamente.",
} as const;
