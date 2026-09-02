import Link from "next/link";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalPanel } from "@/components/ui/TerminalPanel";
import { ImmersiveHero } from "@/components/home/ImmersiveHero";
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
      <ImmersiveHero />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="servicios"
          title="Dos líneas de ingeniería"
          description="Sin ruido de marketing: solo software, commerce e integraciones."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <TerminalPanel key={s.code} title={`svc://${s.code}`}>
              <p className="font-mono text-[10px] tracking-widest text-[#00f0ff] uppercase">
                MODULE {s.code}
              </p>
              <h3 className="font-sans mt-3 text-lg tracking-[0.04em] text-[#e8fff8] lowercase">
                {s.title}
              </h3>
              <p className="mt-3 font-mono text-sm leading-relaxed text-[#8fb8b0]">
                {s.body}
              </p>
              <Link
                href="/servicios"
                className="mt-5 inline-block font-mono text-[11px] tracking-widest text-[#7fffd4] lowercase hover:text-white"
              >
                spec completa →
              </Link>
            </TerminalPanel>
          ))}
        </div>
      </section>

      <section className="border-y border-dashed border-[#00ff66]/25 bg-black/30">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="wired-frame px-5 py-6 text-center"
            >
              <p className="font-mono text-3xl text-[#7fffd4] text-glow-neon sm:text-4xl">
                {kpi.value}
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-[#8fb8b0] uppercase">
                {kpi.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="diferenciación"
          title="Por qué este nodo"
          description="Criterios técnicos, no promesas de campañas."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {differentiators.map((item, i) => (
            <div
              key={item.title}
              className="wired-frame p-5 transition-colors hover:border-[#7fffd4]/40"
            >
              <p className="font-mono text-[10px] tracking-widest text-[#ff0055]/80">
                DIF_{String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-sans mt-3 text-base tracking-[0.04em] text-[#e8fff8] lowercase">
                {item.title}
              </h3>
              <p className="mt-2 font-mono text-sm text-[#8fb8b0]">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="casos"
          title="Nodos en producción"
          description="Top proyectos desplegados — edita en content.ts."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {featured.map((project) => (
            <Link
              key={project.slug}
              href={`/portafolio/${project.slug}`}
              className="group wired-frame transition-colors hover:border-[#00f0ff]/40"
            >
              <div
                className={`flex h-36 items-end bg-gradient-to-br ${project.coverGradient} p-4`}
              >
                <span className="font-mono text-[10px] tracking-widest text-[#7fffd4] uppercase">
                  {project.year} · {project.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-sans text-base tracking-[0.04em] text-[#e8fff8] lowercase group-hover:text-[#7fffd4]">
                  {project.title}
                </h3>
                <p className="mt-2 line-clamp-3 font-mono text-sm text-[#8fb8b0]">
                  {project.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {testimonials.length > 0 ? (
        <section className="border-t border-dashed border-[#00ff66]/25 bg-black/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <SectionHeading
              eyebrow="logs"
              title="Testimonios // console"
              description="Feedback de stakeholders en formato log."
            />
            <div className="mt-10 space-y-3 font-mono text-xs sm:text-sm">
              {testimonials.map((t) => (
                <div key={t.id} className="wired-frame px-4 py-4 text-[#8fb8b0]">
                  <p className="text-[#00ff66]">
                    [{t.id}] auth={t.author.replace(/\s/g, "_").toLowerCase()}
                  </p>
                  <p className="mt-1 text-[#00f0ff]">{t.role}</p>
                  <p className="mt-3 leading-relaxed text-[#c8efe6]">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaTerminal
        title="¿Listo para iniciar conexión?"
        command="open /contacto --priority high"
        cta="ir a contacto"
      />
    </>
  );
}
