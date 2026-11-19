# Escena 4 · Recogebolas Hammer en 3D

- `recogebolas.js`: modelo procedural (Three.js) hecho a partir de las fotos
  oficiales. Medidas aproximadas para la animación, **no** son especificaciones.
- `escena.js`: el recogebolas rueda por una pista azul y recoge las pelotas, que se
  quedan dentro. Se usa como vídeo vertical en la cabecera de `/recogebolas`.
- `sprites.html`: pelotas realistas (`pelotas.webp`, 8 variantes) y el cursor de la
  portada (`cursor-recogebolas.webp`, cesta con 0 a 28 pelotas) con fondo transparente.
- `visor.html`: el modelo solo, sobre fondo claro, para compararlo con las fotos.

## Render (gratis, en local, sin GPU)

```bash
python3 -m http.server 4700          # desde la raíz del repo
ESCENA=escena-4 node produccion/escena-2/secuencia.mjs 720 1280 /tmp/rb-m 360
```

## Codificación (vídeo vertical en bucle de /recogebolas)

```bash
ffmpeg -framerate 30 -i /tmp/rb-m/f%04d.png -vf "tpad=stop_mode=clone:stop_duration=1.5" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart -an public/medios/recogebolas/recogebolas-3d.mp4
ffmpeg -framerate 30 -i /tmp/rb-m/f%04d.png -vf "tpad=stop_mode=clone:stop_duration=1.5" -c:v libvpx-vp9 -b:v 900k -maxrate 1200k -bufsize 2400k -an public/medios/recogebolas/recogebolas-3d.webm
ffmpeg -i /tmp/rb-m/f0000.png -c:v libwebp -quality 80 public/medios/recogebolas/recogebolas-3d-poster.webp
```

Los sprites se capturan desde `sprites.html` con fondo transparente
(`window.pelota(0..7)` a 128 px y `window.cursor(0..28)` a 320 px) y se unen en tiras horizontales.
