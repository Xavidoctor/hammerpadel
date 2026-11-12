# Escena 1 · La pista: foto real y vídeo con IA

La web ya está preparada: cuando existan los archivos en `public/medios/pista/`, la escena 1 los usa sola.

| Tienes | Qué hace la web |
|---|---|
| Nada | Pista esquemática SVG (lo actual) |
| Solo la foto | Foto real a pantalla completa; el scroll la "enciende" (de oscura a iluminada) y avanza la cámara |
| Foto + vídeo | El scroll controla el vídeo fotograma a fotograma (Scroll Craft `scrub`) |

Textos, precios y botones siguen siendo HTML encima: **no van dentro de la imagen ni del vídeo**.

## 1. La foto
- Pista de pádel real, de noche o con poca luz, vista desde detrás del cristal de fondo, centrada, **vacía**.
- Horizontal 16:9 (mínimo 1920×1080). Si puedes, una segunda foto **vertical 9:16** (1080×1920) pensada para móvil, no recortada.
- Deja aire a la izquierda (escritorio) y arriba (móvil): ahí va el titular.
- **Derechos:** si es una pista reconocible de un club, necesitas su permiso. No debe parecer una instalación propia de Hammer Padel.

## 2. El vídeo (lo generas tú con IA, de imagen a vídeo)
Usa la foto como **primer fotograma**. Dos vídeos separados: uno 16:9 y otro 9:16 (desde la foto vertical).

- Duración: **4 a 6 s**, 24 o 30 fps.
- Cámara: un solo movimiento suave y constante **hacia delante** (dolly in) hacia el centro de la pista. Sin cortes, sin giros bruscos, sin zoom digital.
- Luz: empieza casi a oscuras; los focos se encienden **uno a uno** y al final la pista queda totalmente iluminada.
- **Sin personas, sin máquina, sin bolas, sin textos ni logos, sin audio.** La máquina irá con su foto real (la IA inventaría un diseño que no existe).
- Estable: sin parpadeos ni cambios de forma en las líneas o el cristal.

Prompt orientativo (en inglés suele funcionar mejor):

> Slow, steady dolly-in toward the center of an empty padel court at night, shot from behind the back glass wall. The court starts almost dark; the stadium floodlights switch on one by one from the far end to the near end until the blue court is fully lit. Cinematic, photorealistic, deep blue court surface, glass reflections, light haze in the air. No people, no objects on the court, no text, no logos. Single continuous camera move, no cuts.

## 3. Pásamelo
Sube al hilo la foto (o fotos) y el vídeo (o vídeos) originales, en máxima calidad. Yo los codifico gratis con ffmpeg para scroll (fotogramas clave densos, sin audio, versión móvil propia) y te paso la vista previa.

Si prefieres hacerlo tú en Windows (necesita `winget install Gyan.FFmpeg`):

```powershell
node produccion/codificar-pista.mjs --foto pista.jpg --foto-movil pista-vertical.jpg --video pista-16x9.mp4 --video-movil pista-9x16.mp4
npm run build; npm start
```
