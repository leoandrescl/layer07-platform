import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content/projects";
import { locales } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

const PATHS = ["", "/work", "/services", "/about", "/agency", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    PATHS.map((path): MetadataRoute.Sitemap[number] => ({
      url: `${SITE.url}/${lang}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.8,
    })),
  );

  const projectRoutes: MetadataRoute.Sitemap = locales.flatMap((lang) =>
    getProjects().map((project): MetadataRoute.Sitemap[number] => ({
      url: `${SITE.url}/${lang}/work/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  );

  return [...staticRoutes, ...projectRoutes];
}
