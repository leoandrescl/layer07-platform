"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { ProjectVisual } from "@/components/ui/ProjectVisual";
import {
  CATEGORY_LABELS,
  getCategories,
  type Project,
  type ProjectCategory,
} from "@/lib/content/projects";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Filter = ProjectCategory | "all";

export function WorkGrid({
  projects,
  locale,
  dict,
}: {
  projects: Project[];
  locale: Locale;
  dict: Dictionary;
}) {
  const categories = getCategories();
  const [active, setActive] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      active === "all"
        ? projects
        : projects.filter((project) => project.category === active),
    [projects, active],
  );

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: dict.work.filterAll },
    ...categories.map((category) => ({
      value: category as Filter,
      label: CATEGORY_LABELS[category][locale],
    })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActive(filter.value)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[0.6875rem] tracking-[0.14em] uppercase transition-colors",
                isActive
                  ? "border-transparent bg-ink text-bg"
                  : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
        {filtered.map((project) => (
          <Link
            key={project.slug}
            href={`/${locale}/work/${project.slug}`}
            className="group block"
          >
            <ProjectVisual project={project} locale={locale} />
            <div className="mt-6 flex items-start justify-between gap-6">
              <div>
                <span className="eyebrow">
                  {CATEGORY_LABELS[project.category][locale]}
                </span>
                <h2 className="mt-2 font-display text-2xl tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                  {project.title[locale]}
                </h2>
                <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
                  {project.excerpt[locale]}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                {project.year}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-ink-muted">{dict.work.empty}</p>
      ) : null}
    </div>
  );
}
