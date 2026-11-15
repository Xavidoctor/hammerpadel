# Escena 4 · Recogebolas Hammer en 3D

El Recogebolas Hammer rueda por una pista azul en penumbra y va recogiendo las
pelotas del suelo; cada una entra por debajo de las varillas y se queda dentro de
la cesta. Se usa en la portada (`#recogebolas`) como vídeo controlado por el scroll.

- `recogebolas.js`: modelo procedural (Three.js) hecho a partir de las fotos
  oficiales. Medidas aproximadas para la animación, **no** son especificaciones.
- `escena.js`: pista, luces, pelotas, recorrido y cámara (16:9 y 9:16).
- `visor.html`: el modelo solo, sobre fondo claro, para compararlo con las fotos.

## Render (gratis, en local, sin GPU)

```bash
python3 -m http.server 4700          # desde la raíz del repo
ESCENA=escena-4 node produccion/escena-2/secuencia.mjs 1600 900 /tmp/rb-d 360
ESCENA=escena-4 node produccion/escena-2/secuencia.mjs 720 1280 /tmp/rb-m 360
```

## Codificación para scroll (fotograma clave cada 8, sin audio)

```bash
ffmpeg -framerate 30 -i /tmp/rb-d/f%04d.png -c:v libx264 -preset slow -crf 22 -g 8 -pix_fmt yuv420p -movflags +faststart -an public/medios/recogebolas/escena-3d.mp4
ffmpeg -framerate 30 -i /tmp/rb-m/f%04d.png -c:v libx264 -preset slow -crf 23 -g 8 -pix_fmt yuv420p -movflags +faststart -an public/medios/recogebolas/escena-3d-m.mp4
# pósters (último fotograma: la cesta llena)
ffmpeg -i /tmp/rb-d/f0359.png -c:v libwebp -quality 80 public/medios/recogebolas/escena-3d-poster.webp
ffmpeg -i /tmp/rb-m/f0359.png -c:v libwebp -quality 80 public/medios/recogebolas/escena-3d-poster-m.webp
```
