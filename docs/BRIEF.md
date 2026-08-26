# layer07.cl — Brief de producto

Fuente de verdad para diseño, negocio y arquitectura. No re-pegar este documento en cada prompt: referenciarlo.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Contenido en archivos (`src/lib/data/content.ts`) — sin CMS
- Resend (formulario de contacto por API)

## Negocio (estricto)

Enfoque 100%: Desarrollo Web, Headless E-commerce, Sistemas a medida, Integraciones API.

**Prohibido** como oferta: Marketing Digital, SEO orgánico como servicio, Ads, gestión de RRSS.

## Marca & perfil

- **Producto:** layer07.cl — Leonardo Contreras, Senior Full Stack / Product Engineer
- **Experiencia:** 8+ años end-to-end
- **Stack liderazgo:** Next.js, TypeScript, GraphQL, Shopify (Liquid/Storefront API), WooCommerce a medida, AWS Lightsail, DigitalOcean

## Estética

Cyberpunk retro-futurista / Serial Experiments Lain / Terminal CLI. Distópico pero legible y profesional.

| Token | Valor |
| --- | --- |
| bg | `#050505` / surface `#0a0a0c` |
| neon | `#00FF66` / `#00FF41` |
| cyan | `#00F0FF` |
| magenta | `#FF0055` |
| text | `#FFFFFF` / `#E2E8F0` |

UI: glitch sutil en hover, bordes glow, mono (Geist Mono), `bg-grid`, scanline/typing. Preferir CSS/GPU; LCP &lt; 1s.

## Rutas

1. `/` — Inicio  
2. `/servicios`  
3. `/nosotros`  
4. `/portafolio`  
5. `/portafolio/[slug]`  
6. `/contacto`  

Layout global: Header (status ONLINE), Footer, WhatsApp flotante (+56945541859), SEO/OG.

## Contacto

- Email: leoandrescl@gmail.com  
- Tel/WhatsApp: +56945541859  
- Ubicación: Santiago, Chile  
- Redes: GitHub, LinkedIn (vía env)

## Contenido

Editar proyectos, logos y testimonios en `src/lib/data/content.ts`.

## Resend

1. Crea API key en Resend.
2. Define `RESEND_API_KEY` y `RESEND_FROM` en `.env.local`.
3. Sin key, `/api/contact` responde en dry-run (útil en local).

## Social

Define `NEXT_PUBLIC_GITHUB_URL` y `NEXT_PUBLIC_LINKEDIN_URL` en `.env.local`.
