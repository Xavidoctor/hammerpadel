# BRIEF · Hammer Padel (prototipo Fase 1)

Origen: respuestas de Xavi en el hilo del proyecto y documento de diseño `docs/diseno-web.md`.
Las decisiones no dictadas por Xavi están marcadas como **[autorizado]** (propuesta del diseño aprobada como base) o **[propuesta]**.

## Las ocho preguntas
1. **Vibe:** premium, deportiva, tecnológica, minimalista, "agresiva pero elegante". Concepto: *Ingeniería bajo los focos*.
2. **Recorrido (en palabras de Xavi):** la pista vacía → entrenamiento → Hammer Padel 2.300 € → recogebolas 85 € → alquiler 20 €/90 min en la Marina Alta → reserva sencilla.
3. **Energía:** calma nocturna al inicio, intensidad máxima en el entrenamiento, pausa de producto, respiro con el recogebolas, apertura geográfica en el alquiler, cierre firme.
4. **Momento a recordar:** la pista llenándose de trazas amarillas mientras bajas: "la web donde scrolleas y la máquina te lanza bolas".
5. **Algo que ninguna otra web haga:** el scroll dibuja el entrenamiento (trazas por golpe).
6. **Rango:** premium-minimal con carácter deportivo. Sin paleta crema/latón, sin morados.
7. **Mundo único o escenas:** escenas distintas (no vuelo continuo).
8. **Recursos:** ninguno todavía. Prohibido inventar el aspecto del producto: huecos honestos hasta tener fotografía real o render Blender a partir de CAD.

## Curva de sensación
| Acto | Sensación | Qué la provoca |
|---|---|---|
| 1 Pista | Expectación | Los focos se encienden uno a uno, la cámara avanza, aparece el hueco del producto |
| 2 Entrenamiento | Intensidad (PICO) | Cada golpe dibuja su trayectoria; la pista se llena; remate "No esperes a tu compañero. Entrena." |
| 3 Hammer Padel | Deseo sereno | Silencio visual, producto y precio |
| 4 Recogebolas | Alivio | Bolas por el suelo, mensaje práctico |
| 5 Alquiler | Cercanía | De la pista al mapa de la Marina Alta |
| 6 Reserva | Decisión | Cuatro pasos y un botón |

**Pico:** acto 2, el de mayor recorrido (3,4 alturas de pantalla).
**Frase:** "Es la web donde bajas y la pista se llena de bolas, como en tu sesión."

## Gramática y movimiento propio
- Gramática: *chaptered editorial* con dos actos fijados (pin) y un scrub. Se descarta *filmic one-shot* y *worldflight* porque Xavi quiere escenas, no vuelo continuo, y sin generación de vídeo de pago.
- Movimiento propio: **trazas de entrenamiento** (SVG con `pathLength=1`, `stroke-dashoffset` calculado desde `--sc-p`; código propio, motor sin modificar).

## Partitura
| Acto | Dispositivo | Por qué |
|---|---|---|
| 1 Pista | `pin` + capas (CSS sobre `--sc-p`) | Apertura con profundidad sin vídeo |
| 2 Entrenamiento | `pin` + cues + trazas | El argumento avanza mientras el marco se queda quieto |
| 3 Producto | `flow` + `data-sc-in` | Pausa; se lee como documento |
| 4 Recogebolas | `flow` | Respiro |
| 5 Alquiler | `scrub` (clip provisional local) | El cambio de escala pista → mapa |
| 6 Reserva | `flow` cierre | Termina en acción, sin fundido |

## Verificación
Capturas escritorio/móvil en `lab/capturas` (no versionadas), pruebas e2e en `e2e/`. Pendiente: dispositivo iOS/Android real.
