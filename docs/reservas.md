# Sistema de reservas de alquiler

Propuesta completa (para Xavi): https://claude.ai/artifact/SSjZNpGgfb2ZwKEUF2GUBb

## Estado (14-11-2026)

Fase B programada: con `DATABASE_URL` configurada, las reservas se graban como **pendientes**, llega un aviso por Telegram y Xavi o Marc las confirman en `/admin`. Sin `DATABASE_URL`, la web sigue en modo prototipo (muestra horas, no guarda nada).

| Dato | Valor | Estado |
|---|---|---|
| Sesión | 90 min, 25 € con 60 pelotas (desde el 14-11-2026; antes 20 €) | Confirmado |
| Horario | lunes a domingo, inicio entre 8:00 y 20:30 | Confirmado |
| Flota y repartidores | 5 máquinas; Xavi y Marc | Confirmado |
| Durante la sesión | se quedan en Ondara y Pedreguer; en Dénia y La Xara pueden irse y volver | Confirmado |
| Montaje / recogida | 3 / 3 min | Confirmado |
| Antelación mínima | 6 h | Confirmado |
| Confirmación | manual, por Xavi o Marc | Confirmado |
| Pelotas perdidas | 1 € por pelota | Confirmado |
| Pago | efectivo en la sesión (online más adelante) | Confirmado |
| Trayecto mismo pueblo / entre pueblos | 10 / 20 min | Confirmado |
| Días visibles / paso | 14 / 30 min | Propuesta |
| Cancelación y fianza | sin definir | Pendiente |

Todos los valores están en `src/lib/reservas/ajustes.ts` (precio en `src/content/catalogo.ts` y tabla `tarifas`).

## Regla

Una hora se ofrece si hay una **máquina** libre durante su ciclo (montaje + sesión + recogida) y algún **repartidor** puede entregar y recoger sin dejar de llegar a sus otras tareas (trayectos incluidos). En Ondara y Pedreguer el repartidor queda ocupado toda la sesión.

## Piezas

- `src/lib/reservas/disponibilidad.ts`: `comprobarHora` (asigna máquina y repartidor) y `horasLibres`.
- `GET /api/disponibilidad?localidad=…`: horas libres de los próximos días, sin exponer máquinas ni repartidores.
- `POST /api/reservas`: valida, vuelve a comprobar la hora dentro de una transacción con bloqueo y graba la reserva pendiente. Anti-abuso: campo trampa y máximo 2 reservas por cliente y día.
- `src/lib/reservas/postgres.ts`: lectura y escritura en PostgreSQL. `db/esquema.sql`: tablas y restricción `maquina_sin_solape`.
- `src/lib/avisos/telegram.ts`: aviso al grupo de Telegram.
- `/admin`: reservas de los próximos 30 días (confirmar, cancelar, hecha, no vino; llamar o WhatsApp con mensaje de confirmación) y bloqueos (festivos, días libres de un repartidor, mantenimiento de una máquina).

## Puesta en marcha (lo hace Xavi, una vez)

1. **Neon** (gratis): crear cuenta en neon.tech, un proyecto en la región de Frankfurt y copiar la cadena de conexión (`postgresql://…?sslmode=require`).
2. Crear las tablas: en el editor SQL de Neon, pegar y ejecutar `db/esquema.sql`.
3. **Telegram**: hablar con @BotFather → `/newbot` → copiar el token. Crear un grupo con Xavi, Marc y el bot, escribir algo en el grupo y obtener su id en `https://api.telegram.org/bot<TOKEN>/getUpdates` (campo `chat.id`, empieza por `-`).
4. Variables de entorno (en `.env.local` para probar en el PC, y en el alojamiento al publicar). **Nunca** se suben al repositorio:

```
DATABASE_URL=postgresql://…
ADMIN_PASSWORD=una-contraseña-larga-de-al-menos-12-caracteres
TELEGRAM_BOT_TOKEN=…
TELEGRAM_CHAT_ID=-100…
```

Antes de abrir reservas al público faltan: política de privacidad y condiciones de alquiler (cancelación, fianza, daños) y el alojamiento de la web.
