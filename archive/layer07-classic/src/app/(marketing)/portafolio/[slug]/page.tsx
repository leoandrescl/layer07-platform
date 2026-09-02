import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import {
  CATEGORY_LABELS,
  getAdjacentProjects,
  getProjectBySlug,
  getProjects,
} from "@/lib/data/content";

type Props = PageProps<"/portafolio/[slug]">;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Proyecto" };
  return {
    title: project.title,
    description: project.excerpt,
    openGraph: {
      title: `${project.title} · layer07`,
      description: project.excerpt,
    },
  };
}

export default async function ProjectCasePage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const { prev, next } = getAdjacentProjects(slug);

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-neon uppercase">
            /portafolio/{project.slug}
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-widest text-cyan uppercase">
            {project.client} · {CATEGORY_LABELS[project.category]} ·{" "}
            {project.year}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl tracking-tight text-foreground sm:text-4xl">
            {project.title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-dim">
            {project.excerpt}
          </p>
          {project.liveUrl || project.repoUrl ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl ? (
                <NeonButton href={project.liveUrl} external variant="cyan">
                  Live Preview
                </NeonButton>
              ) : null}
              {project.repoUrl ? (
                <NeonButton href={project.repoUrl} external variant="ghost">
                  GitHub
                </NeonButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="font-mono text-[10px] tracking-[0.25em] text-muted-dim uppercase">
          Stack & servicios
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="border border-neon/30 bg-neon/5 px-3 py-1.5 font-mono text-[11px] tracking-wider text-neon uppercase transition-shadow hover:shadow-neon"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {project.metrics.map((m) => (
            <div
              key={m.label}
              className="border border-border bg-background/60 px-5 py-6 text-center"
            >
              <p className="font-mono text-3xl text-neon text-glow-neon">
                {m.value}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-muted-dim uppercase">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-2">
        <TerminalPanel title="log://challenge">
          <SectionHeading title="Desafío" />
          <p className="mt-4 text-sm leading-relaxed text-muted-dim">
            {project.challenge}
          </p>
        </TerminalPanel>
        <TerminalPanel title="log://solution">
          <SectionHeading title="Solución" />
          <p className="mt-4 text-sm leading-relaxed text-muted-dim">
            {project.solution}
          </p>
        </TerminalPanel>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="Showcase"
          title="Mockups responsivos"
          description="Vistas desktop / mobile del sistema en producción."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div
            className={`flex min-h-56 items-end border border-border bg-gradient-to-br ${project.coverGradient} p-5`}
          >
            <span className="font-mono text-[10px] tracking-widest text-cyan uppercase">
              Desktop viewport
            </span>
          </div>
          <div className="mx-auto flex min-h-56 w-full max-w-xs items-end border border-border bg-surface p-5 md:mx-0">
            <span className="font-mono text-[10px] tracking-widest text-magenta uppercase">
              Mobile viewport
            </span>
          </div>
        </div>
      </section>

      {project.testimonial ? (
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <p className="font-mono text-[10px] tracking-[0.28em] text-neon uppercase">
              Cita del cliente
            </p>
            <blockquote className="mt-6 text-lg leading-relaxed text-muted">
              &quot;{project.testimonial.quote}&quot;
            </blockquote>
            <p className="mt-4 font-mono text-xs tracking-widest text-cyan uppercase">
              {project.testimonial.author} · {project.testimonial.role}
            </p>
          </div>
        </section>
      ) : null}

      <nav className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-6 font-mono text-xs sm:px-6">
          {prev ? (
            <Link
              href={`/portafolio/${prev.slug}`}
              className="text-muted-dim hover:text-neon"
            >
              ← Nodo previo · {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/portafolio/${next.slug}`}
              className="text-right text-muted-dim hover:text-neon"
            >
              Siguiente nodo · {next.title} →
            </Link>
          ) : null}
        </div>
      </nav>
    </>
  );
}
