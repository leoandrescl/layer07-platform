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
    code: "HEADLESS_COMMERCE",
    title: "HEADLESS COMMERCE",
    subtitle: "REVENUE OPTIMIZER",
    concept: "Desacoplamiento total del Frontend para marcas de e-commerce que escalan. Eliminamos el cuello de botella del renderizado server-side legacy para convertir cada milisegundo de carga en ingreso directo.",
    techStack: ["Next.js 15 (App Router)", "Shopify Storefront API", "GraphQL", "Vercel Edge Network"],
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
      "[ SHOPIFY ] → [ STOREFRONT API ]",
      "         ↓",
      "[ GRAPHQL LAYER ] → [ ISR CACHE ]",
      "         ↓",
      "[ NEXT.JS APP ROUTER ] → [ EDGE CDN ]",
      "         ↓",
      "[ CLIENT ] — LCP < 0.8s"
    ]
  },
  {
    id: "SOL-02",
    code: "EDITORIAL_PERFORMANCE",
    title: "EDITORIAL PERFORMANCE",
    subtitle: "LEAD MAGNET",
    concept: "Experiencias de alto impacto visual sin penalización de rendimiento. Arquitecturas composables que posicionan a la marca por encima de la competencia legacy en búsqueda orgánica y retención.",
    techStack: ["Next.js 15", "Sanity / Payload CMS", "Framer Motion", "Lighthouse 100"],
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
      "[ CMS (SANITY/PAYLOAD) ] → [ CDN ]",
      "         ↓",
      "[ NEXT.JS + ISR ] → [ STATIC PAGES ]",
      "         ↓",
      "[ FRAMER MOTION ] → [ 60FPS UI ]",
      "         ↓",
      "[ CLIENT ] — LIGHTHOUSE: 100/100"
    ]
  }
];

// Legacy export for backward compatibility
export type Project = Solution;
export const PROJECTS = SOLUTIONS;
