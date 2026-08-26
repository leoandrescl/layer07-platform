# layer07.cl

Web corporativa / estudio de ingeniería — Next.js App Router, TypeScript, Tailwind CSS v4.

## Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Contenido

Edita proyectos, logos y testimonios en:

`src/lib/data/content.ts`

## Variables de entorno

Copia `.env.example` → `.env.local`:

- `RESEND_API_KEY` / `RESEND_FROM` — formulario de contacto
- `NEXT_PUBLIC_GITHUB_URL` / `NEXT_PUBLIC_LINKEDIN_URL` — redes
- `NEXT_PUBLIC_SITE_URL` — URL canónica (sitemap / OG)

Sin `RESEND_API_KEY`, el endpoint `/api/contact` corre en dry-run.

## Brief

Ver `docs/BRIEF.md`.

## Deploy

Compatible con Vercel. Configura las env vars en el dashboard del proyecto.
