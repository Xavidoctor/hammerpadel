# Hammer Padel — Documento de diseño de la web oficial

**Versión:** 0.2 (decisiones unificadas) · **Fecha:** 13/11/2026 · **Estado:** Fase 1 aprobada como prototipo local

> No se ha generado ningún recurso de pago, no se han gastado créditos, no se ha contratado ni configurado ningún servicio y no se ha desplegado nada.

## Decisiones unificadas (v0.2, 13/11/2026)

Estas decisiones de Xavi **prevalecen** sobre cualquier texto de la v0.1 que las contradiga. Las secciones 13 a 15 y la descripción del motor ya están reescritas; en el resto, donde ponga "Scroll World" léase **Scroll Craft**.

| # | Decisión [CONFIRMADO] | Cómo se aplica |
|---|---|---|
| 1 | Scroll Craft sustituye a Scroll World como motor de animación | Motor `nateherkai/scroll-craft` 0.3.1 (MIT) vendorizado sin modificar en `src/vendor/scrollcraft` |
| 2 | Producción audiovisual futura con Blender y fotografía real | Ver §15 reescrita |
| 3 | Monid, Higgsfield y Seedance no son dependencias | Eliminados de §13 y §14. La API kie.ai que menciona Scroll Craft tampoco se usa |
| 4 | Seis escenas, pero solo tres animadas al principio | Animadas: 1 La pista, 2 Entrenamiento, 5 Alquiler. Estructura preparada para 3, 4 y 6 (`src/content/escenas.ts`) |
| 5 | Recursos provisionales gratuitos sin inventar el producto | Pista y mapa esquemáticos dibujados en SVG; el producto es un hueco marcado "fotografía real pendiente" |
| 6 | Textos, precios y CTA en HTML semántico | Nada de texto dentro de imágenes o vídeos |
| 7 | Compra y alquiler independientes de las animaciones | `/comprar`, `/recogebolas` y `/alquiler` no cargan el motor (verificado en las pruebas) |
| 8 | Escritorio y móvil desde el principio | Encuadre de pista propio para vertical, clip móvil 9:16 propio |
| 9 | Traslados y preparación entre ubicaciones | §8.3 bis: margen = recogida + traslado + preparación, desactivable |
| 10 | No suponer pistas o instalaciones propias | Ubicación exacta "pendiente" en todas las páginas; el mapa es conceptual |
| 11 | Sin pasarela de pago | Botones "Solicitar compra" y "Solicitar reserva" sin cobro |
| 12 | No publicar horarios ficticios | El paso 3 pide una franja **preferida**; los huecos reales solo saldrán de reglas reales |
| 13 | Sin características técnicas no verificadas | Fichas técnicas con "Pendiente de documentación oficial" |
| 14 | Precios (actualizados 14-11-2026): 2.499 €, 65 €, 20 €/90 min. IVA pendiente | Fuente única `src/content/catalogo.ts`; nota "Tratamiento del IVA pendiente de confirmar" |
| 15 | Web funcional, rápida y visualmente excelente | Sin vídeo en la carga inicial; motor diferido; niveles de degradación |
| 16 | (14-11-2026) El alquiler es la actividad principal; la venta de la máquina y el recogebolas es secundaria | Portada y navegación empiezan por el alquiler: CTA principal "Reservar sesión", escenas Pista → Entrenamiento → Alquiler → Reserva → Compra → Recogebolas |
| 17 | (14-11-2026) Escena 2 con la máquina en 3D | Modelo procedural propio en Three.js (sin marcas PUSUN/PADELSHOOTER/MAX, logo Hammer), medidas de referencia 76,4 × 53 × 37,3 cm. Render en el propio equipo (Chromium sin GPU), vídeo scrub. Fuente en `produccion/escena-2/` |
| 18 | (14-11-2026) Alquiler: 25 € la sesión de 90 min, con 60 pelotas incluidas (antes 20 €) | `src/content/catalogo.ts` (alquiler) |
| 19 | (14-11-2026) La máquina se llama Hammer X MAX | Nombre en `catalogo.ts` (maquina.nombre); CTA de portada «Quiero mi propia Hammer X MAX» → /comprar |

### 8.3 bis · Traslados entre ubicaciones [PROPUESTA, solo si el modelo operativo lo requiere]
Si una misma máquina presta servicio en varias localidades, entre dos sesiones hace falta tiempo para recoger, trasladar y preparar. La lógica (`src/lib/reservas/disponibilidad.ts`, con pruebas) lo modela así:

- `margen(A → B) = recogida + traslado(A, B) + preparación` si A ≠ B; en la misma ubicación, el mayor de recogida y preparación.
- Dos sesiones de la misma máquina chocan si no cabe ese margen entre ellas.
- Con todo a 0 se comporta como un calendario normal. En base de datos se traduce a la restricción de exclusión de §8.3 aplicada sobre el rango ampliado con el margen, más una comprobación en la transacción para el traslado entre ubicaciones distintas.
- Pendiente de Xavi: si habrá traslados y sus tiempos reales.

### Convención usada en el documento

- **[CONFIRMADO]**: dato dado por Hammer Padel (precios, productos, zonas, reglas).
- **[PROPUESTA]**: recomendación mía, pendiente de tu aprobación.
- **[PENDIENTE]**: información que falta y que no voy a inventar.
- **[VERIFICAR]**: dato externo (precio de un proveedor, límite de un plan) que hay que comprobar antes de decidir.

### Punto de partida

- **Repositorio** `Xavidoctor/hammerpadel`: está vacío (sin commits). Partimos de cero, sin deuda técnica.
- **Motor de animación: Scroll Craft** (`github.com/nateherkai/scroll-craft`, licencia MIT, © 2026 Nate Herk). Copia sin modificar en `src/vendor/scrollcraft` con su licencia y sumas SHA256.

#### Qué es Scroll Craft (resumen)

- Motor en JavaScript sin dependencias que **no genera DOM**: lee atributos `data-sc-*` sobre HTML real (renderizado en servidor) y lo anima desde un único valor de scroll.
- Dispositivos: `pin` (la escena se fija mientras el contenido avanza), `scrub` (el scroll controla un vídeo o secuencia de imágenes), `pan`, `parallax`, `cue`, `kinetic`, `reveal`, `drift` de color, y efectos de puntero.
- Publica el progreso de cada acto como `--sc-p`, así que el comportamiento propio de Hammer Padel (las trazas de bola) se escribe en CSS/SVG sin tocar el motor.
- Respeta `prefers-reduced-motion` (sin vídeo, sin desplazamientos), sirve clips móviles distintos y tiene `destroy()` para Next.js.
- La skill incluye un método de diseño (curva de sensación, un único pico, movimiento propio) y una herramienta opcional de generación con kie.ai que **no usamos**.

---

## 1. Arquitectura propuesta

### 1.1 Principio rector [PROPUESTA]

Dos capas separadas que nunca dependen la una de la otra:

1. **Capa audiovisual (Scroll World)**: solo en la landing `/`. Es una mejora progresiva por encima de un HTML completo. Si no carga, no pasa nada: el usuario ve stills y texto.
2. **Capa comercial**: navegación, productos, reservas, compra, FAQ, contacto y SEO. HTML renderizado en servidor, rápido, accesible e indexable. No carga ni un byte de vídeo de Scroll World.

### 1.2 Mapa del sitio [PROPUESTA sobre tu estructura]

| Ruta | Contenido | Tipo de render |
|---|---|---|
| `/` | Landing: Scroll World + bloque HTML de conversión + resumen indexable | Estático + mejora progresiva |
| `/comprar` | Máquina Hammer Padel, 2.499 € | Estático |
| `/recogebolas` | Recogebolas Hammer, 65 € | Estático |
| `/alquiler` | Reserva en 4 pasos, 25 € / 90 min con 60 pelotas | Estático + interactivo (cliente) |
| `/alquiler/[localidad]` | Solo cuando haya contenido real por localidad (ver SEO) | Estático |
| `/como-funciona` | Funcionamiento de la máquina (con documentación real) | Estático |
| `/entrenamientos` | Ejercicios y rutinas | Estático (contenido editorial) |
| `/clubes` | Clubes, academias y entrenadores | Estático + formulario |
| `/soporte` | Manuales, FAQ técnica, garantía | Estático |
| `/contacto` | Contacto comercial | Estático + formulario |
| `/carrito`, `/checkout/*` | Fase 2, cuando se elija pasarela | Dinámico |
| `/legal/*` | Aviso legal, privacidad, cookies, condiciones de venta y de alquiler | Estático |

Rutas de sistema: `/api/availability`, `/api/bookings`, `/api/checkout`, `/api/webhooks/[proveedor]` (estas dos últimas en fase 2).

### 1.3 Stack técnico [PROPUESTA]

- **Next.js (App Router) + TypeScript**: SSG para todo el contenido comercial, rutas de servidor para reservas y pagos, buen SEO y buen rendimiento. Es lo que ya contemplabais.
- **Base de datos PostgreSQL**: imprescindible por una razón concreta: permite garantizar a nivel de base de datos que una máquina no se reserve dos veces a la vez (restricción de exclusión sobre rangos de tiempo, ver §8). Proveedor gestionado (Supabase o Neon) con plan gratuito para desarrollo.
- **ORM**: Drizzle (ligero, tipado, migraciones SQL legibles).
- **Estilos**: CSS propio con tokens de diseño (variables CSS) y Tailwind solo como utilitario. El aspecto "plantilla SaaS" viene de usar componentes prefabricados, no de la herramienta; no usaremos kits de UI genéricos.
- **Scroll World**: el `scrub-engine.js` de la skill envuelto en un componente cliente de Next.js que se carga de forma diferida.
- **Contenido**: textos de productos y entrenamientos en archivos MDX/TypeScript dentro del repo (sin CMS de pago). Si más adelante necesitáis editar sin programador, se evalúa un CMS.

### 1.4 Diagrama lógico

```
Navegador
 ├─ HTML estático (todas las páginas)  ← CDN
 ├─ Scroll World (solo /)               ← vídeos MP4 + stills en CDN, carga diferida
 └─ Formularios / reserva / checkout    → Rutas de servidor Next.js
                                            ├─ PostgreSQL (máquinas, ubicaciones, reservas, pedidos)
                                            ├─ Email transaccional (confirmaciones)
                                            └─ Pasarela de pago (fase 2, por decidir)
```

---

## 2. Storyboard definitivo

Mantengo tu historia y la ajusto en tres puntos [PROPUESTA]:

- **Separo "precio" de "experiencia"**: en el Scroll World el precio y el CTA aparecen como **HTML superpuesto** (texto real, clicable e indexable), nunca dentro del vídeo. Así se puede cambiar un precio sin regenerar nada.
- **El CTA doble de la escena 1 se mantiene**, pero también hay una **barra fija mínima** (Comprar · Alquilar) visible durante todo el recorrido, para que nadie tenga que terminar la animación para comprar.
- **Añado una escena de cierre** que hace de puente físico hacia el formulario de reserva.

> Cámara: arquitectura **B** de la skill (escenas + conectores). La A (toma única) da menos control para detenerse en el producto y no permite rehacer una escena sin rehacer todo lo posterior.

### Escena 1 — La pista
- **Visual**: noche, pista de pádel azul vacía, cristales con reflejos, focos encendiéndose uno a uno. La cámara avanza desde fuera del cristal hacia el centro. Al llegar, la máquina Hammer Padel aparece en el fondo de pista, iluminada como un objeto de exposición.
- **Texto (HTML)**: HAMMER PADEL · Tu entrenamiento. Tu ritmo. Tu pista.
- **CTA (HTML)**: Comprar máquina — 2.499 € · Alquilar — 25 € / 90 min
- **Póster/LCP**: still de la pista con la máquina ya visible (para que el primer impacto incluya el producto aunque no cargue el vídeo).

### Escena 2 — Entrenamiento
- **Visual**: la máquina lanza; trazas de bola amarillo fluorescente; un jugador a contraluz (silueta recortada por los focos) repite golpes. Sin primeros planos de cara ni de manos (ver riesgos §16).
- **Texto progresivo (HTML, aparece según el scroll)**: Derecha · Revés · Bandeja · Víbora · Volea · Desplazamiento · Repetición.
- **Mensaje**: NO ESPERES A TU COMPAÑERO. ENTRENA.

### Escena 3 — Hammer Padel (hero de producto)
- **Visual**: la pista se apaga, queda la máquina sola sobre fondo grafito, luz cenital y luz lateral rasante, giro lento de cámara a su alrededor.
- **Texto**: HAMMER PADEL · 2.499 € · CTA COMPRAR HAMMER PADEL (+ enlace secundario "Cómo funciona").
- **Nota crítica**: esta escena es la que más exige fidelidad al producto real. Ver §16 (riesgo 1): propongo que se haga a partir de fotografía o render 3D real, no generada libremente.

### Escena 4 — Recogebolas
- **Visual**: vuelve la luz; el suelo de la pista está lleno de bolas. La cámara baja a ras de suelo, entre las bolas, y aparece el recogebolas Hammer recogiéndolas.
- **Texto**: MENOS TIEMPO RECOGIENDO. MÁS TIEMPO ENTRENANDO. · RECOGEBOLAS HAMMER · 65 € · CTA COMPRAR RECOGEBOLAS.

### Escena 5 — Alquiler en la Marina Alta
- **Visual**: la cámara sube por encima del cristal y se eleva hasta una vista aérea nocturna estilizada de la costa de la Marina Alta; cuatro puntos de luz amarilla se encienden.
- **Texto**: ¿QUIERES PROBARLA? · ALQUILA HAMMER PADEL · 25 € · 90 MINUTOS · Dénia · Ondara · La Xara · Pedreguer.
- **Precaución**: es una vista **conceptual**, no un mapa con ubicaciones concretas (las ubicaciones exactas no están definidas y no debemos sugerir instalaciones propias).

### Escena 6 — Cierre / umbral
- **Visual**: la cámara desciende de nuevo a una pista, se detiene frente a la máquina con el foco encendido. Plano estable, sin movimiento final.
- **Texto**: RESERVAR ENTRENAMIENTO.
- **Transición**: al terminar el scroll del vídeo, el fondo se funde a grafito y el usuario está ya en el **bloque HTML de reserva** (paso 1: elegir localidad), sin cambiar de página. El mismo bloque está en `/alquiler`.

---

## 3. Número recomendado de escenas

**Recomendación: 6 escenas (N = 6)**, la mitad del rango que propone la skill (5–7).

- 5 escenas narrativas (las tuyas) + 1 de cierre que resuelve la transición a reserva.
- Más escenas alargan el scroll, suben el peso y el coste (cada escena añade 1 imagen + 2 vídeos por formato) y alejan el CTA.
- **Alternativa de ahorro**: N = 5 fusionando la escena 6 con la 5 (la cámara baja desde el aéreo directamente al plano final). Reduce 2 vídeos por formato. La dejaría como plan B si las pruebas de borrador muestran que la escena 5 se sostiene sola.

Con N = 6 y arquitectura B: **6 imágenes + 11 vídeos (6 escenas + 5 conectores) por formato** (escritorio 16:9 y móvil 9:16).

---

## 4. Transición entre escenas

| De → A | Conector (vídeo) | Idea visual |
|---|---|---|
| 1 → 2 | Pista vacía → entrenamiento | La primera bola sale de la máquina y la cámara la sigue: el disparo **es** el corte. |
| 2 → 3 | Entrenamiento → producto | Los focos se apagan salvo uno sobre la máquina; el jugador sale de plano; fondo a grafito. |
| 3 → 4 | Producto → recogebolas | Se encienden las luces; la cámara pasa por encima de la máquina y cae hacia el suelo lleno de bolas. |
| 4 → 5 | Bolas → Marina Alta | Una bola rebota, la cámara sube con ella por encima del cristal y se eleva al aéreo. |
| 5 → 6 | Aéreo → pista final | Picado hacia uno de los puntos de luz, aterrizaje en una pista con la máquina encendida. |
| 6 → HTML | Sin vídeo | Fundido a grafito + aparición del formulario de reserva. |

Reglas técnicas (de la skill): los conectores se generan desde el **último fotograma real** del clip anterior y el **primero real** del siguiente (no desde el still), siempre con **el mismo modelo** en toda la cadena, y si un conector no funciona se sustituye por un crossfade (sin bloquear el lanzamiento).

---

## 5. Dirección artística

### 5.1 Concepto [PROPUESTA]: "Ingeniería bajo los focos"
El producto tratado como un objeto de ingeniería expuesto en un escenario deportivo nocturno. Referencia de tono: presentación de producto de automoción/tecnología, no catálogo deportivo.

### 5.2 Paleta [PROPUESTA]
| Token | Uso | Valor orientativo |
|---|---|---|
| `--hp-black` | Fondo principal | #0A0B0D |
| `--hp-graphite` | Superficies, bloques | #16181C / #22252B |
| `--hp-court` | Azul pista (acentos, escenas) | #1E5BD8 aprox. (ajustar al azul real de pista) |
| `--hp-ball` | Amarillo fluorescente (CTA, datos clave) | #D7FF1E aprox. |
| `--hp-ink` | Texto | #F2F3F5 / gris #9AA0A8 |

Regla: el amarillo es escaso y significa "acción" (CTA, precio, bola). Si todo es amarillo, nada lo es.

### 5.3 Tipografía [PROPUESTA]
- Titulares: grotesca condensada y pesada en mayúsculas (familias libres en Google Fonts como Anton, Oswald o "Archivo" en su corte expandido/condensado; elegir tras prueba visual). Tamaños muy grandes (hasta ~12vw en móvil).
- Texto y UI: una sans legible (Inter o similar) para formularios y textos largos.
- Cifras: tabulares, para precios y horarios.
- Ambas autoalojadas (sin coste, sin peticiones a terceros).

### 5.4 Producto
- **[PENDIENTE]** Color, materiales y forma reales de la máquina y del recogebolas. Pediste "negro/grafito si es compatible con el diseño real": no lo asumo. Necesito fotos reales (o CAD/3D) antes de generar nada.
- Prompt base para la cadena (borrador): "cinematic night padel court, deep blue court surface, glass walls with reflections, high-contrast stadium lighting, graphite and black tones, fluorescent yellow padel balls, photoreal, shallow depth of field, 35 mm". **Sustituye** el estilo por defecto de la skill (diorama low-poly de arcilla), que no encaja con la marca.

### 5.5 Copy: evaluación y propuestas [PROPUESTA]
| Mensaje | Valoración | Propuesta |
|---|---|---|
| Tu entrenamiento. Tu ritmo. Tu pista. | El mejor. Ritmo de tres, propio, memorable. | Mantener como claim principal. |
| No esperes a tu compañero. Entrena. | Muy bueno: nombra el problema real (depender de otros). | Mantener en escena 2. |
| 100 bolas. Un objetivo. Repetir hasta dominarlo. | Concreto, pero "100" puede leerse como capacidad de la máquina (no confirmada). | Evitar la cifra hasta confirmar capacidad. Alternativa: "Repite. Mejora. Domina." |
| Menos tiempo recogiendo. Más tiempo entrenando. | Claro y útil para el recogebolas. | Mantener. |
| Tu pista. Tu ritmo. Hammer Padel. | Repite el claim principal desordenado. | Descartar o usar solo como firma de pie de página. |
| (nuevo) "Sin compañero. Sin excusas." | Corto, agresivo-elegante. | Opción para anuncios o escena 2. |
| (nuevo) "Pruébala por 25 €." | Baja la barrera de entrada del alquiler. | CTA secundario en escena 5 y en `/comprar` ("¿Dudas? Pruébala por 25 €"). |
| (nuevo) "Golpe a golpe." | Refuerza repetición. | Titular de `/entrenamientos`. |

Idea con valor comercial: **el alquiler como prueba de compra**. En `/comprar` un bloque "Pruébala antes: 25 € / 90 min" lleva a `/alquiler`. (Un descuento del alquiler sobre la compra sería una promoción: **no** se implementa sin tu aprobación.)

---

## 6. Arquitectura frontend

### 6.1 Estructura de carpetas [PROPUESTA]
```
src/
  app/
    (marketing)/page.tsx            # landing
    (marketing)/comprar/page.tsx
    (marketing)/recogebolas/page.tsx
    (marketing)/alquiler/page.tsx
    ... resto de páginas
    api/availability/route.ts
    api/bookings/route.ts
  components/
    scroll-world/ScrollWorld.tsx    # wrapper cliente (dynamic import, ssr:false)
    scroll-world/scrub-engine.js    # motor de la skill
    scroll-world/SceneOverlay.tsx   # textos y CTA en HTML
    booking/BookingFlow.tsx         # 4 pasos
    commerce/ProductHero.tsx, PriceTag.tsx, BuyButton.tsx
    ui/                             # botones, campos, tipografía propios
  content/
    products.ts                     # fuente única de precios/textos [CONFIRMADO]
    scenes.ts                       # configuración del Scroll World
    locations.ts                    # semilla de localidades
  lib/db/, lib/booking/, lib/seo/
public/media/scroll-world/{desktop,mobile}/  # (o CDN de assets)
```

### 6.2 Cómo encaja Scroll World en la landing
1. El servidor entrega el HTML completo de `/`: las 6 escenas como `<section>` con su `<h2>`, texto, CTA y una imagen still (`<picture>` AVIF/WebP).
2. Tras el evento `load` y en tiempo de inactividad, el componente cliente decide si activar el vídeo (§7.3). Si sí, monta el motor encima de esas mismas secciones: el HTML pasa a ser la capa de texto superpuesta.
3. Si no, la página queda como una landing estática editorial con stills grandes: igual de navegable y vendible.

Así **el contenido indexable y los CTA existen siempre**, y el JavaScript del Scroll World no está en el camino crítico.

### 6.3 Gestión de estado
Sin librerías globales. Estado local en el flujo de reserva; carrito (fase 2) en cookie firmada o en servidor. Precios **siempre** recalculados en servidor.

---

## 7. Estrategia desktop / mobile

### 7.1 Dos cadenas nativas [PROPUESTA]
- **Escritorio 16:9** (1080p) y **móvil 9:16** (720 px de ancho), cada una con sus propias imágenes, escenas y conectores. Composición pensada para vertical: producto centrado en el tercio inferior, aire arriba para el titular.
- Los textos HTML se maquetan aparte para cada formato (no se escalan).
- La skill ya selecciona clips móviles en pantallas ≤860 px o puntero táctil.

### 7.2 Diferencias de composición por escena (móvil)
| Escena | Escritorio | Móvil 9:16 |
|---|---|---|
| 1 | Pista completa en panorámica | Plano desde el fondo de pista, cristal vertical como marco |
| 2 | Jugador y máquina en el mismo plano | Alterna: primero la máquina disparando, luego la bola llegando al jugador |
| 3 | Giro alrededor del producto | Producto vertical, encuadre más cerrado |
| 4 | Suelo con bolas en panorámica | Picado cenital sobre las bolas |
| 5 | Costa en horizontal | Recorrido vertical sur-norte con los 4 puntos apilados |
| 6 | Máquina centrada | Máquina centrada, CTA en zona del pulgar |

### 7.3 Niveles de experiencia (degradación progresiva)
| Nivel | Cuándo | Qué ve el usuario |
|---|---|---|
| **Completo** | Dispositivo capaz, buena red, sin preferencia de reducir movimiento | Scroll World con vídeo |
| **Ligero** | Red lenta (`effectiveType` 3g o peor), `saveData`, poca memoria (`deviceMemory` ≤ 2) o pocos núcleos | Stills con transiciones CSS suaves, sin vídeo |
| **Reducido** | `prefers-reduced-motion: reduce` | Stills fijas, sin animaciones de scroll |
| **Básico** | Sin JavaScript, navegador antiguo o fallo de reproducción | HTML + imágenes, todo funcional |

**iOS Low Power Mode**: no se puede detectar directamente. Heurística [PROPUESTA]: antes de activar el motor, intentar `video.play()` de un clip mudo con `playsinline`; en modo ahorro iOS rechaza la promesa → se pasa a nivel Ligero. También se baja de nivel si se mide un frame rate bajo durante los primeros segundos de scroll.

Siempre: un botón visible "Ver sin animación" que fija el nivel Reducido (y se recuerda en `localStorage`).

---

## 8. Sistema de reservas

### 8.1 Flujo de usuario (4 pasos) [CONFIRMADO el flujo, PROPUESTA el detalle]
1. **Ubicación**: 4 botones grandes (Dénia, Ondara, La Xara, Pedreguer).
2. **Fecha**: tira de los próximos 14 días como botones (días sin disponibilidad deshabilitados con texto "Completo"). Evita calendarios emergentes poco accesibles en móvil.
3. **Horario**: lista de franjas de 90 min disponibles.
4. **Datos y confirmación**: nombre, email, teléfono, aceptación de condiciones → resumen "25 € · 90 min · Dénia · jueves 19/11 · 18:00–19:30" → Reservar (MVP sin pago online; pago en fase 2).

Toda la reserva en una sola página, sin animaciones, con el resumen siempre visible.

### 8.2 Modelo de datos [PROPUESTA]
```
locations           id, slug, name, municipality, region, active, notes
machines            id, serial, label, status (active|maintenance|retired)
machine_locations   machine_id, location_id, valid_from, valid_to     -- dónde está cada máquina y cuándo
rate_plans          id, name, duration_min (90), price_cents (2500), currency, valid_from/to, location_id?  -- precios y duraciones distintas
availability_rules  id, machine_id|location_id, weekday, start_time, end_time, slot_step_min, valid_from/to
blackouts           id, machine_id?, location_id?, period tstzrange, reason (maintenance|holiday|manual)
customers           id, name, email, phone, created_at
bookings            id, machine_id, location_id, customer_id, rate_plan_id, period tstzrange,
                    status (hold|pending|confirmed|cancelled|completed|no_show),
                    price_cents, hold_expires_at, rescheduled_from_id, created_at
booking_events      booking_id, type, payload, at                      -- historial (cancelaciones, reprogramaciones)
payments            id, booking_id|order_id, provider, provider_ref, amount_cents, status   -- fase 2
```

### 8.3 Regla "una máquina no puede reservarse dos veces"
Garantía en la propia base de datos, no solo en el código:
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE bookings ADD CONSTRAINT no_double_booking
  EXCLUDE USING gist (machine_id WITH =, period WITH &&)
  WHERE (status IN ('hold','pending','confirmed'));
```
Aunque dos personas pulsen "Reservar" a la vez, PostgreSQL rechaza la segunda. Se puede añadir un margen entre reservas (transporte, montaje) ampliando el rango guardado.

### 8.4 Cálculo de disponibilidad
Franjas = reglas de disponibilidad de las máquinas asignadas a esa ubicación − bloqueos − reservas activas. El usuario elige **ubicación y hora**; el sistema asigna la máquina libre automáticamente (el cliente no necesita saber qué unidad le toca).

### 8.5 Preparado para el futuro
- **Mantenimiento/bloqueos**: tabla `blackouts`.
- **Cancelaciones y reprogramaciones**: estados + `booking_events` + `rescheduled_from_id`.
- **Precios y duraciones distintas**: `rate_plans` (p. ej. 60 min, bonos, precio club).
- **Más localidades y máquinas**: altas en tablas, sin tocar código.
- **Reservas con pago**: estado `hold` con caducidad (p. ej. 15 min) mientras se paga.

### 8.6 [PENDIENTE] Decisiones de negocio que bloquean el detalle
- Modelo operativo: ¿quién lleva la máquina?, ¿en qué clubes o pistas?, ¿la pista la reserva el cliente aparte?
- Horarios de servicio y margen entre reservas.
- Número de máquinas de alquiler al inicio.
- Política de cancelación, fianza y responsabilidad por daños.

---

## 9. Ecommerce

### 9.1 Modelo de datos [PROPUESTA]
```
products        id, slug, name, type (machine|accessory|spare|pack), active
product_variants id, product_id, sku, name, price_cents, currency, tax_rate, stock_policy
                  -- Hammer Padel 249900 · Recogebolas 6500 [CONFIRMADO, IVA incluido: VERIFICAR]
bundles          bundle_id, variant_id, qty                -- packs (futuro)
coupons          code, type, value, valid_from/to, limits  -- futuro, sin activar
orders           id, customer_id, status, subtotal, discount, shipping, tax, total, currency
order_items      order_id, variant_id, qty, unit_price_cents
shipments        order_id, carrier, tracking, status       -- futuro
payments         (compartida con reservas)
```
Precios en céntimos y en una sola fuente (`content/products.ts` → BD). El servidor recalcula siempre el total.

### 9.2 Pasarela de pago: análisis (sin decidir) [VERIFICAR comisiones]
| Opción | A favor | En contra |
|---|---|---|
| **Stripe Checkout** | Sin cuota mensual, integración rápida, página de pago alojada (menos carga legal PCI), admite métodos como Klarna para pagar a plazos | Comisión por transacción; Bizum no nativo |
| **Redsys (TPV de tu banco)** | Comisiones normalmente negociables y bajas en España, admite **Bizum**, confianza del comprador español | Contrato con banco, integración más antigua y laboriosa |
| **PayPal** | Confianza, pago rápido | Comisiones más altas, no aporta mucho como único método |
| **Financiación (SeQura, Aplazame, Klarna)** | Muy relevante para un producto de 2.499 € | Coste por operación al comercio; requiere alta y aprobación |
| **Transferencia bancaria** | Coste cero, habitual en compras de clubes | Manual, confirmación lenta |

**Recomendación preliminar**: diseñar una capa `PaymentProvider` común para poder empezar con un proveedor y añadir otro. Decidir entre Stripe y Redsys según las condiciones que te ofrezca tu banco. **No se integra nada hasta tu decisión.**

### 9.3 [PENDIENTE] Antes de vender online
Gastos y plazos de envío, IVA y facturación, garantía, derecho de desistimiento (14 días), condiciones de venta, datos fiscales de la empresa. Mientras tanto, el MVP puede usar "Solicitar compra" (formulario) en lugar de pago.

---

## 10. SEO

### 10.1 Estructura de contenidos [PROPUESTA]
| Página | Intención de búsqueda principal | H1 orientativo |
|---|---|---|
| `/` | Hammer Padel (marca) | Hammer Padel. Tu entrenamiento. Tu ritmo. Tu pista. |
| `/comprar` | máquina lanzapelotas pádel · máquina entrenamiento pádel | Máquina lanzapelotas de pádel Hammer Padel |
| `/recogebolas` | recogebolas pádel | Recogebolas Hammer |
| `/alquiler` | alquiler máquina pádel + 4 localidades | Alquiler de máquina lanzapelotas de pádel en la Marina Alta |
| `/entrenamientos` | entrenamiento individual pádel | Entrenamientos de pádel con máquina |

### 10.2 Localidades sin páginas duplicadas
- **Fase 1**: una sola `/alquiler` con una sección por localidad (`<h2>Alquiler de máquina de pádel en Dénia</h2>` + información real de esa zona).
- **Más adelante**: `/alquiler/denia`, etc., **solo** cuando cada una tenga contenido propio (clubes concretos, horarios, cómo se entrega). Cuatro páginas iguales cambiando el nombre del pueblo serían contenido duplicado.

### 10.3 Técnica
- Metadatos únicos por página, `canonical`, `sitemap.xml`, `robots.txt`, Open Graph con stills de Scroll World.
- Datos estructurados: `Organization`, `Product` + `Offer` (2.499 € / 65 €, EUR), `Service` de alquiler con `areaServed` = las 4 localidades (no `LocalBusiness` con dirección mientras no haya instalación propia), `FAQPage` donde haya FAQ real, `BreadcrumbList`.
- En la landing, el texto de cada escena es HTML real; además un bloque final "Qué es Hammer Padel" con texto útil (no relleno).
- Idiomas: español por defecto en la raíz; estructura preparada para `/en/` (y otros) con `hreflang`. Sugerencia: el inglés tiene sentido pronto en Dénia por la población residente extranjera; el valenciano es otra opción a valorar.
- Sin keyword stuffing: cada término aparece donde aporta información.

---

## 11. Performance

### 11.1 Objetivos [PROPUESTA]
LCP < 2,5 s · INP < 200 ms · CLS < 0,1 (percentil 75, móvil). Páginas comerciales: LCP < 1,5 s.

### 11.2 Estrategia de carga del Scroll World
1. **LCP = still de la escena 1** (AVIF/WebP, `fetchpriority="high"`, tamaño según dispositivo). Nunca un vídeo.
2. **Cero vídeo en la carga inicial**: el motor y los clips se piden tras `load` + `requestIdleCallback`, y solo en nivel Completo.
3. **Carga por proximidad**: se descarga el clip de la escena actual y la siguiente; el resto, a medida que se avanza. (La skill descarga cada clip como Blob; lo mantenemos pero por escena, no todo de golpe.)
4. **Pósters** por escena como fallback instantáneo.
5. **Formatos**: MP4 H.264 sin audio, `+faststart`, GOP corto (8 en escritorio, 4 en móvil, según la skill) para que el scrub sea fluido. H.264 por compatibilidad universal; AV1/HEVC solo si las pruebas lo justifican.
6. **Presupuesto de peso** [PROPUESTA]: según la skill, un clip de 8 s a 1080p ronda ~8 MB. 11 clips de escritorio serían ~60–80 MB en total; por eso la carga progresiva es obligatoria. Objetivo móvil: < 3 MB por clip a 720p y < 25 MB por recorrido completo; revisar tras el primer borrador.
7. **Reducción por dispositivo**: niveles de §7.3.
8. **Caché**: activos con nombre versionado y `Cache-Control: immutable`.
9. **Fuentes** autoalojadas con `font-display: swap` y subset latino.
10. **Medición**: Lighthouse en CI y Web Vitals de usuarios reales (sin servicio de pago; con la librería `web-vitals` hacia un endpoint propio o la analítica del hosting).

---

## 12. Accesibilidad

Objetivo: **WCAG 2.2 nivel AA** [PROPUESTA].
- Todo el texto y los CTA del Scroll World son HTML real; los vídeos son decorativos (`aria-hidden`, sin audio).
- Enlace "Saltar al contenido / a la reserva" al principio de la landing, y botón "Ver sin animación".
- `prefers-reduced-motion` respetado (nivel Reducido).
- Navegación completa con teclado y foco visible (amarillo sobre negro: contraste muy alto). Cuidado inverso: **nunca** texto amarillo sobre fondo claro.
- Contraste de texto gris sobre grafito ≥ 4,5:1.
- Formulario de reserva: etiquetas reales, errores en texto asociados al campo, botones de fecha/hora con estado anunciado (`aria-pressed`), área táctil ≥ 44 px.
- `lang="es"`, jerarquía de encabezados correcta, textos alternativos descriptivos en stills de producto.
- Pruebas: axe automatizado + revisión manual con VoiceOver (iOS) y TalkBack (Android).

---

## 13. Dependencias externas necesarias

| Dependencia | Para qué | Coste | Estado |
|---|---|---|---|
| Next.js 16, React 19, TypeScript | Base del sitio | Gratis (open source) | En uso |
| Scroll Craft 0.3.1 (MIT) | Motor de animación por scroll | Gratis | En uso, vendorizado |
| Geist y Archivo (OFL) vía npm | Tipografías autoalojadas | Gratis | En uso |
| Vitest, Playwright, axe-core, ESLint | Pruebas y calidad | Gratis | En uso (desarrollo) |
| Blender | Renders futuros de pista y producto | Gratis | Fase 2 |
| ffmpeg | Codificar clips para scrub | Gratis | Fase 2 |
| Fotografía real del producto | Producto fiel | Según fotógrafo | Pendiente de Xavi |
| Hosting, base de datos, email, pasarela, dominio | Publicación y operación | Ver §14 | **No contratados**, fase posterior |

## 14. Servicios que implican coste

Ninguno en Fase 1. Para publicar (con aprobación) habrá que decidir: hosting con uso comercial, base de datos de producción, email transaccional, pasarela de pago y dominio (análisis en §9.2 y v0.1). La generación de vídeo con IA de pago queda **descartada** como dependencia.

## 15. Producción audiovisual: Blender y fotografía real

Sustituye a la estimación de generaciones de pago de la v0.1.

| Escena | Recurso provisional (Fase 1, gratis) | Recurso definitivo (Fase 2) |
|---|---|---|
| 1 La pista | Pista esquemática SVG en perspectiva, focos que se encienden | Render Blender por capas (fondo, pista, cristal, primer plano) para `parallax`/`pin`, o foto nocturna real de una pista con permiso |
| 2 Entrenamiento | Pista SVG + trazas de bola dibujadas por el scroll | Mismas trazas sobre una foto o render de pista; opcional vídeo real de sesión con jugador a contraluz |
| 3 Producto | Hueco "fotografía real pendiente" | Fotografía de estudio sobre fondo grafito, o render Blender **a partir de CAD/medidas reales** |
| 4 Recogebolas | Hueco + bolas | Fotografía real del recogebolas en pista |
| 5 Alquiler | Clip esquemático pista → mapa (Chrome + ffmpeg, local) | Clip Blender con la misma cámara, mapa estilizado |
| 6 Reserva | Tipografía | Plano fijo de la máquina en pista |

Requisitos para la Fase 2: fotos/CAD/medidas reales, decidir si renderiza alguien del equipo o un freelance, y codificar con los parámetros de scrub de Scroll Craft (GOP denso, sin audio, versión 9:16 propia).

## 16. Riesgos técnicos

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| 1 | **La IA no reproduce fielmente la máquina real** (forma, logos, detalles). Es el riesgo principal. | Alto: los renders deben respetar el diseño real. | Usar fotos/CAD reales como imagen de referencia; mantener el producto pequeño o en contraluz en escenas dinámicas; escena 3 a partir de fotografía o render 3D real; prueba de viabilidad antes de gastar más. |
| 2 | Humanos jugando al pádel con biomecánica o manos raras | Medio: resta credibilidad | Jugador en silueta/contraluz, planos medios, sin primeros planos de manos y cara. |
| 3 | Física de la bola poco creíble | Medio | Trazas de luz estilizadas en vez de bola "realista"; cortes en el momento del golpe. |
| 4 | Saltos visibles entre escenas ("pop") | Medio | Reglas de la skill: conectores desde fotogramas reales, un único modelo; crossfade como último recurso. |
| 5 | Peso de vídeo en móvil y consumo de datos | Alto | Carga por proximidad, 720p, niveles de degradación, nada en la carga inicial. |
| 6 | iOS (Low Power Mode, autoplay, memoria con Blobs grandes) | Medio | Heurística de `play()`, liberar Blobs de escenas lejanas, pruebas en iPhone reales. |
| 7 | Scroll "secuestrado" que frustra al usuario | Medio | No bloquear el scroll nativo; barra fija con CTA; botón "Ver sin animación"; recorrido de ~6 pantallas como máximo. |
| 8 | Dobles reservas | Alto | Restricción de exclusión en PostgreSQL + `hold` con caducidad. |
| 9 | Zona horaria y cambio de hora | Medio | Guardar en UTC (`timestamptz`), mostrar en `Europe/Madrid`, tests en fechas de cambio de hora. |
| 10 | Precios de proveedores IA cambiantes, URLs de salida que caducan en 24–48 h (Monid) | Bajo | Re-verificar antes de generar; descargar y versionar los recursos al momento. |
| 11 | Filtros de contenido del modelo de vídeo | Bajo | Presupuesto de repeticiones; Kling como alternativa. |
| 12 | Hosting gratuito no apto para uso comercial / BD que se pausa | Medio | Decidir plan antes de producción (§14). |
| 13 | Aspectos legales (RGPD, cookies, LSSI, condiciones) | Alto si se ignora | Textos legales revisados antes de abrir reservas o ventas. |

---

## 17. Fases de implementación

### Fase 0 — Decisiones (ahora)
Aprobación de este documento y respuesta a los [PENDIENTE] (ver al final).

### Fase 1 — Base, identidad, catálogo y alquiler (sin coste)
1. Proyecto Next.js + TypeScript, tokens de diseño, tipografías, componentes UI propios.
2. Landing en versión estática premium (stills provisionales o fotos reales, mismas secciones que el Scroll World) — ya es la versión "fallback" definitiva.
3. `/comprar`, `/recogebolas`, `/como-funciona` (con documentación real), `/clubes`, `/soporte`, `/contacto`, legales.
4. Modelo de datos de reservas + `/alquiler` con disponibilidad real y reserva sin pago.
5. SEO técnico, accesibilidad, medición de rendimiento.
6. Verificación: Lighthouse, axe, pruebas de reservas concurrentes, pruebas en iOS y Android.

### Fase 2 — Scroll World, pagos y ecommerce (con tu autorización de gasto)
1. Instalar skill, prueba de viabilidad (§15.3), cadena borrador, cadenas finales.
2. Integración del motor con niveles de degradación.
3. Decisión de pasarela → checkout de productos y pago de reservas.
4. Panel interno mínimo para gestionar reservas, bloqueos y mantenimiento.

### Fase 3 — Crecimiento
Portal de clientes y clubes, historial de alquileres, registro de máquinas y garantías, repuestos, packs, cupones, financiación, idiomas, páginas por localidad con contenido propio, promociones alquiler→compra (con tu aprobación).

---

## 18. Propuesta de primera versión (MVP)

**Objetivo**: una web publicable que ya presente la marca con calidad premium, enseñe los productos y capte reservas, **sin gastar en generación IA ni en pagos**.

Incluye:
- Landing con la estructura narrativa de las 6 escenas en versión estática (stills/fotos reales + tipografía grande + animaciones CSS ligeras). Cuando llegue el Scroll World, se monta encima sin rehacer nada.
- Páginas `/comprar` y `/recogebolas` con precio y botón **"Solicitar compra"** (formulario que os llega por email) en lugar de pago online.
- `/alquiler` con el flujo de 4 pasos. **v0.2:** en el prototipo no hay base de datos ni reservas reales; el paso 3 recoge una franja preferida y nada se envía. La lógica de disponibilidad (con traslados) está programada y probada, lista para conectarse a un backend cuando Xavi lo apruebe.
- `/contacto`, `/clubes` (formulario), legales, SEO técnico completo, accesibilidad AA, móvil primero.
- Coste mensual: 0 € en desarrollo; al publicar, el que elijas de hosting/BD (§14).

No incluye: vídeos Scroll World, pago online, cupones, financiación, cuentas de cliente.

### Lo que necesito de ti para empezar
1. **Aprobación** (o cambios) de este documento.
2. **Fotos reales, CAD o fichas** de la máquina y del recogebolas (color, materiales, formas). Sin ellas no puedo diseñar la escena 3 ni garantizar fidelidad.
3. **Modelo operativo del alquiler**: dónde se usa la máquina, quién la entrega, horarios, número de máquinas, política de cancelación.
4. ¿Tenéis **dominio**? ¿Preferencia de **hosting**?
5. ¿Aceptas el MVP con **"Solicitar compra"** y **reserva sin pago** hasta decidir pasarela?
6. Cuándo quieras, **autorización** para la prueba de viabilidad de Scroll World (< 5 USD).
