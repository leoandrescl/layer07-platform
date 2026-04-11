import { GraphQLProject } from "@/lib/graphql";

export const MOCK_PROJECTS: GraphQLProject[] = [
  {
    id: "1",
    title: "Allisone Store",
    slug: "allisone-store",
    featuredImage: { 
      node: { 
        sourceUrl: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600",
        altText: "Allisone Fitness",
        mediaDetails: { width: 1600, height: 900 }
      } 
    },
    projectFields: {
      performanceScore: 100,
      techStack: ["Next.js 16", "Shopify", "GraphQL"],
    }
  }
];
