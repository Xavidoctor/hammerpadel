-- Hammer Padel · esquema de reservas de alquiler (PROPUESTA, fase B).
-- PostgreSQL 15+ (Neon, aprobado por Xavi el 14-11-2026). Se prueba en local
-- con PostgreSQL embebido (src/lib/reservas/*.test.ts). Aplicar una sola vez
-- en la base de datos nueva: psql "$DATABASE_URL" -f db/esquema.sql
-- Horas en timestamptz (UTC); la web las muestra en Europe/Madrid.

create extension if not exists btree_gist;

create table localidades (
  id      text primary key,            -- 'denia', 'ondara', 'el-verger', 'els-poblets', 'la-xara', 'pedreguer'
  nombre  text not null,
  activa  boolean not null default true
);

create table maquinas (
  id            text primary key,      -- 'hp-1' … 'hp-5'
  numero_serie  text unique,
  estado        text not null default 'activa' check (estado in ('activa', 'mantenimiento', 'baja'))
);

create table repartidores (
  id      text primary key,            -- 'xavi', 'marc'
  nombre  text not null,
  activo  boolean not null default true
);

-- Los ajustes (horario, montaje, trayectos, antelación, modo por localidad)
-- viven en src/lib/reservas/ajustes.ts: una sola fuente de verdad.

create table tarifas (
  id               text primary key,   -- 'sesion-90'
  duracion_min     int  not null check (duracion_min > 0),
  precio_centimos  int  not null check (precio_centimos >= 0),
  moneda           text not null default 'EUR',
  activa           boolean not null default true
);

-- Sin máquina ni repartidor = todo el servicio (festivo).
create table bloqueos (
  id             bigint generated always as identity primary key,
  maquina_id     text references maquinas,
  repartidor_id  text references repartidores,
  periodo        tstzrange not null check (not isempty(periodo)),
  motivo         text not null check (motivo in ('mantenimiento', 'festivo', 'manual')),
  nota           text
);
create index bloqueos_periodo on bloqueos using gist (periodo);

create table clientes (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  telefono  text not null,
  email     text not null,
  unique (telefono, email),
  creado    timestamptz not null default now()
);

create table reservas (
  id                  uuid primary key default gen_random_uuid(),
  cliente_id          uuid not null references clientes,
  localidad_id        text not null references localidades,
  pista               text not null,                 -- club, número de pista o dirección
  maquina_id          text not null references maquinas,
  repartidor_id       text not null references repartidores,
  tarifa_id           text not null references tarifas,
  sesion              tstzrange not null,            -- lo que reserva el cliente
  ciclo               tstzrange not null,            -- montaje + sesión + recogida
  estado              text not null default 'pendiente'  -- Xavi o Marc confirman a mano
                      check (estado in ('retenida', 'pendiente', 'confirmada', 'cancelada', 'completada', 'no_presentado')),
  precio_centimos     int  not null,                 -- calculado en el servidor
  forma_pago          text not null default 'efectivo' check (forma_pago in ('efectivo', 'online')),
  retenida_hasta      timestamptz,                   -- fase D: mientras se paga online
  reprogramada_desde  uuid references reservas,
  creada              timestamptz not null default now(),
  check (ciclo @> sesion),
  -- Garantía de la base de datos: una máquina nunca tiene dos ciclos solapados.
  constraint maquina_sin_solape exclude using gist (maquina_id with =, ciclo with &&)
    where (estado in ('retenida', 'pendiente', 'confirmada'))
);
create index reservas_sesion on reservas using gist (sesion);
create index reservas_estado on reservas (estado);

-- Los trayectos de los repartidores no se pueden expresar como restricción:
-- la web graba cada reserva dentro de una transacción con
-- pg_advisory_xact_lock(…) y repite comprobarHora() antes de insertar.

create table historial_reservas (
  id          bigint generated always as identity primary key,
  reserva_id  uuid not null references reservas on delete cascade,
  tipo        text not null,                         -- creada, cancelada, reprogramada…
  datos       jsonb,
  en          timestamptz not null default now()
);

-- Datos iniciales [CONFIRMADOS por Xavi].
insert into localidades (id, nombre) values
  ('pedreguer', 'Pedreguer'), ('ondara', 'Ondara'), ('el-verger', 'El Verger'),
  ('els-poblets', 'Els Poblets'), ('la-xara', 'La Xara'), ('denia', 'Dénia');
insert into maquinas (id) values ('hp-1'), ('hp-2'), ('hp-3'), ('hp-4'), ('hp-5');
insert into repartidores (id, nombre) values ('xavi', 'Xavi'), ('marc', 'Marc');
insert into tarifas (id, duracion_min, precio_centimos) values ('sesion-90', 90, 2500);

