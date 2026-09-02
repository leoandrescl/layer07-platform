"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  type Project,
  type ProjectCategory,
} from "@/lib/data/content";
import { cn } from "@/lib/cn";

const FILTERS: Array<"all" | ProjectCategory> = [
  "all",
  "sistemas",
  "ecommerce",
  "integraciones",
];

type PortfolioGridProps = {
  projects: Project[];
};

export function PortfolioGrid({ projects }: PortfolioGridProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  const visible = useMemo(() => {
    if (filter === "all") return projects;
    return projects.filter((p) => p.category === filter);
  }, [filter, projects]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "border cursor-pointer px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase transition-all duration-200 hover:-translate-y-0.5",
              filter === key
                ? "border-neon text-neon shadow-neon"
                : "border-border text-muted-dim hover:border-cyan hover:text-cyan hover:shadow-cyan",
            )}
          >
            {key === "all" ? "Todos" : CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <Link
            key={project.slug}
            href={`/portafolio/${project.slug}`}
            className="group border border-border bg-surface/60 transition-shadow hover:border-neon/50 hover:shadow-neon"
          >
            <div
              className={`flex h-40 items-end bg-gradient-to-br ${project.coverGradient} p-4`}
            >
              <span className="font-mono text-[10px] tracking-widest text-cyan uppercase">
                {CATEGORY_LABELS[project.category]}
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-muted-dim">
                <span>{project.client}</span>
                <span>{project.year}</span>
              </div>
              <h3 className="text-base text-foreground group-hover:text-neon">
                {project.title}
              </h3>
              <p className="line-clamp-3 text-sm text-muted-dim">{project.excerpt}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="border border-border/80 px-1.5 py-0.5 text-[9px] tracking-wider text-muted-dim uppercase"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-muted-dim">
          &gt; No hay nodos en esta categoría.
        </p>
      ) : null}
    </div>
  );
}
