const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

export async function fetchAPI(query: string, { variables }: { variables?: any } = {}) {
  if (!API_URL) throw new Error("WP GraphQL API URL is not set");
  
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  const json = await res.json();
  if (json.errors) throw new Error('Failed to fetch API');
  return json.data;
}

export const PROJECT_FRAGMENT = `
  fragment ProjectFragment on Project {
    id
    title
    slug
    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
    projectFields {
      performanceScore
      techStack
    }
  }
`;

export interface GraphQLProject {
  id: string;
  title: string;
  slug: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string | null;
      mediaDetails: {
        width: number;
        height: number;
      } | null;
    } | null;
  } | null;
  projectFields: {
    performanceScore: number;
    techStack: string[];
  } | null;
}

export async function getAllProjectsForHome(): Promise<GraphQLProject[]> {
  const data = await fetchAPI(`
    query AllProjects {
      projects(first: 10, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          ...ProjectFragment
        }
      }
    }
    ${PROJECT_FRAGMENT}
  `);

  return data?.projects?.nodes || [];
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const data = await fetchAPI(`
    query ProjectSlugs {
      projects(first: 100) {
        nodes {
          slug
        }
      }
    }
  `);

  return data?.projects?.nodes?.map((node: { slug: string }) => node.slug) || [];
}

export async function getProjectBySlug(slug: string): Promise<GraphQLProject | null> {
  const data = await fetchAPI(`
    query ProjectBySlug($slug: String!) {
      projects(where: { name: $slug }, first: 1) {
        nodes {
          ...ProjectFragment
        }
      }
    }
    ${PROJECT_FRAGMENT}
  `, {
    variables: { slug }
  });

  return data?.projects?.nodes?.[0] || null;
}
