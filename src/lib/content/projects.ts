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

/** Fuente única del portafolio — repos y sitios reales de @leoandrescl. */
export const projects: Project[] = [
  {
    slug: "chanchi-mercado-pos",
    client: "Chanchi Mercado",
    category: "systems",
    year: 2026,
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Zustand"],
    liveUrl: "https://chanchimercado.cl",
    repoUrl: "https://github.com/leoandrescl/chanchi-mercado-pos",
    featured: true,
    title: { es: "Chanchi Mercado POS", en: "Chanchi Mercado POS" },
    excerpt: {
      es: "POS web para un comercio de comida: catálogo público, pedidos, fiados, inventario y panel admin conectado a WhatsApp.",
      en: "Web POS for a food retailer: public catalog, orders, store credit, inventory and an admin panel wired to WhatsApp.",
    },
    problem: {
      es: "La venta, las deudas (fiados), los abonos y el stock vivían en papel y en herramientas que no se hablaban entre sí, entre el mostrador y los clientes.",
      en: "Sales, store credit, payments and stock lived on paper and in tools that didn't talk to each other, between the counter and the customers.",
    },
    built: {
      es: "Una aplicación Next.js + Supabase con catálogo público, checkout con fiado, conciliación de deudas, autenticación por PIN y mensajes de WhatsApp para pedidos y estado de cuenta.",
      en: "A Next.js + Supabase app with a public catalog, store-credit checkout, debt reconciliation, PIN auth and WhatsApp messages for orders and account statements.",
    },
    interactions: {
      es: "POS en tiempo real, estados de pedido, búsqueda instantánea de productos y generación de mensajes sin salir del panel.",
      en: "Real-time POS, order states, instant product search and message generation without leaving the panel.",
    },
    services: {
      es: ["Aplicación web", "Sistema a medida", "Integración WhatsApp", "Base de datos"],
      en: ["Web app", "Custom system", "WhatsApp integration", "Database"],
    },
    metrics: [
      { value: "Catálogo + POS", label: { es: "Módulos", en: "Modules" } },
      { value: "WhatsApp", label: { es: "Canal", en: "Channel" } },
      { value: "PIN", label: { es: "Acceso admin", en: "Admin access" } },
    ],
  },
  {
    slug: "allisone-frontend",
    client: "Allisone",
    category: "ecommerce",
    year: 2026,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "WooCommerce API", "Resend"],
    liveUrl: "https://allisone.cl",
    repoUrl: "https://github.com/leoandrescl/allisone-frontend",
    featured: true,
    title: { es: "Allisone Store", en: "Allisone Store" },
    excerpt: {
      es: "Storefront Next.js de joyería de lujo: curaduría editorial, colecciones, carrito, checkout y sincronización con WooCommerce.",
      en: "Next.js storefront for luxury jewelry: editorial curation, collections, cart, checkout and WooCommerce sync.",
    },
    problem: {
      es: "Traducir una marca de joyería de alto posicionamiento a una experiencia web editorial, con un catálogo vivo que ya existía en WooCommerce.",
      en: "Translate a high-end jewelry brand into an editorial web experience, with a live catalog that already existed in WooCommerce.",
    },
    built: {
      es: "Frontend en App Router + Tailwind con páginas de colección y producto, carrito, checkout, políticas y consumo de la API de WooCommerce, más contacto vía Resend.",
      en: "An App Router + Tailwind frontend with collection and product pages, cart, checkout, policies and WooCommerce API consumption, plus contact through Resend.",
    },
    interactions: {
      es: "Transiciones cuidadas entre colecciones, galería de producto y una jerarquía tipográfica que trata cada pieza como un objeto.",
      en: "Considered transitions between collections, product gallery and a type hierarchy that treats each piece as an object.",
    },
    services: {
      es: ["Storefront headless", "Figma-to-code", "Integración WooCommerce", "E-commerce"],
      en: ["Headless storefront", "Figma-to-code", "WooCommerce integration", "E-commerce"],
    },
    metrics: [
      { value: "Headless", label: { es: "Tipo de frontend", en: "Frontend type" } },
      { value: "WooCommerce", label: { es: "Catálogo", en: "Catalog" } },
      { value: "Editorial", label: { es: "UX", en: "UX" } },
    ],
  },
  {
    slug: "pagate-app",
    client: "Pagate",
    category: "apps",
    year: 2026,
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Google Calendar API"],
    liveUrl: "https://pagate.cl",
    repoUrl: "https://github.com/leoandrescl/pagate-app",
    featured: true,
    title: { es: "Pagate", en: "Pagate" },
    excerpt: {
      es: "Producto link-in-bio con cobros y entrega digital o agendamiento para creadores, con flujo completo de punta a punta.",
      en: "A link-in-bio product with payments and digital delivery or scheduling for creators, with a complete end-to-end flow.",
    },
    problem: {
      es: "Validar un embudo para creadores (tienda pública → checkout → entrega o reunión) sin pasarelas reales ni autenticación de producción.",
      en: "Validate a creator funnel (public store → checkout → delivery or meeting) without real gateways or production auth.",
    },
    built: {
      es: "App Router con dashboard, storefront en /u/[handle], checkout de prueba, confirmación por token y OAuth opcional con Google Calendar (eventos, Meet y disponibilidad).",
      en: "App Router with a dashboard, storefront at /u/[handle], mock checkout, token confirmation and optional Google Calendar OAuth (events, Meet and availability).",
    },
    interactions: {
      es: "Configuración guiada del perfil, preview del storefront en vivo y un checkout que se siente real aunque esté en modo demo.",
      en: "Guided profile setup, live storefront preview and a checkout that feels real even in demo mode.",
    },
    services: {
      es: ["Producto digital", "Aplicación web", "Integración Google", "Diseño de flujos"],
      en: ["Digital product", "Web app", "Google integration", "Flow design"],
    },
    metrics: [
      { value: "Digital + Agenda", label: { es: "Flujos", en: "Flows" } },
      { value: "Creadores", label: { es: "Panel", en: "Dashboard" } },
      { value: "End-to-end", label: { es: "Demo", en: "Demo" } },
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
      es: "Tema hijo a medida con design system, CPT de propiedades y proyectos, galerías, simulador/cotizador, Contact Form 7 y paneles admin con AJAX.",
      en: "A custom child theme with a design system, property and project CPTs, galleries, a simulator/quote tool, Contact Form 7 and AJAX admin panels.",
    },
    interactions: {
      es: "Filtros de catálogo, galerías de proyecto y un cotizador que estima escenarios sin recargar la página.",
      en: "Catalog filters, project galleries and a quote tool that estimates scenarios without reloading the page.",
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
    slug: "sorteoseguro-web",
    client: "Sorteo Seguro",
    category: "ecommerce",
    year: 2026,
    stack: ["WordPress", "WooCommerce", "PHP", "Mercado Pago", "mu-plugins"],
    liveUrl: "https://sorteoseguro.cl",
    repoUrl: "https://github.com/leoandrescl/sorteoseguro-web",
    featured: false,
    title: { es: "Sorteo Seguro", en: "Sorteo Seguro" },
    excerpt: {
      es: "E-commerce WooCommerce a medida para sorteos: packs, checkout de invitado y Mercado Pago en producción.",
      en: "Custom WooCommerce e-commerce for raffles: packs, guest checkout and Mercado Pago in production.",
    },
    problem: {
      es: "Rediseñar el sitio sin tocar el core de plugins de terceros, manteniendo el sistema de sorteos, los packs y los cobros con Mercado Pago.",
      en: "Redesign the site without touching third-party plugin cores, keeping the raffle system, packs and Mercado Pago payments.",
    },
    built: {
      es: "Una capa de mu-plugins (chrome, home, carrito, checkout, PDP, thank-you y packs/MP) con UI a medida, preferencias de Mercado Pago con fees por pack y auto-completado post-pago.",
      en: "A mu-plugins layer (chrome, home, cart, checkout, PDP, thank-you and packs/MP) with custom UI, Mercado Pago preferences with per-pack fees and post-payment auto-completion.",
    },
    interactions: {
      es: "Selección de packs con feedback inmediato y un checkout de invitado pensado para reducir fricción y abandono.",
      en: "Pack selection with immediate feedback and a guest checkout designed to reduce friction and abandonment.",
    },
    services: {
      es: ["E-commerce", "WooCommerce a medida", "Integración de pagos", "Checkout"],
      en: ["E-commerce", "Custom WooCommerce", "Payment integration", "Checkout"],
    },
    metrics: [
      { value: "sorteoseguro.cl", label: { es: "En vivo", en: "Live" } },
      { value: "Mercado Pago", label: { es: "Pagos", en: "Payments" } },
      { value: "mu-plugins", label: { es: "Capa", en: "Layer" } },
    ],
  },
  {
    slug: "sorteo-web",
    client: "Sorteo Web",
    category: "ecommerce",
    year: 2026,
    stack: ["WordPress", "WooCommerce", "PHP", "Tailwind CSS", "MySQL"],
    liveUrl: "https://sorteo.allisone.cl",
    repoUrl: "https://github.com/leoandrescl/sorteo-web",
    featured: false,
    title: { es: "Sorteo Web Custom", en: "Sorteo Web Custom" },
    excerpt: {
      es: "Tema WordPress 100% custom para venta de tickets de sorteo, con packs y entrega de números transaccional.",
      en: "A 100% custom WordPress theme for raffle ticket sales, with packs and transactional number delivery.",
    },
    problem: {
      es: "Vender tickets de sorteo con packs y descuentos, generar números de forma segura y recuperar imágenes sin fricción para el comprador.",
      en: "Sell raffle tickets with packs and discounts, generate numbers securely and retrieve images without buyer friction.",
    },
    built: {
      es: "Tema WooCommerce con checkout directo, matriz de packs en servidor, tabla de tickets con transacciones SQL, emails premium, RUT validado y magic links de un solo uso.",
      en: "A WooCommerce theme with direct checkout, a server-side pack matrix, a ticket table with SQL transactions, premium emails, validated tax ID and single-use magic links.",
    },
    interactions: {
      es: "Compra en pocos pasos, validación de identidad en el cliente y acceso posterior a los tickets mediante enlace seguro.",
      en: "A few-step purchase, client-side identity validation and later access to tickets through a secure link.",
    },
    services: {
      es: ["E-commerce", "Tema WordPress custom", "Backend de tickets", "Emails transaccionales"],
      en: ["E-commerce", "Custom WordPress theme", "Ticket backend", "Transactional email"],
    },
    metrics: [
      { value: "5 tiers", label: { es: "Packs", en: "Packs" } },
      { value: "Transaccional", label: { es: "Tickets", en: "Tickets" } },
      { value: "Magic link", label: { es: "Acceso", en: "Access" } },
    ],
  },
  {
    slug: "imppulsor-dashboard",
    client: "Imppulsor",
    category: "systems",
    year: 2026,
    stack: ["PHP", "JavaScript", "Excel ingest", "Data viz"],
    liveUrl: "https://dmc.imppulsor.com",
    repoUrl: "https://github.com/leoandrescl/imppulsor-dashboard",
    featured: false,
    title: { es: "Imppulsor DMC", en: "Imppulsor DMC" },
    excerpt: {
      es: "Dashboard del Diagnóstico de Madurez Comercial: ingesta de Excel, benchmark y visualizaciones interactivas.",
      en: "Commercial Maturity Diagnosis dashboard: Excel ingestion, benchmarking and interactive visualizations.",
    },
    problem: {
      es: "Consolidar casos del diagnóstico, calcular un benchmark filtrable y mostrar causa e impacto de cada dimensión para audiencias no técnicas.",
      en: "Consolidate diagnosis cases, compute a filterable benchmark and show the cause and impact of each dimension for non-technical audiences.",
    },
    built: {
      es: "Prototipos web con carga de Excel, validación de plantilla, vistas de caso contra benchmark, heatmaps de subdimensiones y layouts tipo narrativa de datos.",
      en: "Web prototypes with Excel upload, template validation, case-versus-benchmark views, sub-dimension heatmaps and data-story layouts.",
    },
    interactions: {
      es: "Filtros que recalcular el benchmark en vivo y visualizaciones pensadas para explicar, no solo para mostrar datos.",
      en: "Filters that recompute the benchmark live and visualizations designed to explain, not just display data.",
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
