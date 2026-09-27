import { describe, expect, it } from "vitest";
import { getAdjacentProjects, getProjectBySlug, getProjects } from "./projects";
import { locales } from "@/lib/i18n/config";

describe("projects", () => {
  it("localizes every project into all locales", () => {
    for (const project of getProjects()) {
      for (const locale of locales) {
        expect(project.title[locale]).toBeTruthy();
        expect(project.excerpt[locale]).toBeTruthy();
        expect(project.problem[locale]).toBeTruthy();
        expect(project.built[locale]).toBeTruthy();
        expect(project.interactions[locale]).toBeTruthy();
      }
    }
  });

  it("finds projects by slug and returns null otherwise", () => {
    const first = getProjects()[0];
    expect(first).toBeDefined();
    expect(getProjectBySlug(first.slug)).toEqual(first);
    expect(getProjectBySlug("does-not-exist")).toBeNull();
  });

  it("wraps adjacent projects around the list", () => {
    const list = getProjects();
    const first = list[0];
    const last = list[list.length - 1];
    const { prev, next } = getAdjacentProjects(first.slug);
    expect(prev?.slug).toBe(last.slug);
    expect(next?.slug).toBe(list[1].slug);
  });

  it("keeps the portfolio sorted by title and slugs unique", () => {
    const list = getProjects();
    const collator = new Intl.Collator("es");
    for (let i = 1; i < list.length; i++) {
      const previous = list[i - 1];
      const current = list[i];
      expect(previous).toBeDefined();
      expect(current).toBeDefined();
      if (!previous || !current) continue;
      expect(collator.compare(previous.title.es, current.title.es)).toBeLessThanOrEqual(0);
    }
    expect(new Set(list.map((p) => p.slug)).size).toBe(list.length);
  });
});
