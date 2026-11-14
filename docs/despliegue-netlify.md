# Publicar la web en Netlify

Guía para conectar el repositorio a Netlify (plan gratuito) y, más adelante,
el dominio propio. Nada de esto se ha hecho todavía: la cuenta, el proyecto y
el dominio los crea Xavi.

> Las contraseñas y claves **nunca** van en GitHub ni en el chat. Solo se
> escriben en Netlify, en *Environment variables*.

## 1. Qué hay ya preparado en el repositorio

- `netlify.toml`: orden de build (`npm run build`), carpeta `.next`, Node 22 y
  cabeceras de seguridad. El panel `/admin` se sirve sin caché y con `noindex`.
- Netlify detecta Next.js y añade solo su adaptador: las páginas estáticas van
  a su CDN y lo dinámico (`/admin`, `/api/disponibilidad`, `/api/reservas` y el
  envío del formulario de contacto) se convierte en funciones de Netlify. No
  hay que instalar ningún plugin.
- La dirección de la web para metadatos y `sitemap.xml` sale sola de Netlify
  (variable `URL`) o de `SITE_URL` cuando haya dominio.
- La web sigue marcada como **prototipo** (`noindex` y `robots.txt` cerrado):
  aunque esté publicada, Google no la indexa hasta que se apruebe la
  publicación definitiva.

**Comprobado (14-11-2026):** con el adaptador de Netlify, el build pasa en la
rama base, en la de reservas (PR #4) y en la de contenido/contacto (PR #5). Las
rutas de reservas, ejecutadas como función de Netlify contra un PostgreSQL de
prueba, consultan disponibilidad y graban reservas pendientes correctamente.

## 2. Plan gratuito: lo que hay que saber

Datos de la documentación de Netlify (noviembre de 2026):

- 300 créditos al mes, sin coste. Si se agotan **no se cobra nada**: la web se
  pausa (“Site not available”) hasta el mes siguiente o hasta cambiar de plan.
  Netlify avisa por email al 50 %, 75 %, 90 % y 100 %.
- Cada **publicación en producción cuesta 15 créditos** (unas 20 al mes como
  máximo). Las vistas previas de PR y las ramas de prueba no gastan créditos,
  ni los builds que fallan.
- Tráfico: 20 créditos por GB; peticiones: 2 créditos por cada 10.000;
  funciones: 10 créditos por GB-hora. La web pesa poco (unos 9 MB de imágenes y
  vídeo en total), así que para empezar sobra.
- Dominio propio con HTTPS incluido.

Consejo práctico: cada vez que se fusiona algo en la rama de producción, se
publica (15 créditos). Agrupa cambios antes de fusionarlos. Si un mes vas
justo, en *Project configuration → Build & deploy → Continuous deployment*
puedes pausar los builds (*Stop builds*) y reactivarlos después.

## 3. Conectar el repositorio (una vez)

1. Entra en <https://app.netlify.com/signup> y regístrate con **GitHub**
   (cuenta gratuita, plan *Free*).
2. *Add new project → Import an existing project → GitHub*.
3. Autoriza la app de Netlify solo para el repositorio
   `Xavidoctor/hammerpadel`.
4. **Branch to deploy:** mientras no se fusione nada en `main`, elige la rama
   del prototipo `claude/project-thread-8jnf5b`. Cuando el proyecto pase a
   `main`, se cambia en *Build & deploy → Branches and deploy contexts*.
5. La configuración de build se lee de `netlify.toml`: no cambies nada en
   *Build command* ni *Publish directory*.
6. Antes de pulsar *Deploy*, añade las variables del apartado 4 (o añádelas
   después y vuelve a publicar con *Deploys → Trigger deploy*).
7. Pulsa *Deploy*. En 2–3 minutos tendrás una dirección del tipo
   `https://nombre-que-elijas.netlify.app` (se puede cambiar en
   *Project configuration → General → Project name*, p. ej. `hammerpadel`).

Recomendable: en *Project configuration → Build & deploy → Functions* elige la
región **Frankfurt (eu-central-1)** si está disponible, para que las funciones
estén cerca de Neon y de los clientes.

## 4. Variables de entorno

Se ponen en *Project configuration → Environment variables → Add a variable*.
Marca **Contains secret values** en las que son secretas. Tras cambiar
cualquier variable hay que volver a publicar (*Deploys → Trigger deploy →
Deploy project*).

| Variable | Para qué | Secreta | Cuándo |
|---|---|---|---|
| `DATABASE_URL` | Base de datos de reservas (Neon). Usa la cadena **pooled** (el host lleva `-pooler`) y termina en `?sslmode=require`. | Sí | Al activar reservas (PR #4) |
| `ADMIN_PASSWORD` | Contraseña del panel `/admin` que compartís Xavi y Marc. **Mínimo 12 caracteres**; si es más corta, el panel no deja entrar. | Sí | Al activar reservas |
| `TELEGRAM_BOT_TOKEN` | Token del bot que avisa de reservas nuevas. | Sí | Al activar reservas |
| `TELEGRAM_CHAT_ID` | Chat o grupo donde llegan los avisos. | No | Al activar reservas |
| `CONTACTO_SMTP_USER` | Cuenta de Gmail que envía los mensajes del formulario de contacto. | No | Al activar contacto (PR #5) |
| `CONTACTO_SMTP_PASS` | **Contraseña de aplicación** de esa cuenta de Gmail (no la contraseña normal). | Sí | Al activar contacto |
| `CONTACTO_DESTINO` | Quién recibe los mensajes. Opcional: por defecto, la misma cuenta. | No | Opcional |
| `CONTACTO_SMTP_HOST` | Servidor SMTP. Opcional: por defecto `smtp.gmail.com`. | No | Opcional |
| `SITE_URL` | Dirección definitiva, p. ej. `https://hammerpadel.es`. | No | Al conectar el dominio |

Sin `DATABASE_URL` la web funciona en modo prototipo: muestra horarios pero
no guarda reservas. **En cuanto pongas `DATABASE_URL`, las reservas de la web
pública son reales** y os llegarán por Telegram.

Para la base de datos, ejecuta una vez `db/esquema.sql` en el *SQL Editor* de
Neon (está en la rama de reservas; ver `docs/reservas.md`).

## 5. Conectar un dominio (más adelante)

1. Compra el dominio (p. ej. `hammerpadel.es`, unos 10 €/año) en un registrador
   o directamente en Netlify (*Domains → Register a domain*).
2. En Netlify: *Project configuration → Domain management → Add a domain* y
   escribe `hammerpadel.es`. Netlify añadirá también `www.hammerpadel.es`.
3. Elige una de las dos formas de apuntarlo:
   - **Netlify DNS (lo más fácil):** acepta *Set up Netlify DNS* y copia en tu
     registrador los 4 servidores de nombres (`dns1.p0X.nsone.net`…) que te
     indique Netlify.
   - **Mantener el DNS del registrador:** crea un registro `A` para `@` hacia
     `75.2.60.5` y un `CNAME` para `www` hacia `tu-proyecto.netlify.app`.
     Comprueba los valores exactos en la pantalla de Netlify, que es la que
     manda.
4. Espera a que se propague (de minutos a 24 h). Netlify activa HTTPS solo
   (*Domain management → HTTPS*).
5. Añade `SITE_URL=https://hammerpadel.es` y vuelve a publicar.
6. Si usáis el bot de Telegram, el enlace al panel de los avisos usará ya el
   dominio nuevo.

## 6. Antes de abrir la web al público (pendiente de aprobación)

- Quitar el modo prototipo: `PROTOTIPO = false` en `src/app/layout.tsx` y abrir
  `src/app/robots.ts`. Así Google podrá indexarla.
- Textos legales definitivos (titular de la actividad, PR #3).
- Revisar que el formulario de contacto y las reservas funcionan en la
  dirección publicada.
