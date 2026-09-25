# layer07.cl

Estudio de producto digital — Next.js 16 (App Router), TypeScript, Tailwind CSS
v4, Three.js y GSAP. Bilingüe (ES/EN) con temas Light/Dark.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige a `/es` o `/en`
según el idioma del navegador.

## Scripts

```bash
npm run dev      # desarrollo
npm run build    # build de producción (incluye typecheck)
npm run start    # servidor de producción
npm run lint     # eslint
```

## Estructura

- `src/app/[lang]/` — páginas localizadas (`es` | `en`)
- `src/proxy.ts` — detección de idioma y redirects legacy
- `src/lib/content/` — proyectos y servicios
- `src/lib/i18n/` — configuración y diccionarios
- `src/components/hero/` y `src/components/lab/` — heroes WebGL; `src/components/layout/Cosmos.tsx` — fondo cósmico
- `docs/BRIEF.md` — brief de producto y diseño

## Variables de entorno

Copia `.env.example` → `.env.local`:

- `RESEND_API_KEY` / `RESEND_FROM` — formulario de contacto
- `NEXT_PUBLIC_GITHUB_URL` / `NEXT_PUBLIC_LINKEDIN_URL` — redes
- `NEXT_PUBLIC_SITE_URL` — URL canónica (sitemap / OG / JSON-LD)

Sin `RESEND_API_KEY`, `/api/contact` corre en dry-run.

## Deploy

Compatible con Vercel. Configura las env vars en el dashboard del proyecto.
