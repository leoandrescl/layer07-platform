import type { Metadata } from "next";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Ingeniería independiente liderada por Leonardo Contreras — 8+ años entregando software en producción.",
};

const pillars = [
  {
    title: "Código limpio",
    body: "Legible, testeable y fácil de extender por tu equipo interno.",
  },
  {
    title: "Cero dependencias innecesarias",
    body: "Cada librería debe justificar peso, riesgo y mantenimiento.",
  },
  {
    title: "Velocidad de carga",
    body: "Performance budget real: LCP, TTFB y assets bajo control.",
  },
  {
    title: "Transparencia técnica",
    body: "Decisiones documentadas, trade-offs explícitos, acceso total.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        path="/nosotros"
        title="Ingeniería independiente con ownership completo"
        description={`${SITE.name} es el estudio técnico de ${SITE.founder.name}: Product Engineer con foco en sistemas que sobreviven al lanzamiento.`}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="historia"
          title="Visión de nodo"
          description={`${SITE.founder.years} años entregando software funcional en producción — no demos descartables.`}
        />
        <p className="mt-8 max-w-3xl font-mono text-sm leading-relaxed text-[#8fb8b0] sm:text-base">
          De storefronts headless a torres de control operacionales: el hilo
          conductor es ownership. Un lead que une UI, backend, datos y cloud
          sin fragmentar la responsabilidad entre agencias.
        </p>
      </section>

      <section className="border-y border-dashed border-[#00ff66]/25 bg-black/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="manifiesto" title="Cuatro principios" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <div key={p.title} className="wired-frame p-5">
                <p className="font-mono text-[10px] tracking-widest text-[#00f0ff]">
                  PILLAR_{String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-sans mt-3 tracking-[0.04em] text-[#e8fff8] lowercase">
                  {p.title}
                </h3>
                <p className="mt-2 font-mono text-sm text-[#8fb8b0]">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="valor"
          title="Product Engineer, no intermediario"
          description="UI, backend, DB y cloud bajo un mismo criterio de calidad."
        />
        <TerminalPanel className="mt-10" title="user://leonardo-contreras">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-[#7fffd4] uppercase">
                Lead Engineer
              </p>
              <h2 className="font-sans mt-2 text-2xl tracking-[0.06em] text-[#e8fff8] lowercase">
                {SITE.founder.name}
              </h2>
              <p className="mt-2 font-mono text-sm text-[#8fb8b0]">{SITE.founder.role}</p>
              <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-[#8fb8b0]">
                Especialista en Next.js, TypeScript, GraphQL, Shopify
                (Liquid/Storefront API), WooCommerce a medida, AWS Lightsail y
                DigitalOcean.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px]">
                <a
                  href={SITE.social.github}
                  className="text-[#00f0ff] hover:text-[#7fffd4]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [GitHub]
                </a>
                <a
                  href={SITE.social.linkedin}
                  className="text-[#00f0ff] hover:text-[#7fffd4]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [LinkedIn]
                </a>
                <a href={`mailto:${SITE.email}`} className="text-[#00f0ff] hover:text-[#7fffd4]">
                  [Email]
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
              {SITE.founder.stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-dashed border-[#00ff66]/25 px-2 py-1 font-mono text-[10px] tracking-wider text-[#8fb8b0] uppercase"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </TerminalPanel>
      </section>

      <CtaTerminal title="Hablar con el lead engineer" cta="abrir contacto" />
    </>
  );
}
