import Link from "next/link";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
import { NeonButton } from "@/components/ui/NeonButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { TypeLine } from "@/components/ui/TypeLine";
import { getFeaturedProjects, getTestimonials } from "@/lib/data/content";
import { SITE } from "@/lib/site";

const services = [
  {
    code: "01",
    title: "Sistemas & Web Apps A Medida",
    body: "Productos digitales propietarios: paneles, portales B2B, backends y flujos críticos con ownership total del código.",
  },
  {
    code: "02",
    title: "Headless E-commerce & Storefronts",
    body: "Shopify Storefront API, WooCommerce custom y storefronts Next.js orientados a conversión y Core Web Vitals.",
  },
];

const kpis = [
  { label: "LCP target", value: "< 1s" },
  { label: "Uptime", value: "99.9%" },
  { label: "Producción", value: `${SITE.founder.years} años` },
];

const differentiators = [
  {
    title: "Código Propietario A Medida",
    body: "Sin plantillas genéricas. Arquitectura alineada al dominio del negocio.",
  },
  {
    title: "Ownership End-to-End",
    body: "UI, API, datos e infra en un solo lead técnico responsable.",
  },
  {
    title: "Infraestructura Cloud Dedicada",
    body: "AWS Lightsail / DigitalOcean con despliegues predecibles y observabilidad.",
  },
  {
    title: "Arquitectura Escalable",
    body: "Contratos claros, integraciones resilientes y crecimiento sin reescritura total.",
  },
];

export default function HomePage() {
  const featured = getFeaturedProjects(3);
  const testimonials = getTestimonials();

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,102,0.08),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-neon/10 to-transparent opacity-40"
          aria-hidden
        />
        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
          <p className="font-mono text-[11px] tracking-[0.35em] text-neon uppercase text-glow-neon">
            {SITE.name}
          </p>
          <h1 className="mt-5 max-w-4xl text-3xl leading-tight font-medium tracking-tight text-foreground sm:text-5xl">
            {SITE.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-dim sm:text-base">
            Ingeniería full stack para sistemas a medida, e-commerce headless e
            integraciones API. Liderado por {SITE.founder.name}.
          </p>
          <div className="mt-6">
            <TypeLine text="boot --module engineering --mode production" />
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <NeonButton href="/contacto">Iniciar conexión</NeonButton>
            <NeonButton href="/portafolio" variant="ghost">
              Ver nodos en producción
            </NeonButton>
          </div>
          <p className="mt-10 font-mono text-[11px] tracking-widest text-muted-dim uppercase">
            <span className="text-cyan">session</span> · dark · edge · scl
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Servicios"
          title="Dos líneas de ingeniería"
          description="Sin ruido de marketing: solo software, commerce e integraciones."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <TerminalPanel key={s.code} title={`svc://${s.code}`}>
              <p className="font-mono text-[10px] tracking-widest text-cyan uppercase">
                MODULE {s.code}
              </p>
              <h3 className="mt-3 text-lg text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-dim">{s.body}</p>
              <Link
                href="/servicios"
                className="mt-5 inline-block font-mono text-[11px] tracking-widest text-neon uppercase hover:text-glow-neon"
              >
                Spec completa →
              </Link>
            </TerminalPanel>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="border border-border/80 bg-background/50 px-5 py-6 text-center"
            >
              <p className="font-mono text-3xl text-neon text-glow-neon sm:text-4xl">
                {kpi.value}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-muted-dim uppercase">
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Diferenciación"
          title="Por qué este nodo"
          description="Criterios técnicos, no promesas de campañas."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {differentiators.map((item, i) => (
            <div
              key={item.title}
              className="border border-border bg-surface/50 p-5 transition-colors hover:border-neon/40"
            >
              <p className="font-mono text-[10px] text-magenta tracking-widest">
                DIF_{String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-base text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-dim">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Casos"
          title="Nodos en producción"
          description="Top proyectos desplegados — edita en content.ts."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {featured.map((project) => (
            <Link
              key={project.slug}
              href={`/portafolio/${project.slug}`}
              className="group border border-border bg-surface/60 transition-shadow hover:border-cyan/50 hover:shadow-cyan"
            >
              <div
                className={`flex h-36 items-end bg-gradient-to-br ${project.coverGradient} p-4`}
              >
                <span className="font-mono text-[10px] tracking-widest text-cyan uppercase">
                  {project.year} · {project.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-base text-foreground group-hover:text-neon">
                  {project.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-dim">
                  {project.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="Logs"
              title="Testimonios // console"
              description="Feedback de stakeholders en formato log."
            />
            <div className="mt-10 space-y-3 font-mono text-xs sm:text-sm">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="border border-border bg-background/70 px-4 py-4 text-muted-dim"
                >
                  <p className="text-neon">
                    [{t.id}] auth={t.author.replace(/\s/g, "_").toLowerCase()}
                  </p>
                  <p className="mt-1 text-cyan">{t.role}</p>
                  <p className="mt-3 leading-relaxed text-muted">&quot;{t.quote}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaTerminal
        title="¿Listo para iniciar conexión?"
        command="open /contacto --priority high"
        cta="Ir a contacto"
      />
    </>
  );
}
