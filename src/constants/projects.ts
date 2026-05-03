export interface KPI {
  value: string;
  label: string;
  source?: string;
}

export interface Solution {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  concept: string;
  techStack: string[];
  kpis: KPI[];
  architectureDiagram: string[]; // ASCII-style architecture nodes
}

export const SOLUTIONS: Solution[] = [
  {
    id: "SOL-01",
    code: "COMMERCE_ARCHITECTURE",
    title: "COMMERCE ARCHITECTURE",
    subtitle: "// SHOPIFY HEADLESS SPECIALIZATION",
    concept: "Ingeniería de conversión sobre Shopify Storefront API. Eliminamos las limitaciones de Liquid para construir experiencias de compra ultra-rápidas. Arquitecturas diseñadas para marcas que demandan control total sobre el checkout y la interfaz de usuario sin comprometer la robustez de Shopify.",
    techStack: ["Next.js 15", "Shopify Storefront API", "GraphQL", "Vercel Edge Network"],
    kpis: [
      {
        value: "+1%",
        label: "CONVERSION PER 100ms GAIN",
        source: "Deloitte / Google, 2024"
      },
      {
        value: "-24%",
        label: "BOUNCE RATE AT LCP <1.2s",
        source: "Core Web Vitals Report, 2025"
      },
      {
        value: "<0.8s",
        label: "LCP GUARANTEED",
      }
    ],
    architectureDiagram: [
      "[ SHOPIFY ENGINE ]",
      "           ↓",
      "[ STOREFRONT API ]",
      "           ↓",
      "[ NEXT.JS APP ROUTER ]",
      "           ↓",
      "[ CLIENT ] — LCP < 0.8s"
    ]
  },
  {
    id: "SOL-02",
    code: "EDITORIAL_ENGINEERING",
    title: "EDITORIAL & CONTENT",
    subtitle: "// HEADLESS WORDPRESS & CUSTOM SITES",
    concept: "Transformamos WordPress en un CMS Headless de alto rendimiento. Ideal para sitios informativos y plataformas de contenido que requieren una gestión editorial intuitiva pero exigen una entrega de datos estática y segura. Next.js + WP GraphQL para un SEO imbatible y tiempos de carga instantáneos.",
    techStack: ["Shopify Storefront API (Content)", "WordPress GraphQL", "Next.js 15 + ISR", "Framer Motion"],
    kpis: [
      {
        value: "+40%",
        label: "USER RETENTION AT 60FPS",
        source: "Google UX Research, 2025"
      },
      {
        value: "100",
        label: "LIGHTHOUSE SCORE (ALL METRICS)",
      },
      {
        value: "×3",
        label: "ORGANIC LEADS VS. LEGACY CMS",
        source: "Composable Commerce Index, 2025"
      }
    ],
    architectureDiagram: [
      "[ WORDPRESS CORE ]",
      "           ↓",
      "[ WP GRAPHQL ]",
      "           ↓",
      "[ NEXT.JS + ISR ]",
      "           ↓",
      "[ CLIENT ] — LIGHTHOUSE: 100/100"
    ]
  }
];

// Legacy export for backward compatibility
export type Project = Solution;
export const PROJECTS = SOLUTIONS;
