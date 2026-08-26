import type { Metadata } from "next";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProjects, getTestimonials } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "Portafolio",
  description:
    "Catálogo de sistemas desplegados: a medida, headless e-commerce e integraciones API.",
};

export default function PortafolioPage() {
  const projects = getProjects();
  const testimonials = getTestimonials();

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-neon uppercase">
            /portafolio
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl tracking-tight text-foreground sm:text-4xl">
            Catálogo de sistemas en producción
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-dim sm:text-base">
            Galería de nodos desplegados. Filtra por categoría y entra a cada
            caso de estudio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PortfolioGrid projects={projects} />
      </section>

      {testimonials.length > 0 ? (
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHeading eyebrow="Feedback" title="Stakeholders & founders" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="border border-border bg-background/60 p-5 text-sm text-muted-dim"
                >
                  <p>&quot;{t.quote}&quot;</p>
                  <footer className="mt-4 font-mono text-[10px] tracking-widest text-cyan uppercase">
                    {t.author} · {t.role}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaTerminal
        title="¿Proyecto similar?"
        command="estimate --from portafolio"
        cta="Cotizar similar"
      />
    </>
  );
}
