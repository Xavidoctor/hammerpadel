/**
 * App de la máquina.
 * [CONFIRMADO] por Xavi (14/11/2026): entrenamientos preparados para jugar solo y
 * para grupos de hasta 4 personas; entrenamientos personalizables; se pueden
 * preparar antes de llegar a la pista.
 * [PENDIENTE] nombre exacto (Xavi escribió «HammerPadel Controll»), plataformas
 * (iOS/Android), descarga, precio, cómo se conecta a la máquina y si se usa en el alquiler.
 */
export const app = {
  nombre: "HammerPadel Controll",
  lema: "Prepara el entrenamiento en casa. En la pista, solo entrena.",
  puntos: [
    { t: "Entrenamientos preparados", d: "Para entrenar solo o en grupo, de hasta 4 personas." },
    { t: "A tu medida", d: "Personaliza cada entrenamiento a tu gusto." },
    { t: "Listo antes de llegar", d: "Prepara la sesión antes de ir a la pista y no pierdas tiempo allí." },
  ],
  pendiente: "Plataformas (iOS y Android), descarga, precio y conexión con la máquina: pendientes de confirmar.",
} as const;
