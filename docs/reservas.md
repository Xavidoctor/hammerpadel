# Sistema de reservas de alquiler

Propuesta completa (para Xavi): https://claude.ai/artifact/SSjZNpGgfb2ZwKEUF2GUBb

## Estado (14-11-2026)

Fase A: cálculo de disponibilidad real y `/alquiler` mostrando horas reales, **sin base de datos**: no se guardan reservas ni se envía nada.

| Dato | Valor | Estado |
|---|---|---|
| Sesión | 90 min, 20 € | Confirmado |
| Horario | inicio entre 8:00 y 20:30 | Confirmado |
| Flota | 5 máquinas | Confirmado |
| Repartidores | Xavi y Marc | Confirmado |
| Pago | efectivo en la sesión (online más adelante) | Confirmado |
| Montaje / recogida | 15 / 15 min | Propuesta |
| Trayecto mismo pueblo / entre pueblos | 10 / 20 min | Propuesta |
| Antelación mínima / días visibles / paso | 12 h / 14 / 30 min | Propuesta |
| Modo | deja la máquina y vuelve | Propuesta |

Todos los valores están en `src/lib/reservas/ajustes.ts`.

## Regla

Una hora se ofrece si hay una **máquina** libre durante su ciclo (montaje + sesión + recogida) y algún **repartidor** puede entregar y recoger sin dejar de llegar a sus otras tareas (trayectos incluidos).

## Piezas

- `src/lib/reservas/disponibilidad.ts`: `comprobarHora` (asigna máquina y repartidor; la usará también el servidor al grabar) y `horasLibres`.
- `src/lib/reservas/consulta.ts` + `GET /api/disponibilidad?localidad=…`: horas libres de los próximos días, sin exponer máquinas ni repartidores.
- `src/lib/reservas/repositorio.ts`: hoy, repositorio de prototipo (sin reservas). En la fase B, PostgreSQL.
- `db/esquema.sql`: esquema propuesto con la restricción `maquina_sin_solape`; se prueba en PostgreSQL embebido (`esquema.test.ts`).

## Siguiente (fase B, requiere aprobación de Xavi)

Base de datos gratuita (Neon propuesto), grabar reservas en transacción con bloqueo, aviso por Telegram, panel `/admin`, protección anti-abuso y textos de condiciones.
