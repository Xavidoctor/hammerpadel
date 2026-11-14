/**
 * App de la máquina.
 * [CONFIRMADO] por Xavi (14/11/2026): entrenamientos preparados para jugar solo y
 * para grupos de hasta 4 personas; entrenamientos personalizables; se pueden
 * preparar antes de llegar a la pista. Se escribe «HammerPadel Control»; gratis para
 * iPhone y Android; se conecta por Bluetooth; es la forma de controlar la máquina,
 * también en las sesiones de alquiler.
 * [PENDIENTE] enlaces de descarga (App Store / Google Play).
 */
export const app = {
  nombre: "HammerPadel Control",
  plataformasTexto: "Gratis para iPhone y Android",
  conexionTexto: "Se conecta a la máquina por Bluetooth",
  lema: "Prepara el entrenamiento en casa. En la pista, solo entrena.",
  puntos: [
    { t: "Entrenamientos preparados", d: "Para entrenar solo o en grupo, de hasta 4 personas." },
    { t: "A tu medida", d: "Personaliza cada entrenamiento a tu gusto." },
    { t: "Listo antes de llegar", d: "Prepara la sesión antes de ir a la pista y no pierdas tiempo allí." },
    { t: "Gratis y por Bluetooth", d: "Para iPhone y Android. Con ella controlas la máquina, también en las sesiones de alquiler." },
  ],
  pendiente: "Enlaces de descarga en App Store y Google Play: próximamente.",
} as const;
