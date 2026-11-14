# Hammer Padel · web oficial (prototipo Fase 1)

Prototipo **local** de la web de Hammer Padel: Next.js 16 + TypeScript, animaciones con
[Scroll Craft](https://github.com/nateherkai/scroll-craft) (MIT). Sin pagos, sin reservas reales,
sin servicios externos y sin despliegue. El diseño completo está en [`docs/diseno-web.md`](docs/diseno-web.md).

## Ejecutarlo en Windows

Requisitos: [Node.js 22 LTS](https://nodejs.org) (mínimo 20.9) y [Git](https://git-scm.com/download/win).
Comandos para PowerShell.

### 1. Traer el código sin pisar trabajo previo

**Si `C:\Proyectos\HammerPadel` no existe:**

```powershell
git clone -b claude/project-thread-8jnf5b https://github.com/Xavidoctor/hammerpadel.git C:\Proyectos\HammerPadel
cd C:\Proyectos\HammerPadel
```

**Si la carpeta ya existe**, comprueba primero qué es:

```powershell
cd C:\Proyectos\HammerPadel
git remote -v      # debe mostrar github.com/Xavidoctor/hammerpadel
git status         # no debe haber cambios sin guardar
```

- Si es este repositorio y está limpio: `git fetch origin` y después `git switch claude/project-thread-8jnf5b`.
- Si tiene cambios sin guardar, guárdalos antes (`git stash` o un commit en otra rama).
- Si **no** es este repositorio o no es un repositorio git, no lo toques: clona en otra carpeta,
  por ejemplo `C:\Proyectos\HammerPadel-web`.

### 2. Instalar y arrancar

```powershell
npm ci
npm run build
npm start
```

Abre http://localhost:3000. Para desarrollo con recarga en caliente: `npm run dev`.

### 3. Pruebas

```powershell
npm run lint
npm run typecheck
npm test                      # lógica de reservas (Vitest)
npx playwright install chromium   # solo la primera vez (descarga gratuita del navegador)
npm run build
npm run test:e2e              # páginas, accesibilidad (axe), sin JS, movimiento reducido
```

Capturas de escritorio y móvil (con el servidor arrancado en otra ventana):

```powershell
npm run shots -- http://localhost:3000 lab/capturas
```

## Formulario de contacto (envío gratuito)

El formulario de `/contacto` y `/clubes` lo envía el propio servidor de la web por SMTP,
con una cuenta de correo que ya tengas (por ejemplo, Gmail). No hay que contratar nada.

1. En tu cuenta de Google, activa la verificación en dos pasos y crea una
   «contraseña de aplicación» (Cuenta de Google → Seguridad → Contraseñas de aplicaciones).
2. Crea un archivo `.env.local` en la raíz del proyecto (no se sube a GitHub):

   ```
   CONTACTO_SMTP_USER=tu-cuenta@gmail.com
   CONTACTO_SMTP_PASS=la-contraseña-de-aplicación
   # Opcional: otra dirección que reciba los mensajes
   # CONTACTO_DESTINO=otra@direccion.com
   ```
3. Reinicia `npm run start`. Cada mensaje llega con «Responder a» apuntando al cliente.

Sin estas variables, el formulario no finge que envía: si en `src/content/contacto.ts` hay un
email público, ofrece abrir el correo del visitante con el mensaje ya escrito (mailto); si no, avisa
de que el envío aún no está activo. Incluye campo trampa contra bots y un límite de 5 envíos por IP
cada 10 minutos. Gmail permite unos 500 envíos al día, de sobra para un formulario de contacto.

## Estructura

```
src/app/                 páginas (/, /comprar, /recogebolas, /alquiler, /como-funciona, ...)
src/components/          cabecera, pie, hueco de producto, flujo de reserva, montaje de Scroll Craft
src/content/catalogo.ts  fuente única de precios y localidades [CONFIRMADO]
src/content/escenas.ts   las seis escenas (tres animadas en el prototipo)
src/lib/pista.ts         pista esquemática en perspectiva (escritorio y vertical)
src/lib/reservas/        modelo y disponibilidad con traslados (sin backend) + pruebas
src/vendor/scrollcraft/  motor Scroll Craft sin modificar, con LICENSE y SHA256SUMS
public/prototipo/        clip provisional del alquiler (generado en local, sin IA)
produccion/prototipo/    generador local de ese clip (Chrome + ffmpeg)
scrollcraft/             BRIEF y registro de la skill Scroll Craft
e2e/                     pruebas Playwright
```

## Reglas del prototipo

- Precios solo desde `src/content/catalogo.ts`. IVA pendiente de confirmar.
- Ninguna especificación técnica sin documentación oficial.
- Ningún horario se muestra como disponible sin reglas reales.
- No editar `src/vendor/scrollcraft`: se tematiza desde `src/app/globals.css`.
- `robots` en `noindex` mientras sea prototipo (`src/app/layout.tsx` y `src/app/robots.ts`).
