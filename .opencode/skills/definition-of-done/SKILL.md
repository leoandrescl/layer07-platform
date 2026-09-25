---
name: definition-of-done
description: Validación final antes de dar por terminada cualquier tarea en layer07 (desktop + 360px/768px, dark/light si aplica, accesibilidad básica, lint/typecheck). Úsala al cerrar una feature, un fix de UI o un commit, o con keywords como "terminado", "done", "revisión final", "checklist", "antes de commitear", "QA", "accesibilidad", "lint".
---

# Definition of Done — layer07

No marques una tarea como terminada hasta completar esta lista. La regla corta está en AGENTS.md; aquí está cómo verificar cada punto.

## 1. Automático (obligatorio)

```bash
npm run lint        # sin errores ni warnings
npm run typecheck   # 0 errores de tipos (tsc --noEmit)
npm test            # Vitest en verde
npm run build       # opcional antes de cerrar, si el cambio es de estructura/rutas
```

Si alguno falla, no termines la tarea. `npm run build` incluye typecheck, pero ejecuta `npm run typecheck` igual para feedback rápido. Cualquier lógica nueva (helpers, contenido, validación) debería traer su `*.test.ts` junto al módulo.

## 2. Vistas y breakpoints

- **360px** (móvil real, no solo emulado): sin scroll horizontal, sin texto cortado/solapado, controles ≥44px.
- **768px** (tablet): grids y nav intermedios correctos.
- **Desktop** (≥1280px): composición asimétrica y `.shell` sin desbordes.
- Comprobación rápida en consola: `document.documentElement.scrollWidth <= window.innerWidth` debe ser `true` en cada ancho.
- Detalle completo en la skill `responsive-mobile`.

## 3. Tema

- El sitio renderiza en **dark** (forzado por layout). Si tu componente usa tokens de tema, pruébalo también con `data-theme="light"` en `<html>` y confirma que no hay colores fijos que rompan.
- Contraste legible en ambos: texto `ink-soft`/`ink-muted` sobre `bg`/`surface`.
- Detalle de tokens en la skill `ui-design-system`.

## 4. Accesibilidad básica

- **Foco visible**: tabula el componente; el anillo global (`outline: 2px solid var(--accent)`) no debe quedar oculto.
- **Teclado**: Enter/Espacio activan botones y enlaces; Escape cierra el menú móvil; el foco no se pierde al abrir/cerrar overlays (hoy el menú no atrapa foco — soluciónalo si lo tocas).
- **ARIA**: elementos decorativos con `aria-hidden`; interactivos con nombre accesible (`aria-label` o texto). Botones de estado con `aria-pressed`/`aria-expanded`/`aria-current` según correspondan.
- **Formularios**: cada error asociado al campo (`aria-describedby`) y estados anunciados (`aria-live`); `aria-invalid` en error. Hoy falta en `ContactForm.tsx`.
- **Imágenes/SVG**: decorativos `aria-hidden`; con significado, con texto alternativo o `<title>`.
- **Motion**: respeta `prefers-reduced-motion` (no animaciones esenciales).

## 5. Contenido

- Todo texto nuevo está en `es.ts` **y** `en.ts`, y `en.ts` sigue satisfaciendo `Dictionary`.
- Enlaces internos con `/${locale}/...`.
- Sin `console.log` de depuración ni código muerto (props/estados/imports sin usar).
- Sin secretos ni claves en el código (usa `.env.local` / Vercel).

## 6. Fallback WebGL/motion

- Con WebGL deshabilitado o `prefers-reduced-motion`, la página sigue mostrando contenido visible (no una franja negra). Revisa los heroes: `L07ParticleHero.tsx` hoy no pinta fallback.

## Checklist para copiar

```
[ ] npm run lint                en verde
[ ] npm run typecheck           en verde
[ ] npm test                    en verde
[ ] 360px                       sin overflow, texto entero, táctil ≥44px
[ ] 768px                       grid/nav correctos
[ ] Desktop                     composición y .shell ok
[ ] Dark (y light si toca)      contraste y tokens
[ ] Foco visible + teclado      tab/escape ok
[ ] aria en interactivos        labels/roles/estados
[ ] Errores de form asociados   aria-describedby / aria-live
[ ] Copy ES + EN                diccionarios completos
[ ] Sin console.log/dead code   revisado
[ ] Fallback sin WebGL          contenido visible
```

Si algún punto no aplica (p. ej. no hay imágenes), márcalo como N/A en lugar de omitirlo.
