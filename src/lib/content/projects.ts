import type { Locale } from "@/lib/i18n/config";

export type Localized<T> = Record<Locale, T>;

export type ProjectCategory =
  | "websites"
  | "ecommerce"
  | "apps"
  | "systems"
  | "integrations";

export type Project = {
  slug: string;
  client: string;
  category: ProjectCategory;
  year: number;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  /** Pantallazo real del sitio en producción (public/work/*.webp, 1440×900). */
  image?: string;
  featured: boolean;
  title: Localized<string>;
  excerpt: Localized<string>;
  problem: Localized<string>;
  built: Localized<string>;
  interactions: Localized<string>;
  services: Localized<string[]>;
  metrics: { value: string; label: Localized<string> }[];
};

export const CATEGORY_LABELS: Record<ProjectCategory, Localized<string>> = {
  websites: { es: "Websites", en: "Websites" },
  ecommerce: { es: "E-commerce", en: "E-commerce" },
  apps: { es: "Aplicaciones", en: "Web apps" },
  systems: { es: "Sistemas", en: "Systems" },
  integrations: { es: "Integraciones", en: "Integrations" },
};

/**
 * Fuente única del portafolio — sitios y repos reales de @leoandrescl.
 * Orden: alfabético por título; cada entrada con pantallazo propio en public/work/.
 */
export const projects: Project[] = [
  {
    slug: "by-tamara-jewels",
    client: "By Tamara Jewels",
    category: "ecommerce",
    year: 2026,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "WooCommerce Store API", "Vercel"],
    liveUrl: "https://bytamarajewels.cl",
    repoUrl: "https://github.com/leoandrescl/bytamarajewels-wp",
    image: "/work/by-tamara-jewels.webp",
    featured: true,
    title: { es: "By Tamara Jewels", en: "By Tamara Jewels" },
    excerpt: {
      es: "Storefront headless para una joyería de autor: catálogo gestionado en WooCommerce, carrito y checkout con la estética editorial de la marca.",
      en: "A headless storefront for an author jewelry brand: WooCommerce-managed catalog, cart and checkout with the brand's editorial look.",
    },
    problem: {
      es: "Vender joyería de autor online manteniendo el catálogo en WooCommerce, sin renunciar a una experiencia de marca propia ni a un flujo de compra confiable.",
      en: "Sell author jewelry online while keeping the catalog in WooCommerce, without giving up a branded experience or a reliable purchase flow.",
    },
    built: {
      es: "Frontend Next.js desplegado en Vercel que consume la WooCommerce Store API del CMS (cms.bytamarajewels.cl): colecciones y fichas de producto, buscador, favoritos con \"Mi selección\" y carrito que redirige al checkout seguro del CMS.",
      en: "A Next.js frontend deployed on Vercel that consumes the WooCommerce Store API of the CMS (cms.bytamarajewels.cl): collections and product pages, search, favorites with \"Mi selección\" and a cart that redirects to the CMS's secure checkout.",
    },
    interactions: {
      es: "Anuncios promocionales en la barra superior, lista de deseos y selección de piezas, y asesoría directa por WhatsApp desde cualquier página.",
      en: "Promo announcements in the top bar, a wishlist and piece selection, and direct WhatsApp advice from any page.",
    },
    services: {
      es: ["Storefront headless", "Integración WooCommerce", "E-commerce", "Experiencia de marca"],
      en: ["Headless storefront", "WooCommerce integration", "E-commerce", "Brand experience"],
    },
    metrics: [
      { value: "Headless", label: { es: "Arquitectura", en: "Architecture" } },
      { value: "WooCommerce", label: { es: "Catálogo y pagos", en: "Catalog & payments" } },
      { value: "WhatsApp", label: { es: "Asesoría", en: "Advisory" } },
    ],
  },
  {
    slug: "chanchi-mercado-pos",
    client: "Chanchi Mercado",
    category: "systems",
    year: 2026,
    stack: ["Cloudflare Workers", "Hono", "Cloudflare D1", "React 19", "Tailwind CSS", "PWA"],
    liveUrl: "https://chanchimercado.cl",
    repoUrl: "https://github.com/leoandrescl/chanchimercado",
    image: "/work/chanchi-mercado-pos.webp",
    featured: true,
    title: { es: "Chanchi Mercado POS", en: "Chanchi Mercado POS" },
    excerpt: {
      es: "POS y libreta de fiados para un comercio de comida: catálogo público, pedidos para retiro y administración 100% en Cloudflare.",
      en: "A POS and store-credit ledger for a food retailer: public catalog, pickup orders and admin, 100% on Cloudflare.",
    },
    problem: {
      es: "Las ventas, las deudas (fiados) y el stock vivían en papel; el saldo anotado a mano era fuente de errores y el negocio necesitaba pedidos web sin servidores costosos.",
      en: "Sales, store credit and stock lived on paper; hand-kept balances invited errors, and the shop needed web orders without costly servers.",
    },
    built: {
      es: "SPA + PWA en React 19 sobre Workers, Hono y D1: catálogo público con búsqueda y categorías, pedidos para retiro en el local, libreta de fiados donde el saldo se calcula desde movimientos atómicos y panel admin protegido por PIN.",
      en: "A React 19 SPA + PWA on Workers, Hono and D1: public catalog with search and categories, pickup orders, a store-credit ledger where balances are computed from atomic movements, and a PIN-protected admin panel.",
    },
    interactions: {
      es: "Búsqueda instantánea de productos, chips de categorías, abonos validados contra la deuda en la misma transacción SQL e instalación como app (PWA).",
      en: "Instant product search, category chips, credit payments validated against the debt in the same SQL transaction, and installable as a PWA.",
    },
    services: {
      es: ["Aplicación web", "Sistema a medida", "PWA", "Base de datos"],
      en: ["Web app", "Custom system", "PWA", "Database"],
    },
    metrics: [
      { value: "D1 + KV", label: { es: "Infraestructura", en: "Infrastructure" } },
      { value: "Fiados", label: { es: "Saldo calculado", en: "Computed balance" } },
      { value: "PIN", label: { es: "Acceso admin", en: "Admin access" } },
    ],
  },
  {
    slug: "imppulsor-web",
    client: "Imppulsor",
    category: "websites",
    year: 2026,
    stack: ["WordPress", "PHP", "GeneratePress", "ACF", "Contact Form 7", "dompdf"],
    liveUrl: "https://imppulsor.com",
    repoUrl: "https://github.com/leoandrescl/imppulsor-web",
    image: "/work/imppulsor-web.webp",
    featured: false,
    title: { es: "Imppulsor", en: "Imppulsor" },
    excerpt: {
      es: "Sitio corporativo de la consultora: casos de éxito, insights y equipo con contenido propio, formularios por país y generación de PDF, migrado por completo al inglés.",
      en: "The consultancy's corporate site: success stories, insights and team content, per-country forms and PDF generation, fully migrated to English.",
    },
    problem: {
      es: "Una consultora B2B necesitaba publicar contenido editorial propio (insights, casos, testimonios, autores), captar leads por país y luego internacionalizarse con una migración ES → EN sin perder SEO.",
      en: "A B2B consultancy needed to publish its own editorial content (insights, cases, testimonials, authors), capture leads per country and then internationalize with an ES → EN migration without losing SEO.",
    },
    built: {
      es: "Tema hijo a medida de GeneratePress con CPT de casos de éxito, testimonios y autores, campos ACF, formularios CF7 segmentados, generación de PDF con dompdf, GTranslate y Yoast; la migración al inglés incluyó 25 páginas, 34 insights, 17 casos y redirecciones 301.",
      en: "A custom GeneratePress child theme with success-story, testimonial and author CPTs, ACF fields, segmented CF7 forms, dompdf PDF generation, GTranslate and Yoast; the English migration covered 25 pages, 34 insights, 17 cases and 301 redirects.",
    },
    interactions: {
      es: "Hero rotativo, carruseles de casos e insights, selector de idioma por región y formularios de contacto con motivo y país.",
      en: "Rotating hero, case and insight carousels, a per-region language switcher and contact forms with reason and country.",
    },
    services: {
      es: ["Website corporativo", "Tema WordPress a medida", "Migración ES → EN", "SEO"],
      en: ["Corporate website", "Custom WordPress theme", "ES → EN migration", "SEO"],
    },
    metrics: [
      { value: "5 idiomas", label: { es: "Selector regional", en: "Regional switcher" } },
      { value: "3 CPT", label: { es: "Casos, testimonios, autores", en: "Cases, testimonials, authors" } },
      { value: "PDF", label: { es: "Generación con dompdf", en: "Generated with dompdf" } },
    ],
  },
  {
    slug: "imppulsor-dmc",
    client: "Imppulsor",
    category: "systems",
    year: 2026,
    stack: ["PHP", "JavaScript", "Excel ingest", "Data viz"],
    liveUrl: "https://cmd.imppulsor.com",
    repoUrl: "https://github.com/leoandrescl/imppulsor-dashboard",
    image: "/work/imppulsor-dmc.webp",
    featured: false,
    title: { es: "Imppulsor DMC", en: "Imppulsor DMC" },
    excerpt: {
      es: "Portal privado del Diagnóstico de Madurez Comercial: acceso por cliente, ingesta de Excel, benchmark y reportes visuales interactivos.",
      en: "The private portal for the Commercial Maturity Diagnosis: per-client access, Excel ingestion, benchmarking and interactive visual reports.",
    },
    problem: {
      es: "Consolidar casos del diagnóstico, calcular un benchmark filtrable y mostrar causa e impacto de cada dimensión para audiencias no técnicas.",
      en: "Consolidate diagnosis cases, compute a filterable benchmark and show the cause and impact of each dimension for non-technical audiences.",
    },
    built: {
      es: "Plataforma PHP con acceso por correo registrado, carga de Excel con validación de plantilla, vistas de caso contra benchmark, heatmaps de subdimensiones, wordclouds e informes descargables.",
      en: "A PHP platform with registered-email access, Excel upload with template validation, case-versus-benchmark views, sub-dimension heatmaps, wordclouds and downloadable reports.",
    },
    interactions: {
      es: "Filtros que recalculan el benchmark en vivo, gráficos por pantalla pensados para narrar el diagnóstico e informes listos para compartir con el cliente.",
      en: "Filters that recompute the benchmark live, one-chart-per-screen storytelling and reports ready to share with the client.",
    },
    services: {
      es: ["Dashboard", "Visualización de datos", "Ingesta de Excel", "Sistema interno"],
      en: ["Dashboard", "Data visualization", "Excel ingestion", "Internal system"],
    },
    metrics: [
      { value: "Benchmark", label: { es: "Foco", en: "Focus" } },
      { value: "Excel DMC", label: { es: "Entrada", en: "Input" } },
      { value: "Multi-vista", label: { es: "Vistas", en: "Views" } },
    ],
  },
  {
    slug: "pagate-app",
    client: "Pagate",
    category: "apps",
    year: 2026,
    stack: ["Next.js", "TypeScript", "Supabase", "Mercado Pago", "Google Calendar API", "Tailwind CSS"],
    liveUrl: "https://pagate.cl",
    repoUrl: "https://github.com/leoandrescl/pagate-app",
    image: "/work/pagate-app.webp",
    featured: true,
    title: { es: "Pagate", en: "Pagate" },
    excerpt: {
      es: "Producto link-in-bio para creadores en Chile: tienda propia, cobros en CLP con Mercado Pago y entrega digital o agendamiento con Google Calendar.",
      en: "A link-in-bio product for creators in Chile: your own store, CLP payments with Mercado Pago and digital delivery or scheduling with Google Calendar.",
    },
    problem: {
      es: "Los creadores coordinan cada venta a mano: cobro por transferencia, entrega del archivo por WhatsApp y agendamiento de sesiones en mensajes sueltos.",
      en: "Creators coordinate every sale by hand: bank-transfer payments, file delivery over WhatsApp and session scheduling scattered across messages.",
    },
    built: {
      es: "Plataforma Next.js con studio.pagate.cl (login con Google vía Supabase), onboarding, panel de productos y disponibilidad, storefront público en /u/[handle], checkout con Mercado Pago Checkout Pro y entrega automática del digital o del evento con Google Meet.",
      en: "A Next.js platform with studio.pagate.cl (Google sign-in via Supabase), onboarding, a product and availability dashboard, a public storefront at /u/[handle], Mercado Pago Checkout Pro payments and automatic delivery of the digital good or the Google Meet event.",
    },
    interactions: {
      es: "Configuración guiada del perfil, preview del storefront en vivo, venta en CLP sin comisión de plataforma y una confirmación que entrega el archivo o la reunión al instante.",
      en: "Guided profile setup, live storefront preview, CLP sales with no platform fee and a confirmation that delivers the file or the meeting instantly.",
    },
    services: {
      es: ["Producto digital", "Aplicación web", "Integración Mercado Pago", "Integración Google"],
      en: ["Digital product", "Web app", "Mercado Pago integration", "Google integration"],
    },
    metrics: [
      { value: "Mercado Pago", label: { es: "Pagos en CLP", en: "CLP payments" } },
      { value: "Google Calendar", label: { es: "Agenda + Meet", en: "Scheduling + Meet" } },
      { value: "/u/[handle]", label: { es: "Storefront", en: "Storefront" } },
    ],
  },
  {
    slug: "sanmateo-web",
    client: "Inmobiliaria San Mateo",
    category: "websites",
    year: 2026,
    stack: ["WordPress", "PHP", "GeneratePress", "Contact Form 7", "CSS"],
    liveUrl: "https://inmobiliariasanmateo.cl",
    repoUrl: "https://github.com/leoandrescl/sanmateo-web",
    image: "/work/sanmateo-web.webp",
    featured: true,
    title: { es: "San Mateo Inmobiliaria", en: "San Mateo Real Estate" },
    excerpt: {
      es: "Sitio inmobiliario en WordPress con propiedades, proyectos, cotizador y captación de leads.",
      en: "WordPress real-estate site with properties, projects, a quote tool and lead capture.",
    },
    problem: {
      es: "Reemplazar una web inmobiliaria genérica por un sistema con tipos de contenido propios, catálogo unificado y formularios de captación.",
      en: "Replace a generic real-estate site with a system with custom post types, a unified catalog and lead-capture forms.",
    },
    built: {
      es: "Tema hijo a medida con design system y tokens propios, CPT de propiedades y proyectos con galería, video y ficha, cotizador con UF del SII, simulador de crédito, Contact Form 7 y paneles admin con AJAX.",
      en: "A custom child theme with its own design system and tokens, property and project CPTs with gallery, video and detail page, a quote tool using SII UF values, a credit simulator, Contact Form 7 and AJAX admin panels.",
    },
    interactions: {
      es: "Filtros de catálogo, hero con slider y video, galerías de proyecto y un cotizador que estima escenarios sin recargar la página.",
      en: "Catalog filters, a hero slider with video, project galleries and a quote tool that estimates scenarios without reloading the page.",
    },
    services: {
      es: ["Website", "Tema WordPress", "CPT & paneles admin", "Captación de leads"],
      en: ["Website", "WordPress theme", "CPT & admin panels", "Lead capture"],
    },
    metrics: [
      { value: "Propiedades + Proyectos", label: { es: "CPT", en: "CPT" } },
      { value: "CF7", label: { es: "Leads", en: "Leads" } },
      { value: "Child theme", label: { es: "Base", en: "Base" } },
    ],
  },
  {
    slug: "vixon-group",
    client: "Vixon Group",
    category: "websites",
    year: 2026,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Resend"],
    liveUrl: "https://studiovixon.com",
    repoUrl: "https://github.com/leoandrescl/vixongroup-web",
    image: "/work/vixon-group.webp",
    featured: false,
    title: { es: "Vixon Group", en: "Vixon Group" },
    excerpt: {
      es: "Sitio de la agencia tecnológica y de growth: servicios de software, e-commerce, performance y datos, con portafolio de casos y blog.",
      en: "The tech and growth agency site: software, e-commerce, performance and data services, with a case portfolio and blog.",
    },
    problem: {
      es: "La agencia vendía dos cosas a la vez (desarrollo y marketing) y necesitaba un sitio que lo contara con casos reales propios y captación directa.",
      en: "The agency sells two things at once (development and marketing) and needed a site that tells that story with real cases and direct lead capture.",
    },
    built: {
      es: "Sitio en Next.js App Router con Tailwind y shadcn/ui: hero con mockups de dispositivos, líneas de servicio, portafolio con capturas desktop y mobile por caso, nosotros con equipo, blog y contacto con envío por Resend y WhatsApp.",
      en: "A Next.js App Router site with Tailwind and shadcn/ui: a device-mockup hero, service lines, a portfolio with desktop and mobile shots per case, an about page with the team, a blog and contact via Resend and WhatsApp.",
    },
    interactions: {
      es: "Hero con métricas de resultado (ROAS, uptime), navegación por líneas de servicio y llamados a la acción persistentes hacia WhatsApp y formulario.",
      en: "A hero with outcome metrics (ROAS, uptime), service-line navigation and persistent CTAs to WhatsApp and the form.",
    },
    services: {
      es: ["Website", "Next.js", "Portafolio y blog", "Captación de leads"],
      en: ["Website", "Next.js", "Portfolio & blog", "Lead capture"],
    },
    metrics: [
      { value: "9 casos", label: { es: "Portafolio", en: "Portfolio" } },
      { value: "4 líneas", label: { es: "Servicios", en: "Service lines" } },
      { value: "Resend", label: { es: "Contacto", en: "Contact" } },
    ],
  },
  {
    slug: "vixon-merch",
    client: "Vixon",
    category: "ecommerce",
    year: 2026,
    stack: ["WordPress", "WooCommerce", "PHP", "CSS"],
    liveUrl: "https://vixon.cl",
    image: "/work/vixon-merch.webp",
    featured: false,
    title: { es: "Vixon Merch", en: "Vixon Merch" },
    excerpt: {
      es: "Tienda WooCommerce del merch oficial de Vixon: productos destacados, compra directa, pago protegido y también servicios digitales.",
      en: "Vixon's official-merch WooCommerce store: featured products, direct purchase, protected payment and digital services too.",
    },
    problem: {
      es: "Comercializar el merch oficial (polerones, poleras, llaveros, botellas) y servicios digitales con un flujo de compra simple, seguro y con señal de confianza desde el primer pantallazo.",
      en: "Selling official merch (hoodies, tees, keychains, bottles) and digital services with a simple, secure purchase flow and trust signals from the first screen.",
    },
    built: {
      es: "Tienda en WordPress + WooCommerce con home de destacados en carrusel, fichas con precio y compra directa al carrito, sellos de compra protegida, reseñas Trustpilot y sección de preguntas frecuentes.",
      en: "A WordPress + WooCommerce store with a carousel home of featured products, price-and-buy cards, protected-purchase badges, Trustpilot reviews and an FAQ section.",
    },
    interactions: {
      es: "Carrusel de destacados, accesos a merch y servicios digitales, confianza visible (pago seguro, atención directa) y compra en pocos clics.",
      en: "A featured-product carousel, merch and digital-service entrances, visible trust signals (secure payment, direct support) and a few-click purchase.",
    },
    services: {
      es: ["E-commerce", "WooCommerce", "Tienda de merch", "Confianza y conversión"],
      en: ["E-commerce", "WooCommerce", "Merch store", "Trust & conversion"],
    },
    metrics: [
      { value: "WooCommerce", label: { es: "Plataforma", en: "Platform" } },
      { value: "4.8/5", label: { es: "Trustpilot", en: "Trustpilot" } },
      { value: "Merch + Digital", label: { es: "Catálogo", en: "Catalog" } },
    ],
  },
];

export function getProjects() {
  return projects;
}

export function getFeaturedProjects(limit = 4) {
  return projects.filter((p) => p.featured).slice(0, limit);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug) ?? null;
}

export function getAdjacentProjects(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: projects[(index - 1 + projects.length) % projects.length] ?? null,
    next: projects[(index + 1) % projects.length] ?? null,
  };
}

export function getCategories() {
  const seen = new Set<ProjectCategory>();
  for (const project of projects) seen.add(project.category);
  return Array.from(seen);
}
