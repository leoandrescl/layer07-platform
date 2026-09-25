---
name: ui-design-system
description: Sistema de diseño de layer07 — tokens, tipografía, espaciado, radios y estados de cada componente (hover, focus, active, disabled, loading, error, empty). Úsala al crear o modificar componentes/estilos, o con keywords como "botón", "button", "token", "color", "tema dark", "tema claro", "hover", "focus", "disabled", "loading", "empty state", "consistencia visual", "se ve distinto al resto".
---

# Sistema de diseño layer07

Un solo sistema con dos temas. Los tokens viven en `src/app/globals.css` bajo `:root, [data-theme="light"]` y `[data-theme="dark"]`, y se exponen a Tailwind con `@theme inline`. No crees valores nuevos si existe un token.

## Tokens (fuente de verdad)

| Grupo | Detalle |
| --- | --- |
| Superficies | `bg`, `bg-elevated`, `surface`, `surface-strong` |
| Texto | `ink` (principal), `ink-soft` (cuerpo), `ink-muted` (metadatos) |
| Bordes | `line`, `line-strong` |
| Acento | `accent`, `accent-ink`, `accent-soft` (azul cobalto; señal única) |
| Material (WebGL) | `material-a/b/c`, `material-bg`, `material-contrast` |
| Tipos | `--font-display` (Fraunces), `--font-sans` (Inter), `--font-mono` (Geist Mono) |
| Easing | `--ease-out`, `--ease-in-out` |

Uso en Tailwind: `text-ink`, `text-ink-soft`, `bg-surface`, `border-line`, `text-accent`, `bg-accent-soft`. En CSS: `var(--accent)`. **Nunca** `#fff`, `#000` ni hex sueltos en componentes/estilos nuevos (hay deuda en `.btn-solid`/`.btn-outline`; no la amplíes).

Clases de composición existentes (reutilízalas, no las reimplementes): `.shell`, `.eyebrow`, `.display-xl/lg/md`, `.lede`, `.rule`, `.link-line`, `.btn` + `.btn-solid/outline/ghost`, `.grain`.

## Radios

Escala canónica (Tailwind, sin tokens extra): `rounded-full` para pills/chips/botones, `rounded-2xl` para tarjetas y paneles, `rounded-xl` para media/visuales, `rounded-md` para elementos internos pequeños. No introduzcas `rounded-lg`, `rounded-3xl` ni valores arbitrarios en piezas nuevas si encajan en la escala.

## Espaciado y ritmo

- Secciones: `py-24 md:py-32` (o `py-28 md:py-40` para CTAs grandes). Mantén el ritmo.
- Contenedor: `.shell` (max 90rem + padding fluido). No añadas tu propio `max-w-*` al contenedor raíz.
- Escala de gaps: 2 → 4 → 6 → 8 → 12 → 16. No inventes valores intermedios.

## Botones (variantes y estados)

`Button.tsx` + `button-fx.tsx` + clases `.btn*`. Variantes: `solid` (solo sobre superficies), `outline` (sobre el cosmos), `ghost` (texto).

| Estado | Requisito |
| --- | --- |
| hover | color/borde/glow; nunca salto de layout |
| focus-visible | anillo global (`:focus-visible` con `outline: 2px solid var(--accent)`); no lo elimines |
| active | `scale(0.96)` ya definido |
| disabled | `.btn:disabled` (opacity 0.55 + `cursor-not-allowed`); no dispares fx |
| loading | deshabilita y cambia el label (patrón `ContactForm.tsx`: `sending` / `status === "loading"`) |

## Estados obligatorios por componente

- **Cards/superficies** (`ServicesPreview`, `agency`, `about`): hover con cambio de superficie/borde, foco visible si son enlaces, y contenido que no cambia de tamaño al hover.
- **Formularios** (`ContactForm.tsx`): por campo → normal, focus (borde `accent`), error (`aria-invalid` + borde `accent` + mensaje). Global → `idle | loading | success | error`. **Falta** asociar el error con `aria-describedby` y anunciar el estado con `aria-live`; agrégalo al tocar el formulario.
- **Listas/filtros** (`WorkGrid.tsx`): activo (`bg-ink text-bg`), inactivo (borde `line`), hover (`line-strong`), y **empty state** (`dict.work.empty`) ya previsto.
- **Acordeón** (`Accordion.tsx`): cerrado/abierto con transición, icono rotado, `aria-expanded`/`aria-controls`.
- **Menú móvil** (`Header.tsx`): abierto/cerrado; al abrir, bloquea scroll del fondo y gestiona foco (hoy falta focus trap y foco inicial).

## Tema claro/oscuro

El código actual fuerza `data-theme="dark"` en `[lang]/layout.tsx`; `ThemeProvider`/`ThemeToggle` existen pero están huérfanos y el tema claro no se usa. Regla: cualquier componente nuevo debe verse correcto en **ambos** temas (probando con `data-theme="light"` en el `<html>`), sin depender de blancos/negros fijos. No re-actives el toggle sin revisar todos los tokens.

## Ejemplos

```tsx
// ❌ valores crudos y estado incompleto
<button className="rounded-lg bg-[#1b2cff] text-white">Enviar</button>

// ✅ tokens, radio y estados completos
<button
  disabled={loading}
  aria-busy={loading}
  className="btn btn-outline disabled:cursor-not-allowed"
>
  {loading ? t.sending : t.submit}
</button>
```
