# Vídeos de escritorio de la portada

Cada escena con scroll (pista, máquina 3D y alquiler) tiene cuatro versiones horizontales y una
vertical, y la web elige al cargar la que encaja con la forma de la VENTANA (`varianteVideo` en
`src/components/ScrollCraftStage.tsx`). Se decide por proporción, no por ancho: un portátil con la
escala de Windows al 150 % puede quedarse por debajo de 860 px de ancho y antes recibía el vídeo
vertical de móvil, que en una ventana apaisada se veía con un zoom enorme.

| Archivo | Formato | Para |
|---|---|---|
| `<nombre>.mp4` | 16:9, 1920×1080 | por defecto (portátiles, monitores Full HD) |
| `<nombre>-2k.mp4` | 16:9, 2560×1440 | pantallas de más de 2100 px físicos (2K, 4K, Retina) |
| `<nombre>-uwhd.mp4` | 21:9, 2560×1080 | ventanas de proporción 2:1 o más (PC con barras del navegador y de tareas, ultrapanorámicas) |
| `<nombre>-uw.mp4` | 21:9, 3440×1440 | ultrapanorámicas grandes |
| `<nombre>-m.mp4` | 9:16, 720×1280 | ventanas verticales (móvil; no cambia) |

Así el vídeo no se estira más de lo necesario ni se recorta media imagen en pantallas anchas.

## Cómo se generan

Todo es local y gratis (Chromium sin GPU, Python y ffmpeg). Servir la raíz del repo con
`python3 -m http.server 4700` y:

```bash
# escena 2 (máquina 3D) y escena 3 (alquiler): 16:9 a 2560x1440 y 21:9 a 3440x1440
node produccion/escena-2/secuencia.mjs 2560 1440 render/escena-2-2560x1440 360
node produccion/escena-2/secuencia.mjs 3440 1440 render/escena-2-3440x1440 360
ESCENA=escena-3 node produccion/escena-2/secuencia.mjs 2560 1440 render/escena-3-2560x1440 450
ESCENA=escena-3 node produccion/escena-2/secuencia.mjs 3440 1440 render/escena-3-3440x1440 450

# escena 1 (pista): foto ampliada x2 con Real-ESRGAN (ver abajo)
python produccion/escena-1/dron.py pista-x2.png render/escena-1-2560x1440 2560 1440 240
python produccion/escena-1/dron.py pista-x2.png render/escena-1-3440x1440 3440 1440 240

# codificar (también pósters y, en la escena 3, los nombres de los pueblos)
CRF_EXTRA=2 node produccion/codificar-escritorio.mjs public/medios/entrenamiento/maquina-3d render/escena-2-2560x1440 render/escena-2-3440x1440
node produccion/codificar-escritorio.mjs public/medios/alquiler/alquiler-3d render/escena-3-2560x1440 render/escena-3-3440x1440
POSTER_NOMBRE=pista node produccion/codificar-escritorio.mjs public/medios/pista/pista render/escena-1-2560x1440 render/escena-1-3440x1440
```

`secuencia.mjs` admite `desde` y `hasta` para repartir un render entre varios procesos.

## Detalles

- **Escena 1:** la foto original de la pista mide 1672×941. Se amplió x4 con Real-ESRGAN
  (modelo `RealESRGAN_x4plus`, código abierto, en CPU) y se reduce a x2 (3342×1882) como entrada
  de `dron.py`. El acercamiento tipo dron se limita a 1,25× en escritorio para no ampliar píxeles.
- **Escena 2:** la cámara se alejó un poco para que la máquina se vea entera durante todo el giro.
- **Escena 3:** en escritorio los nombres de los pueblos no van dentro del vídeo. El render exporta
  su posición por fotograma (`etiquetas.json`, `etiquetas-uw.json`) y la web los pinta como texto
  real (`src/components/EtiquetasMapa.tsx`), nítido a cualquier tamaño. El mapa se desplaza a la
  derecha para dejar libre la columna del titular. El vídeo vertical de móvil conserva los nombres.
