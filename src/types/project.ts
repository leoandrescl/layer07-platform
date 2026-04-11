// src/types/project.ts
export interface Project {
  id: string;
  title: string;
  slug: string;
  featuredImage: {
    node: { sourceUrl: string };
  };
  projectDetails: {
    performanceScore: number;
    techStack: string[];
    clientName: string;
    challengeDescription: string;
  };
}
