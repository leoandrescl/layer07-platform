import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Establecer comunicación directa con layer07 — formularios, WhatsApp y email.",
};

const faq = [
  {
    id: "c1",
    question: "¿Qué información acelerará la reunión?",
    answer:
      "Objetivo del sistema, stack actual, deadline, integraciones (ERP/POS/Shopify) y presupuesto aproximado.",
  },
  {
    id: "c2",
    question: "¿Trabajan solo en Santiago?",
    answer:
      "Base en Santiago, Chile. Delivery remoto para LatAm y equipos distribuidos.",
  },
  {
    id: "c3",
    question: "¿Cuándo responderán?",
    answer:
      "Canal prioritario email/WhatsApp en horario hábil. Confirmamos recepción y siguiente paso técnico.",
  },
];

export default function ContactoPage() {
  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-neon uppercase">
            /contacto
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl tracking-tight text-foreground sm:text-4xl">
            Establecer Comunicación Directa
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-dim sm:text-base">
            Formulario con Resend + validación en tiempo real. También canales
            directos abajo.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Form" title="Nueva transmisión" />
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="Canales" title="Datos corporativos" />
          <ul className="mt-8 space-y-4 border border-border bg-surface/50 p-5 font-mono text-sm text-muted-dim">
            <li>
              <span className="text-cyan">email</span> ·{" "}
              <a href={`mailto:${SITE.email}`} className="hover:text-neon">
                {SITE.email}
              </a>
            </li>
            <li>
              <span className="text-cyan">tel</span> ·{" "}
              <a href={`tel:${SITE.phone}`} className="hover:text-neon">
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <span className="text-cyan">wa</span> ·{" "}
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neon"
              >
                Abrir WhatsApp
              </a>
            </li>
            <li>
              <span className="text-cyan">geo</span> · {SITE.location}
            </li>
            <li>
              <span className="text-cyan">net</span> ·{" "}
              <a href={SITE.social.github} className="hover:text-neon" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              {" / "}
              <a href={SITE.social.linkedin} className="hover:text-neon" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
          </ul>

          <div className="mt-10">
            <SectionHeading eyebrow="FAQ" title="Pre-contacto" />
            <Accordion className="mt-6" items={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
