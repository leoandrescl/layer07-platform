# Layer07 Platform

Sitio de marca / agencia para **Layer07**: portfolio, capacidades y briefing de proyectos con enfoque en e-commerce e ingeniería web.

**Demo:** [layer07-platform.vercel.app](https://layer07-platform.vercel.app)

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Three.js** + Framer Motion (hero / motion)
- **Resend** (formulario de contacto / briefing)
- **Upstash Redis** (rate limiting en acciones)

## Qué incluye

- Landing con hero inmersivo
- Grid de trabajo / casos (`/work/[slug]`)
- Página de capacidades (`/capacidades`)
- Formulario de briefing con rate limit
- CTA hacia WhatsApp / contacto

## Requisitos

- Node.js 20+

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Sin `RESEND_API_KEY` el sitio corre; el envío de emails del briefing fallará hasta configurarlo.

## Variables de entorno

Ver [`.env.example`](./.env.example).

| Variable | Uso |
|---|---|
| `RESEND_API_KEY` | Envío de emails del formulario |
| `NEXT_PUBLIC_WORDPRESS_API_URL` | Opcional, si se conecta a un backend WP/GraphQL |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting (si aplica en el deploy) |

## Estructura (resumen)

- `src/app/` — páginas y server actions
- `src/lib/` — cliente API / GraphQL helpers
- Motion y 3D en componentes del hero

## Nota

Sitio de presentación / acquisition. El contenido de portfolio puede ser estático o conectado a CMS según el deploy.
