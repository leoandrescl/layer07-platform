---
name: responsive-mobile
description: Checklist de responsive y mobile-first para layer07. Úsala al crear o editar cualquier page/componente, al revisar layout, o cuando aparezcan keywords como "responsive", "mobile", "360px", "768px", "breakpoint", "overflow horizontal", "scroll lateral", "táctil", "touch target", "no se ve bien en celular", "se corta el texto".
---

# Responsive y mobile-first

Regla base (también en AGENTS.md): parte de 360px, escala con `sm/md/lg/xl`, nada de px fijos de layout, sin scroll horizontal, táctil ≥44px. Aquí está el cómo.

## Breakpoints del proyecto

| Token | Ancho | Uso |
| --- | --- | --- |
| base | < 640px | diseño móvil por defecto (sin prefijo) |
| `sm` | ≥ 640px | 2 columnas simples |
| `md` | ≥ 768px | tablet; suele activar CTAs y grids |
| `lg` | ≥ 1024px | nav completa, layouts asimétricos |
| `xl` | ≥ 1280px | refinamientos, no layout nuevo |

`clamp()` permitido para tipografía/espaciado fluido (`clamp(1.25rem, 5vw, 5rem)` como `.shell`). Evita `max-w-[Npx]` para bloques de layout.

## Checklist paso a paso

1. **Lee el layout a 360px en el código**: ¿el grid base es 1 columna? ¿los `flex` hacen wrap?
2. **Recorre de menor a mayor**: 360 → 768 → 1024 → 1440. No diseñes desktop y "encojas".
3. **Overflow**: en DevTools activa el resaltado y busca elementos que sobresalgan. Comprueba `document.documentElement.scrollWidth > innerWidth`.
4. **Táctiles**: mide botones/links de acción con DevTools. Si el área efectiva <44×44, añade padding o `min-h-11 min-w-11` (44px), sin romper el diseño.
5. **Texto**: ninguna etiqueta puede solaparse con la de al lado ni cortarse. Los `text-[0.5625rem]` (9px) y `text-[0.625rem]` (10px) son demasiado chicos para body/errores en móvil; resérvalos para metadatos no críticos.
6. **Media**: contenedores con `aspect-ratio` + `overflow-hidden`; la imagen/video `max-w-full h-auto`.
7. **Motion/WebGL**: replica con `prefers-reduced-motion: reduce` y con WebGL desactivado; siempre debe quedar contenido visible.
8. **Teclado**: tabula todo el flujo móvil (nav → menú → formulario) y verifica que el foco no quede atrapado ni se pierda.

## Cómo probar cada breakpoint

- DevTools → Device Toolbar: añade presets exactos `360×800` y `768×1024`; usa también el responsive libre.
- Revisa en **zoom 200%** (equivale a ancho efectivo menor y detecta texto que se corta).
- `document.documentElement.scrollWidth > window.innerWidth` en consola debe ser `false` en cada ancho.
- `prefers-reduced-motion`: DevTools → Rendering → Emulate CSS media feature.
- Sin WebGL: DevTools → Rendering → WebGL deshabilitado, o bloquear el canvas.

## Errores típicos de este repo (a evitar)

- **Controles por debajo de 44px**: `Header.tsx` botón de menú `h-9` (36px), `ThemeToggle.tsx` `h-9 w-9`, chips de filtro en `WorkGrid.tsx` con `px-4 py-2`, enlaces de `LocaleSwitcher.tsx` sin padding. Al tocarlos, agranda el hit area.
- **Hero sin fallback**: `L07ParticleHero.tsx` retorna temprano si el tier es 0 / `prefers-reduced-motion` sin pintar nada; deja una franja negra. Cualquier hero nuevo debe mostrar un fallback visible (como el `lab-fallback-mark` de `ConstellationHero.tsx`).
- **Texto decorativo vertical** (`.hero-side`, `writing-mode: vertical-rl`): compruébalo a 360px para que no se solape con el copy central.
- **Marquee** (`Marquee.tsx`): el contenedor debe seguir siendo `overflow-hidden`; si lo cambias, genera scroll lateral global.
- **Metadatos de 9–11px** en `ProjectVisual.tsx`, `WorkPreview.tsx`, `Footer.tsx`: no los uses para información esencial.
- **Grids asimétricos**: los `lg:col-span-*` de `WorkPreview.tsx` y `lg:grid-cols-*` de las páginas no deben tener equivalente forzado en móvil; en base debe colapsar a 1 columna.

## Antipatrón vs correcto

```tsx
// ❌ ancho fijo y control chico
<div className="w-[420px]">
  <button className="h-9 px-3 text-[0.5625rem]">Menú</button>
</div>

// ✅ fluido y táctil
<div className="w-full max-w-md">
  <button className="inline-flex min-h-11 min-w-11 items-center px-4 text-[0.8125rem]">Menú</button>
</div>
```
