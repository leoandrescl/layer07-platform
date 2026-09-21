import Link from "next/link";
import { ProjectVisual } from "@/components/ui/ProjectVisual";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProjects } from "@/lib/content/projects";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const SPANS = [
  "lg:col-span-7",
  "lg:col-span-5 lg:mt-24",
  "lg:col-span-5",
  "lg:col-span-7 lg:mt-24",
];

export function WorkPreview({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const projects = getFeaturedProjects(4);

  return (
    <section data-field="0.22" className="shell py-24 md:py-32">
      <Reveal>
        <SectionHeading
          eyebrow={dict.home.work.eyebrow}
          title={dict.home.work.title}
          intro={dict.home.work.intro}
        />
      </Reveal>

      <div className="mt-16 grid gap-x-8 gap-y-16 lg:grid-cols-12">
        {projects.map((project, index) => (
          <Reveal
            key={project.slug}
            delay={0.05}
            className={SPANS[index % SPANS.length]}
          >
            <Link
              href={`/${locale}/work/${project.slug}`}
              className="group block"
            >
              <ProjectVisual project={project} locale={locale} />
              <div className="mt-6 flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-display text-2xl tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                    {project.title[locale]}
                  </h3>
                  <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
                    {project.excerpt[locale]}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                  {project.year}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.slice(0, 3).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.1em] text-ink-muted uppercase"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="mt-16">
        <Button href={`/${locale}/work`} variant="outline">
          {dict.common.seeAll}
        </Button>
      </div>
    </section>
  );
}
