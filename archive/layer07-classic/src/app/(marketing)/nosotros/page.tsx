import type { Metadata } from "next";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
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
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-neon uppercase">
            /nosotros
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl tracking-tight text-foreground sm:text-4xl">
            Ingeniería independiente con ownership completo
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-dim sm:text-base">
            {SITE.name} es el estudio técnico de {SITE.founder.name}: Product
            Engineer con foco en sistemas que sobreviven al lanzamiento.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Historia"
          title="Visión de nodo"
          description={`${SITE.founder.years} años entregando software funcional en producción — no demos descartables.`}
        />
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-dim sm:text-base">
          De storefronts headless a torres de control operacionales: el hilo
          conductor es ownership. Un lead que une UI, backend, datos y cloud
          sin fragmentar la responsabilidad entre agencias.
        </p>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="Manifiesto" title="Cuatro principios" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <div key={p.title} className="border border-border bg-background/50 p-5">
                <p className="font-mono text-[10px] tracking-widest text-cyan">
                  PILLAR_{String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-dim">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Valor"
          title="Product Engineer, no intermediario"
          description="UI, backend, DB y cloud bajo un mismo criterio de calidad."
        />
        <TerminalPanel className="mt-10" title="user://leonardo-contreras">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-neon uppercase">
                Lead Engineer
              </p>
              <h2 className="mt-2 text-2xl text-foreground">{SITE.founder.name}</h2>
              <p className="mt-2 text-sm text-muted-dim">{SITE.founder.role}</p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-dim">
                Especialista en Next.js, TypeScript, GraphQL, Shopify
                (Liquid/Storefront API), WooCommerce a medida, AWS Lightsail y
                DigitalOcean.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px]">
                <a
                  href={SITE.social.github}
                  className="text-cyan hover:text-neon"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [GitHub]
                </a>
                <a
                  href={SITE.social.linkedin}
                  className="text-cyan hover:text-neon"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  [LinkedIn]
                </a>
                <a href={`mailto:${SITE.email}`} className="text-cyan hover:text-neon">
                  [Email]
                </a>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
              {SITE.founder.stack.map((tech) => (
                <span
                  key={tech}
                  className="border border-border px-2 py-1 text-[10px] tracking-wider text-muted-dim uppercase"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </TerminalPanel>
      </section>

      <CtaTerminal title="Hablar con el lead engineer" cta="Abrir contacto" />
    </>
  );
}
