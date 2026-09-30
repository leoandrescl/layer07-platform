import Link from "next/link";
import { cn } from "@/lib/cn";
import { ProjectVisual } from "@/components/ui/ProjectVisual";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CATEGORY_LABELS, getFeaturedProjects } from "@/lib/content/projects";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function WorkPreview({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const projects = getFeaturedProjects(4);

  return (
    <section className="shell py-24 md:py-32">
      <Reveal>
        <SectionHeading
          eyebrow={dict.home.work.eyebrow}
          title={dict.home.work.title}
          intro={dict.home.work.intro}
        />
      </Reveal>

      <div className="mt-16 flex flex-col gap-20 md:mt-20 md:gap-28">
        {projects.map((project, index) => {
          // Alternate the image side row by row; on mobile the image always
          // comes first so the list reads top to bottom.
          const flipped = index % 2 === 1;
          return (
            <Reveal key={project.slug} delay={0.05}>
              <Link
                href={`/${locale}/work/${project.slug}`}
                className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              >
                <div className={cn(flipped && "lg:order-2")}>
                  <ProjectVisual
                    project={project}
                    locale={locale}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                  />
                </div>

                <div className={cn(flipped && "lg:order-1")}>
                  <span className="eyebrow">
                    {CATEGORY_LABELS[project.category][locale]}
                  </span>
                  <h3 className="mt-3 font-display text-3xl tracking-[-0.02em] text-ink transition-colors group-hover:text-accent sm:text-4xl">
                    {project.title[locale]}
                  </h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
                    {project.excerpt[locale]}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.1em] text-ink-muted uppercase"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-4 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                    <span>{project.year}</span>
                    <span className="inline-flex items-center gap-1.5 text-ink transition-colors group-hover:text-accent">
                      {dict.common.caseStudy}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="mt-16">
        <Button href={`/${locale}/work`} variant="outline">
          {dict.common.seeAll}
        </Button>
      </div>
    </section>
  );
}
