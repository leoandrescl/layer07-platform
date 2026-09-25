<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# layer07-platform — reglas de proyecto

## Stack (verifícalo; no asumas otra versión)
- Next.js 16.3.3 (App Router, Turbopack) + React 19.2.8 + TypeScript 5.9 (`strict`).
- Tailwind CSS v4 con tokens en `src/app/globals.css` (no hay `tailwind.config`).
- three + postprocessing + gsap + lenis · react-hook-form + zod + resend.
- npm. Contenido en `src/lib/content/*`, i18n en `src/lib/i18n/*`. Sin CMS.

## Comandos exactos
- dev: `npm run dev`
- build (incluye typecheck): `npm run build`
- lint: `npm run lint` (debe pasar sin warnings)
- typecheck: `npm run typecheck` (`tsc --noEmit`)
- test: `npm test` (Vitest); tests junto al módulo (`*.test.ts`)
- format: no configurado

## Dónde va cada archivo
- Ruta/página: `src/app/[lang]/<ruta>/page.tsx` (+ `generateMetadata`). Nada fuera de `[lang]` salvo `lab/` y `api/`.
- Componente reutilizable: `src/components/ui/`; por dominio: `components/{home,layout,work,contact,theme,hero,lab}/`.
- Lógica/helpers: `src/lib/`; contenido: `src/lib/content/`; copy: diccionarios `es.ts`/`en.ts`.
- Endpoint: `src/app/api/<name>/route.ts`. Redirects/idioma: `src/proxy.ts`.
- No toques `archive/` ni la carpeta fantasma `src/app/(marketing)/`.

## Convenciones de código
- Componentes: archivo y export en **PascalCase** (`SectionHeading.tsx`). Helpers/módulos no-componente en **kebab-case** (`button-fx.tsx`, `hero-shaders.ts`).
- Server Components por defecto; `"use client"` solo si hay hooks, eventos o WebGL.
- Imports con alias `@/...`; orden: externos → `@/` → relativos.
- Tipos explícitos. Prohibido `any`, `@ts-ignore` y casts sin justificar. Usa `type`, no `interface`.
- Errores: nunca fallos silenciosos. Entrada de API validada con Zod en servidor; en cliente `try/catch` con estado explícito (loading/error/empty). No dejes `catch {}` vacío.
- Sin `console.log` de depuración. En servidor solo `console.info/warn/error` con prefijo `[área]`.
- Estilos con tokens (`text-ink`, `bg-surface`, `border-line`, `var(--accent)`). No hardcodees hex ni `#fff`. Nada de px fijos para layout.
- Todo texto de UI va en **ambos** diccionarios; `en.ts` debe satisfacer `Dictionary` de `es.ts`.
- Enlaces internos siempre con idioma: `/${locale}/...` (nunca `href="/..."`).

## UI / Responsive (OBLIGATORIO)
- **Mobile-first**: diseña primero a 360px y escala con `sm/md/lg/xl`.
- Breakpoints del proyecto: base <640 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.
- Prohibido ancho/alto fijo en px para layout; usa %, `fr`, `clamp()`, `svh/dvh`, `aspect-ratio`.
- Sin scroll horizontal: nada puede exceder el viewport a 360px (`overflow-x` limpio).
- Controles táctiles ≥44×44px efectivos (botones, nav, filtros, cerrar menú).
- Media responsiva (`max-w-full h-auto`, `next/image` si aplica); nunca desborda su contenedor.
- El texto no debe solaparse ni cortarse en ningún breakpoint.
- Verifica siempre a **360px y 768px** además de desktop, y con teclado + `prefers-reduced-motion`.
- El sitio funciona sin WebGL/motion: si el canvas no renderiza, muestra un fallback visible.

## Definition of Done
Antes de cerrar: `npm run lint`, `npm run typecheck` y `npm test` en verde; revisado a 360px, 768px y desktop; tema dark (y light si el componente depende de tokens de tema); foco visible, contraste y `aria` correctos; sin `console.log` ni código muerto; copy en ES y EN.
Detalle on-demand: skills `responsive-mobile`, `ui-design-system`, `code-standards`, `definition-of-done`.
