# Motor scroll-craft (copia sin modificar)

- Origen: https://github.com/nateherkai/scroll-craft
- Ruta original: `plugins/nateherk-design/skills/scroll-craft/engine/`
- Versión: 0.3.1, commit `75d81f74e83692add18cd7a8a8e078b8a887a579`
- Licencia: MIT, ver `LICENSE` (© 2026 Nate Herk). Se conserva tal cual.

**No editar `scrollcraft.js` ni `scrollcraft.css`.** Es la regla del propio motor:
se tematiza con tokens CSS (`src/app/globals.css`) y el comportamiento propio de
Hammer Padel va en el código de la página, leyendo `--sc-p`.

`SHA256SUMS` permite comprobar que los archivos siguen intactos:

```bash
cd src/vendor/scrollcraft && sha256sum -c SHA256SUMS
```

En Windows (PowerShell): `Get-FileHash scrollcraft.js -Algorithm SHA256`
y comparar con el valor de `SHA256SUMS`.
