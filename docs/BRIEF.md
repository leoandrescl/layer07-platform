# layer07.cl — Brief de producto

Fuente de verdad para diseño, negocio y arquitectura. No re-pegar este documento en cada prompt: referenciarlo.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 (tokens en `src/app/globals.css`)
- Three.js (WebGL) + GSAP (animación y ScrollTrigger) + Lenis (smooth scroll)
- Resend + Zod + React Hook Form (formulario de contacto)
- Contenido en archivos (`src/lib/content/*`) — sin CMS

## Marca & perfil

- **Producto:** layer07.cl — estudio de producto digital de Leonardo Contreras
- **Perfil:** Senior Full Stack / Product Engineer, 8+ años end-to-end
- **Stack de referencia:** Next.js, React, TypeScript, PHP, WordPress/WooCommerce,
  Shopify, APIs, bases de datos, infraestructura cloud
- **Público:** pymes y negocios locales, emprendedores, artistas y marcas
  personales, empresas con sistemas a medida y agencias (white-label)

## Posicionamiento

El sitio debe comunicar **"este estudio puede construir algo así para mi
negocio"** y, a la vez, **"puede ejecutar proyectos técnicos complejos"**.
No es un portfolio de tecnologías: es un estudio de producto.

## Estética

**Editorial design + premium digital studio + WebGL + product engineering.**

- Tipografía grande, composición asimétrica, mucho aire, jerarquía estricta.
- Paleta muy controlada con un único acento (azul cobalto / señal).
- WebGL como **materia digital viva**: reacciona a cursor y scroll y evoluciona
  por sección. Nunca por encima del contenido; el sitio funciona sin él.
- Prohibido: Matrix/cyberpunk, terminales, dashboards falsos, mundos 3D,
  naves espaciales, exceso de partículas, efectos sobre el contenido.

### Temas

Dos temas con un mismo sistema de variables. Editorial Light por defecto y
Dark Premium con toggle global persistido en `localStorage`. El WebGL lee los
tokens en runtime y se adapta al tema.

| Token | Light | Dark |
| --- | --- | --- |
| bg | `#f3f0ea` | `#0a0a0c` |
| surface | `#ece8e0` | `#151519` |
| ink | `#0d0d0f` | `#f2efe9` |
| ink-muted | `#6e6e76` | `#8a8a92` |
| line | `rgba(13,13,15,.14)` | `rgba(242,239,233,.14)` |
| accent | `#1b2cff` | `#7a88ff` |

Tipografía: **Fraunces** (display serif editorial), **Inter** (texto/UI),
**Geist Mono** (etiquetas técnicas). Cargadas con `next/font/google`.

## Rutas

Todas las páginas viven bajo `src/app/[lang]/` (`es` | `en`).

1. `/[lang]` — Home (Hero, Work, Capabilities, Services, About, Agency, Contact)
2. `/[lang]/work` — Índice con filtros por categoría
3. `/[lang]/work/[slug]` — Caso de estudio (problema, construcción, interacción)
4. `/[lang]/services`
5. `/[lang]/about`
6. `/[lang]/agency` — Agencias / white-label
7. `/[lang]/contact`

### i18n

- `src/proxy.ts` detecta idioma (cookie `l07-locale` → `Accept-Language` →
  `es`), redirige a `/[lang]/...` y aplica los redirects legacy.
- Diccionarios tipados en `src/lib/i18n/es.ts` y `en.ts`.
- `src/lib/i18n/dictionaries.ts` expone `getDictionary(locale)`.

### Redirects legacy (308)

`/portafolio[/:slug]` → `/work[/:slug]` · `/servicios` → `/services` ·
`/nosotros` → `/about` · `/contacto` → `/contact` · `/seven`, `/neo`, `/labs`,
`/s/*`, `/particle-genesis`, `/particles-galaxy` → home.

## Contenido

- `src/lib/content/projects.ts` — 7 proyectos reales, bilingües y tipados.
- `src/lib/content/offerings.ts` — 4 líneas de servicio.
- Copy de UI en los diccionarios.

## WebGL

`src/components/webgl/MaterialField.tsx` — capa fija a pantalla completa.

- Shader de materia (domain warping + FBM) con iluminación y grano.
- Reactiva a cursor (`uMouse`), scroll (`uScroll`, `uVelocity`), tema (`uTheme`)
  y a la "mood" de cada sección (`[data-field]` + IntersectionObserver).
- Degradación por tiers (`src/lib/webgl/capability.ts`): tier 0 usa un fallback
  CSS estático (sin WebGL, `prefers-reduced-motion` o baja capacidad); tier 1
  baja resolución/30fps; tier 2 resolución y 60fps.
- Se pausa con `document.hidden` y ante pérdida de contexto.

## Hero — L07 en 3D interactivo

`src/components/hero/L07Hero.tsx` + `src/components/hero/glyphs.ts`.

El monograma **L07** construido en 3D con geometría propia (`Shape` +
`ExtrudeGeometry`, sin depender de fuentes externas). Cada glifo usa dos
materiales: **caras en tinta** y **cantos en acento**, de modo que al girar se
revelan los bordes de color. Referencia de vibra: tryand.co.

- **Composición centrada:** el monograma es el protagonista, con un stage
  16/9 (4/3 en móvil) que escala por aspecto (`fit`), así el encuadre nunca se
  rompe. Eyebrow arriba, lede y CTAs debajo. Glow de acento CSS detrás.
- **Interacción:** el cursor inclina el bloque en 3D, cada letra flota con fase
  propia, la letra bajo el puntero se acerca (raycast) y el clic lanza un pulso.
- **Entrada:** las letras crecen y se asientan con stagger; el copy hace fade.
- **Scroll:** el bloque se inclina hacia atrás, sube y se desvanece al salir el
  Hero (sin scroll-jack).
- **Render:** `three`, `RoomEnvironment` + `PMREMGenerator`, luces de borde
  fría/cálida y tone mapping ACES. Materiales que siguen los tokens del tema
  (caras = `--ink`, cantos = `--accent`) y se actualizan al cambiar de tema.
- **Degradación:** reusa `detectCapability`. Tier 1 sin antialias y con menos
  resolución; tier 0 / `prefers-reduced-motion` muestran el monograma en HTML
  (`.l07-fallback`) sin WebGL.
- **Handoff:** el `MaterialField` global se pausa mientras el Hero está activo
  (`src/lib/hero-state.ts`) y se reanuda al entrar en Work.

## Contacto

- Email: leoandrescl@gmail.com
- Tel/WhatsApp: +56945541859
- Ubicación: Santiago, Chile
- Redes: GitHub, LinkedIn (vía env)
- `/api/contact` con Resend; sin `RESEND_API_KEY` responde en dry-run.

## Variables de entorno

- `RESEND_API_KEY` / `RESEND_FROM` — envío real del formulario
- `NEXT_PUBLIC_GITHUB_URL` / `NEXT_PUBLIC_LINKEDIN_URL` — redes
- `NEXT_PUBLIC_SITE_URL` — URL canónica (sitemap / OG / JSON-LD)

## Legacy

La estética cyberpunk anterior vive en `archive/layer07-matrix/` (fuera del
build y del lint) y no se sirve en ninguna ruta.
