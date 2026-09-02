import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { CtaTerminal } from "@/components/shared/CtaTerminal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TerminalPanel } from "@/components/ui/TerminalPanel";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Software y e-commerce a medida, arquitectura web de alto rendimiento e integraciones API.",
};

const process = [
  {
    step: "01",
    title: "Discovery & Modelado",
    body: "Dominio, constrains, contratos de datos y criterios de éxito medibles.",
  },
  {
    step: "02",
    title: "Arquitectura & UI",
    body: "Diseño de sistema, stack, performance budget y prototipo de interfaz.",
  },
  {
    step: "03",
    title: "Desarrollo & Integración API",
    body: "Implementación Next.js/TS, APIs, CMS y sincronización con sistemas externos.",
  },
  {
    step: "04",
    title: "Deploy & Soporte",
    body: "CI/CD, hardening, monitoreo y SLA de evolución post-lanzamiento.",
  },
];

const faq = [
  {
    id: "f1",
    question: "¿Qué entregables incluye un engagement?",
    answer:
      "Código fuente, infra documentada, entornos, runbooks y handoff técnico. Sin cajas negras.",
  },
  {
    id: "f2",
    question: "¿Quién es dueño del código?",
    answer:
      "El cliente. Trabajamos con ownership claro: repositorios, accesos cloud y licencias a tu nombre.",
  },
  {
    id: "f3",
    question: "¿Ofrecen SLA y soporte?",
    answer:
      "Sí. Definimos ventanas de respuesta, severidades y backlog de mejoras según criticidad del sistema.",
  },
  {
    id: "f4",
    question: "¿Hacen marketing, ads o RRSS?",
    answer:
      "No. El foco es 100% ingeniería: web, headless e-commerce, sistemas a medida e integraciones API.",
  },
];

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        path="/servicios"
        title="Ingeniería de software aplicada a producto y commerce"
        description="Oferta centrada en sistemas que cargan rápido, integran bien y se pueden operar en producción."
      />

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-2">
        <TerminalPanel title="spec://ecommerce">
          <h2 className="font-sans text-xl tracking-[0.04em] text-[#e8fff8] lowercase">
            Software & E-commerce A Medida
          </h2>
          <ul className="mt-4 space-y-2 font-mono text-sm text-[#8fb8b0]">
            <li>• Next.js App Router storefronts</li>
            <li>• Shopify Liquid / Storefront API</li>
            <li>• WooCommerce custom</li>
            <li>• POS, dashboards y portales B2B</li>
          </ul>
        </TerminalPanel>
        <TerminalPanel title="spec://performance">
          <h2 className="font-sans text-xl tracking-[0.04em] text-[#e8fff8] lowercase">
            Arquitectura Web & Performance
          </h2>
          <ul className="mt-4 space-y-2 font-mono text-sm text-[#8fb8b0]">
            <li>• Next.js + TypeScript + Tailwind</li>
            <li>• GraphQL / REST contracts</li>
            <li>• Core Web Vitals con LCP &lt; 1s</li>
            <li>• Edge, caching y observabilidad</li>
          </ul>
        </TerminalPanel>
      </section>

      <section className="border-y border-dashed border-[#00ff66]/25 bg-black/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="metodología"
            title="Workflow en 4 fases"
            description="De discovery a soporte sin saltos opacos."
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((p) => (
              <li key={p.step} className="wired-frame p-5">
                <p className="font-mono text-[#7fffd4] text-glow-neon">{p.step}</p>
                <h3 className="font-sans mt-3 text-sm tracking-[0.04em] text-[#e8fff8] lowercase">
                  {p.title}
                </h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-[#8fb8b0]">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="faq"
          title="Preguntas frecuentes"
          description="Entregables, propiedad del código, SLA y alcance."
        />
        <Accordion className="mt-10" items={faq} />
      </section>

      <CtaTerminal
        title="Solicitar cotización técnica"
        command="quote --route /contacto"
        cta="cotizar ahora"
      />
    </>
  );
}
