import { Project } from "@/types/project";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Allisone Store",
    slug: "allisone-store",
    featuredImage: { node: { sourceUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600" } },
    projectDetails: {
      performanceScore: 100,
      techStack: ["Next.js 16", "Shopify Headless", "GraphQL"],
      clientName: "Allisone Fitness",
      challengeDescription: "Transforming a standard e-commerce into a high-performance luxury experience."
    }
  }
];
