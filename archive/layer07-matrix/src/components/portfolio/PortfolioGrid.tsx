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
              "cursor-pointer border border-dashed px-3 py-2 font-mono text-[10px] tracking-[0.16em] lowercase transition-all duration-200 hover:-translate-y-0.5",
              filter === key
                ? "border-[#7fffd4]/70 text-[#7fffd4]"
                : "border-[#00ff66]/25 text-[#8fb8b0] hover:border-[#00f0ff]/50 hover:text-[#00f0ff]",
            )}
          >
            {key === "all" ? "todos" : CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <Link
            key={project.slug}
            href={`/portafolio/${project.slug}`}
            className="group wired-frame transition-colors hover:border-[#7fffd4]/50"
          >
            <div
              className={`flex h-40 items-end bg-gradient-to-br ${project.coverGradient} p-4`}
            >
              <span className="font-mono text-[10px] tracking-widest text-[#7fffd4] uppercase">
                {CATEGORY_LABELS[project.category]}
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2 font-mono text-[10px] text-[#8fb8b0]">
                <span>{project.client}</span>
                <span>{project.year}</span>
              </div>
              <h3 className="font-sans text-base tracking-[0.04em] text-[#e8fff8] lowercase group-hover:text-[#7fffd4]">
                {project.title}
              </h3>
              <p className="line-clamp-3 font-mono text-sm text-[#8fb8b0]">
                {project.excerpt}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="border border-dashed border-[#00ff66]/25 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-[#8fb8b0] uppercase"
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
        <p className="mt-8 font-mono text-sm text-[#8fb8b0]">
          &gt; No hay nodos en esta categoría.
        </p>
      ) : null}
    </div>
  );
}
