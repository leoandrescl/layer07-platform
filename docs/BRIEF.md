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

## Hero — L07 de partículas

`src/components/hero/L07ParticleHero.tsx` + `glyphs.ts` + `particles.ts` +
`hero-shaders.ts`.

El monograma **L07 formado por partículas** que fluyen y se alimentan de forma
continua (técnica portada de `particles-galaxy`: posiciones calculadas en el
vertex shader, sin trabajo por frame en CPU). Referencias: tryand.co (3D en el
hero) y el campo de partículas de la página de OpenAI.

- **Secuencia de carga:** primero el starfield sobre negro absoluto (ss1);
  luego las partículas se agrupan (ss2) y finalmente forman el L07 (ss3).
  Controlado con `uReveal` (starfield) y `uIntro` (convergencia) en el tiempo.
- **Las letras:** logotipo fino y refinado (trazo 0.15, "0" ovalado, "7"
  afilado) definido con `Shape` (sin fuentes) y muestreado con
  `ShapeUtils.triangulateShape` + muestreo baricéntrico por área. Cada partícula
  nace en uno de los **3 brazos** y viaja por un espiral logarítmico (su "cola")
  hasta asentarse en la letra y mantenerse; al reciclarse la cola se alimenta de
  nuevas partículas de forma continua.
- **Full-bleed:** el canvas cubre todo el Hero (sin caja), con scrims superior e
  inferior para la legibilidad del copy. Starfield denso (blanco/azul/ámbar) que
  llena todo el espacio, con deriva muy lenta y twinkle.
- **Interacción:** el cursor repele las partículas (fuerza en espacio mundo),
  inclina el bloque y el clic aumenta la fuerza.
- **Escenario negro absoluto** en ambos temas; el header se invierte mientras el
  Hero está activo (`[data-hero="active"] .site-header`).
- **Render:** `three` (additive glow sprites: núcleo + halo), y en tier 2
  `postprocessing` con Bloom + viñeta + grano. Tone mapping ACES. Escala por
  aspecto (`fit`) para que el encuadre nunca se rompa.
- **Scroll:** el bloque se inclina, sube y se desvanece al salir el Hero (sin
  scroll-jack).
- **Degradación:** reusa `detectCapability`. Tier 1 con menos partículas y sin
  postproceso; tier 0 / `prefers-reduced-motion` muestran el monograma en HTML
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
