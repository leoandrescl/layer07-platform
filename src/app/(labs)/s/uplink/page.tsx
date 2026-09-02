import type { Metadata } from "next";
import {
  CATEGORY_LABELS,
  getFeaturedProjects,
  getProjects,
} from "@/lib/data/content";
import { UplinkHome, type UplinkWork } from "@/components/uplink/UplinkHome";

export const metadata: Metadata = {
  title: "UPLINK",
  description:
    "Leonardo Contreras — Full Stack Engineer en Santiago. Sistemas a medida, headless e-commerce e integraciones API. 8+ años en producción.",
};

async function githubRepos() {
  try {
    const res = await fetch("https://api.github.com/users/leoandrescl", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { public_repos?: number };
    return typeof data.public_repos === "number" ? data.public_repos : null;
  } catch {
    return null;
  }
}

export default async function UplinkPage() {
  const featured: UplinkWork[] = getFeaturedProjects(3).map((project) => ({
    slug: project.slug,
    title: project.title,
    excerpt: project.excerpt,
    category: CATEGORY_LABELS[project.category],
    year: project.year,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    stack: project.stack,
  }));

  return (
    <UplinkHome
      featured={featured}
      shipped={getProjects().length}
      githubRepos={await githubRepos()}
    />
  );
}
