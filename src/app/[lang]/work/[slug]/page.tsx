import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectVisual } from "@/components/ui/ProjectVisual";
import { Reveal } from "@/components/ui/Reveal";
import {
  CATEGORY_LABELS,
  getAdjacentProjects,
  getProjectBySlug,
  getProjects,
} from "@/lib/content/projects";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale, locales } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

type Params = { lang: string; slug: string };

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    getProjects().map((project) => ({ lang, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Work" };
  return {
    title: project.title[lang],
    description: project.excerpt[lang],
    alternates: { canonical: `/${lang}/work/${slug}` },
    openGraph: {
      title: `${project.title[lang]} — ${SITE.name}`,
      description: project.excerpt[lang],
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const dict = getDictionary(lang);
  const { prev, next } = getAdjacentProjects(slug);
  const category = CATEGORY_LABELS[project.category][lang];

  const blocks = [
    { label: dict.work.problem, body: project.problem[lang] },
    { label: dict.work.built, body: project.built[lang] },
    { label: dict.work.interactions, body: project.interactions[lang] },
  ];

  return (
    <>
      <PageIntro
        eyebrow={`${project.client} · ${category} · ${project.year}`}
        title={project.title[lang]}
        intro={project.excerpt[lang]}
      >
        {project.liveUrl || project.repoUrl ? (
          <div className="mt-9 flex flex-wrap gap-3">
            {project.liveUrl ? (
              <Button href={project.liveUrl} external>
                {dict.common.liveSite}
              </Button>
            ) : null}
            {project.repoUrl ? (
              <Button href={project.repoUrl} variant="outline" external>
                {dict.common.source}
              </Button>
            ) : null}
          </div>
        ) : null}
      </PageIntro>

      <section className="shell">
        <Reveal>
          <ProjectVisual project={project} locale={lang} />
        </Reveal>
      </section>

      <section className="shell grid gap-px overflow-hidden rounded-2xl border border-line bg-line py-0 md:grid-cols-3 mt-20 md:mt-28">
        {project.metrics.map((metric) => (
          <div key={metric.value} className="bg-bg/70 p-8 backdrop-blur-md">
            <p className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-ink">
              {metric.value}
            </p>
            <p className="eyebrow mt-2">{metric.label[lang]}</p>
          </div>
        ))}
      </section>

      <section className="shell py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.7fr_1.3fr]">
          <h2 className="display-md text-ink">{dict.work.built}</h2>
          <div className="space-y-12">
            {blocks.map((block) => (
              <Reveal key={block.label}>
                <div className="border-t border-line pt-6">
                  <p className="eyebrow">{block.label}</p>
                  <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-soft">
                    {block.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="shell pb-24">
        <p className="eyebrow">{dict.common.stack}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-line px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-soft uppercase"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {project.services[lang].map((service) => (
            <span
              key={service}
              className="rounded-full bg-accent-soft px-3 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] text-accent uppercase"
            >
              {service}
            </span>
          ))}
        </div>
      </section>

      <nav className="border-t border-line">
        <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <Link
              href={`/${lang}/work/${prev.slug}`}
              className="group flex flex-col gap-1"
            >
              <span className="eyebrow">← {dict.work.prevProject}</span>
              <span className="font-display text-xl text-ink transition-colors group-hover:text-accent">
                {prev.title[lang]}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/${lang}/work/${next.slug}`}
              className="group flex flex-col gap-1 sm:items-end sm:text-right"
            >
              <span className="eyebrow">{dict.work.nextProject} →</span>
              <span className="font-display text-xl text-ink transition-colors group-hover:text-accent">
                {next.title[lang]}
              </span>
            </Link>
          ) : null}
        </div>
      </nav>
    </>
  );
}
