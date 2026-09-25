---
name: code-standards
description: Convenciones de código concretas de layer07 (estructura, patrones Next 16 App Router, tipos, imports, manejo de errores, i18n, naming) con ejemplos "correcto vs incorrecto" del repo. Úsala al escribir o revisar código, o con keywords como "convención", "naming", "cómo estructuro", "use client", "types", "any", "i18n", "dictionary", "manejo de errores", "lint", "imports", "server component".
---

# Convenciones de código layer07

Todo en AGENTS.md es obligatorio; esto añade el **cómo** con ejemplos reales del repo.

## Estructura y colocación

- Página localizada: `src/app/[lang]/<ruta>/page.tsx`. El layout raíz vive en `src/app/[lang]/layout.tsx` (renderiza `<html>/<body>`) — no crees otro root layout fuera de `lab/`.
- Componente reutilizable: `src/components/ui/`; por dominio en `components/{home,layout,work,contact,theme,hero,lab}/`.
- Helpers/lógica pura (sin JSX): `src/lib/` en **kebab-case** (`hero-shaders.ts`, `button-fx.tsx`). Componentes en **PascalCase** (`SectionHeading.tsx`).
- Contenido estático: `src/lib/content/`; copy de UI: `src/lib/i18n/es.ts` + `en.ts`.

## Patrones de Next 16 / React 19

- `params` es una **Promise** en páginas/layouts y `generateMetadata`:
  ```tsx
  // ❌ patrón viejo
  export default function Page({ params }: { params: { lang: string } }) { params.lang }
  // ✅
  export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
  }
  ```
- Valida el idioma siempre: `if (!hasLocale(lang)) notFound();` (patrón en todas las páginas).
- `"use client"` solo para hooks/eventos/WebGL. Los componentes de `ui/` que no usan hooks son server components (ej. `SectionHeading.tsx`), salvo `Button.tsx`/`button-fx.tsx` que sí lo necesitan.
- No repitas el root layout. El header/footer viven en `[lang]/layout.tsx`.

## Tipos

- `type` en vez de `interface`; sin `any`, `@ts-ignore` ni casts injustificados.
- Diccionario: `en.ts` se tipa contra `Dictionary` de `es.ts` (`export type Dictionary = typeof es`). Al añadir copy, añádelo a **ambos**.
- Contenido bilingüe con `Localized<T> = Record<Locale, T>` (ver `projects.ts`) y accede con `[locale]`.
- Reusa `Locale`/`locales` de `@/lib/i18n/config`; no escribas `"es" | "en"` suelto.

## Imports y utilidades

- Alias `@/...`; orden: externos → `@/` → relativos.
- Cada componente a su archivo (un export principal). Variantes de botón en `button-fx.tsx`, no en `Button.tsx`.
- Clases condicionales siempre con `cn()` de `@/lib/cn`, no concatenación manual.

## Manejo de errores / estado (nunca silencioso)

- En API: parsea con Zod y responde con status explícito (patrón `src/app/api/contact/route.ts`: 400 payload/JSON, 502 proveedor, 503 sin config).
  ```ts
  // ❌
  catch { return Response.json({ ok: true }) }
  // ✅
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  ```
- En cliente: `try/catch` con estado tipado (`idle | loading | success | error`). No dejes `catch {}` vacío sin comentario que lo justifique (ej. `ThemeProvider` documenta el caso de `localStorage`).
- Logging solo en servidor, con prefijo de área (`[contact]`). Cero `console.log` en front.

## i18n de enlaces

- Todo enlace interno lleva idioma: `/${locale}/...`. El bug a no repetir: `src/app/[lang]/not-found.tsx` usa `href="/"` y `href="/work"` (sin prefijo) y siempre el diccionario `defaultLocale`; un 404 en inglés queda en español. Usa `lang` del segmento y `/${lang}/...`.
- No hardcodees rutas: `NAV`/`localizedHref` están en `src/lib/site.ts`.

## Errores de convención detectados (no reintroducir)

- **Código muerto**: `data-field` y `.js .reveal` sin consumidor; `ThemeToggle`/`useTheme` sin usar. Si algo deja de usarse, elimínalo.
- **Hardcode de estilo**: `#fff`/hex en clases CSS (`.btn-outline:hover`); usa tokens.
- **Docs desincronizados**: mantén `docs/BRIEF.md` y `README.md` al día con la arquitectura real (la capa WebGL hoy es `layout/Cosmos.tsx` + heroes en `components/hero|lab`, no un `MaterialField`). Si un archivo deja de existir, actualiza la doc en el mismo cambio.
- **Carpetas fantasma**: `src/app/(marketing)/api/contact/` está vacía; la ruta real es `src/app/api/contact/route.ts`.

## Naming de archivos

```
✅ SectionHeading.tsx · ContactForm.tsx · WorkGrid.tsx   (componentes)
✅ button-fx.tsx · hero-shaders.ts · constellation.ts     (helpers)
❌ section-heading.tsx · contactForm.tsx
```

## Antes de dar por cerrado

`npm run lint` sin warnings y `npx tsc --noEmit` en verde.
