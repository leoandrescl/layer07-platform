export type ProjectCategory =
  | "sistemas"
  | "ecommerce"
  | "integraciones";

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: number;
  excerpt: string;
  challenge: string;
  solution: string;
  stack: string[];
  metrics: { label: string; value: string }[];
  liveUrl?: string;
  repoUrl?: string;
  featured: boolean;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  coverGradient: string;
};

export type SiteTestimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  project?: string;
};

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  sistemas: "Sistemas A Medida",
  ecommerce: "E-commerce & Storefronts",
  integraciones: "Integraciones API & CMS",
};

/** Fuente única del portafolio — repos reales de @leoandrescl. */
export const projects: Project[] = [
  {
    slug: "chanchi-mercado-pos",
    title: "Chanchi Mercado POS",
    client: "Chanchi Mercado",
    category: "sistemas",
    year: 2026,
    excerpt:
      "POS web para comercio de comida: catálogo público, pedidos, fiados, inventario y panel admin con WhatsApp.",
    challenge:
      "Operar ventas, deudas (fiados), abonos y stock sin depender de papel ni herramientas desconectadas entre mostrador y clientes.",
    solution:
      "App Next.js + Supabase con catálogo público, checkout con fiado, conciliación de deudas, auth por PIN y mensajes WhatsApp para pedidos / estado de cuenta.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Zustand"],
    metrics: [
      { label: "Módulos", value: "Catálogo+POS" },
      { label: "Canal", value: "WhatsApp" },
      { label: "Auth", value: "PIN admin" },
    ],
    liveUrl: "https://chanchimercado.cl",
    repoUrl: "https://github.com/leoandrescl/chanchi-mercado-pos",
    featured: true,
    coverGradient: "from-neon/25 via-cyan/10 to-transparent",
  },
  {
    slug: "allisone-frontend",
    title: "Allisone Store",
    client: "Allisone",
    category: "ecommerce",
    year: 2026,
    excerpt:
      "Storefront Next.js de joyería de lujo: curaduría editorial, colecciones, carrito/checkout y sync con WooCommerce.",
    challenge:
      "Traducir una marca de joyería de alto posicionamiento a una experiencia web editorial con catálogo vivo desde WooCommerce.",
    solution:
      "Frontend App Router + Tailwind con páginas de colección/producto, carrito, checkout, políticas y consumo de API WooCommerce; contacto vía Resend.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "WooCommerce API", "Resend"],
    metrics: [
      { label: "Tipo", value: "Headless FE" },
      { label: "Catálogo", value: "WooCommerce" },
      { label: "UX", value: "Editorial" },
    ],
    liveUrl: "https://allisone.cl",
    repoUrl: "https://github.com/leoandrescl/allisone-frontend",
    featured: true,
    coverGradient: "from-cyan/20 via-neon/10 to-transparent",
  },
  {
    slug: "pagate-app",
    title: "Pagate",
    client: "Pagate",
    category: "ecommerce",
    year: 2026,
    excerpt:
      "Producto link-in-bio + cobros + entrega digital / agendamiento para creadores (Chile), con flujo completo demo.",
    challenge:
      "Validar un funnel de creadores (tienda pública → checkout → entrega/Meet) sin pasarelas reales ni auth de producción.",
    solution:
      "Next.js App Router con dashboard, storefront `/u/[handle]`, checkout mock, confirmación por token y Google Calendar OAuth opcional (eventos + Meet + FreeBusy).",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Google Calendar API"],
    metrics: [
      { label: "Flujos", value: "Digital+Agenda" },
      { label: "Panel", value: "Creadores" },
      { label: "Demo", value: "End-to-end" },
    ],
    liveUrl: "https://pagate.cl",
    repoUrl: "https://github.com/leoandrescl/pagate-app",
    featured: true,
    coverGradient: "from-magenta/20 via-neon/10 to-transparent",
  },
  {
    slug: "sanmateo-web",
    title: "San Mateo Inmobiliaria",
    client: "Inmobiliaria San Mateo",
    category: "integraciones",
    year: 2026,
    excerpt:
      "Tema hijo WordPress (GeneratePress) para inmobiliaria: propiedades, proyectos, cotizador y leads.",
    challenge:
      "Sustituir una web inmobiliaria genérica por un sistema con CPT, metaboxes, catálogo unificado y formularios de captación.",
    solution:
      "Child theme custom con design system, CPT propiedades/proyectos, galerías, simulador/cotizador, Contact Form 7 y paneles admin AJAX.",
    stack: ["WordPress", "PHP", "GeneratePress", "Contact Form 7", "CSS"],
    metrics: [
      { label: "CPT", value: "Prop+Proy" },
      { label: "Leads", value: "CF7" },
      { label: "Base", value: "Child theme" },
    ],
    liveUrl: "https://inmobiliariasanmateo.cl",
    repoUrl: "https://github.com/leoandrescl/sanmateo-web",
    featured: false,
    coverGradient: "from-neon/15 via-surface to-transparent",
  },
  {
    slug: "sorteoseguro-web",
    title: "Sorteo Seguro",
    client: "Sorteo Seguro",
    category: "ecommerce",
    year: 2026,
    excerpt:
      "E-commerce WooCommerce a medida para sorteos: mu-plugins custom, packs, checkout guest y Mercado Pago en producción.",
    challenge:
      "Rediseñar sorteoseguro.cl sin tocar el core de plugins de terceros, manteniendo Lottery, packs DigiPacks y cobros con Mercado Pago.",
    solution:
      "Capa mu-plugins (chrome, home, cart, checkout, PDP, thank-you, packs/MP) con UI custom, preferencias Mercado Pago con fees de packs y auto-complete post-pago.",
    stack: [
      "WordPress",
      "WooCommerce",
      "PHP",
      "Mercado Pago",
      "mu-plugins",
    ],
    metrics: [
      { label: "Live", value: "sorteoseguro.cl" },
      { label: "Pagos", value: "Mercado Pago" },
      { label: "Capa", value: "mu-plugins" },
    ],
    liveUrl: "https://sorteoseguro.cl",
    repoUrl: "https://github.com/leoandrescl/sorteoseguro-web",
    featured: false,
    coverGradient: "from-magenta/20 via-cyan/10 to-transparent",
  },
  {
    slug: "sorteo-web",
    title: "Sorteo Web Custom",
    client: "Sorteo Web",
    category: "ecommerce",
    year: 2026,
    excerpt:
      "Tema WordPress 100% custom para sorteos con WooCommerce: packs, tickets transaccionales y magic links.",
    challenge:
      "Vender tickets de sorteo con packs/descuentos, generación segura de números y recuperación de imágenes sin fricción.",
    solution:
      "Tema WooCommerce con checkout directo, matriz de packs server-side, tabla de tickets con transacciones SQL, emails premium, RUT validado y magic links de un solo uso.",
    stack: ["WordPress", "WooCommerce", "PHP", "Tailwind CSS", "MySQL"],
    metrics: [
      { label: "Packs", value: "5 tiers" },
      { label: "Tickets", value: "Transaccional" },
      { label: "Auth", value: "Magic link" },
    ],
    liveUrl: "https://sorteo.allisone.cl",
    repoUrl: "https://github.com/leoandrescl/sorteo-web",
    featured: false,
    coverGradient: "from-cyan/15 via-magenta/10 to-transparent",
  },
  {
    slug: "imppulsor-dashboard",
    title: "Imppulsor DMC Dashboard",
    client: "Imppulsor",
    category: "sistemas",
    year: 2026,
    excerpt:
      "Dashboard del Diagnóstico de Madurez Comercial: ingestión Excel, casos, benchmark y visualizaciones interactivas.",
    challenge:
      "Consolidar casos DMC, calcular benchmark filtrable y mostrar causa/impacto de dimensiones para audiencias no técnicas.",
    solution:
      "Prototipos web (PHP demos + datasets) con upload Excel, validación de plantilla, vistas caso vs benchmark, heatmaps de subdimensiones y layouts tipo Flourish.",
    stack: ["PHP", "JavaScript", "Excel ingest", "Data viz"],
    metrics: [
      { label: "Foco", value: "Benchmark" },
      { label: "Input", value: "Excel DMC" },
      { label: "Vistas", value: "Multi-demo" },
    ],
    liveUrl: "https://dmc.imppulsor.com",
    repoUrl: "https://github.com/leoandrescl/imppulsor-dashboard",
    featured: false,
    coverGradient: "from-neon/20 via-cyan/5 to-transparent",
  },
];

export const clientLogos = [
  "CHANCHI",
  "ALLISONE",
  "PAGATE",
  "SORTEO SEGURO",
  "SAN MATEO",
  "SORTEO WEB",
  "IMPPULSOR",
];

/** Sin citas inventadas: se llenan cuando haya feedback real de clientes. */
export const testimonials: SiteTestimonial[] = [];

export function getProjects() {
  return projects;
}

export function getFeaturedProjects(limit = 3) {
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

export function getTestimonials() {
  return testimonials;
}
