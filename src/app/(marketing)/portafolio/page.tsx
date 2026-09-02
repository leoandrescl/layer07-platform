import type { Metadata } from "next";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
import { PageHero } from "@/components/ui/PageHero";
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
      <PageHero
        path="/portafolio"
        title="Catálogo de sistemas en producción"
        description="Galería de nodos desplegados. Filtra por categoría y entra a cada caso de estudio."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PortfolioGrid projects={projects} />
      </section>

      {testimonials.length > 0 ? (
        <section className="border-t border-dashed border-[#00ff66]/25 bg-black/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <SectionHeading eyebrow="feedback" title="Stakeholders & founders" />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <blockquote
                  key={t.id}
                  className="wired-frame p-5 font-mono text-sm text-[#8fb8b0]"
                >
                  <p>&quot;{t.quote}&quot;</p>
                  <footer className="mt-4 font-mono text-[10px] tracking-widest text-[#00f0ff] uppercase">
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
        cta="cotizar similar"
      />
    </>
  );
}
