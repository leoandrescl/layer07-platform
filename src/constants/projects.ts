export interface Project {
  id: string;
  title: string;
  slug: string;
  performanceScore: number;
  techStack: string[];
  coverImage: string;
  description: string;
}

export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Allisone",
    slug: "allisone",
    performanceScore: 99,
    techStack: ["Next.js", "WordPress Headless", "GraphQL", "Framer Motion"],
    coverImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2000",
    description: "Desacoplamiento total del frontend mediante arquitectura Headless para permitir una navegación instantánea sin las limitaciones del renderizado nativo de WordPress."
  },
  {
    id: "2",
    title: "By Tamara Jewels",
    slug: "by-tamara-jewels",
    performanceScore: 100,
    techStack: ["Next.js", "Shopify", "GraphQL", "Vercel"],
    coverImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=2000",
    description: "Implementación de un storefront personalizado sobre el motor de Shopify para maximizar el control sobre la experiencia visual y la velocidad de respuesta."
  }
];
