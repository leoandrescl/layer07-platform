import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/ui/PageHero";
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
      <PageHero
        path="/contacto"
        title="Establecer Comunicación Directa"
        description="Formulario con Resend + validación en tiempo real. También canales directos abajo."
      />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="form" title="Nueva transmisión" />
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>

        <div>
          <SectionHeading eyebrow="canales" title="Datos corporativos" />
          <ul className="mt-8 space-y-4 wired-frame p-5 font-mono text-sm text-[#8fb8b0]">
            <li>
              <span className="text-[#00f0ff]">email</span> ·{" "}
              <a href={`mailto:${SITE.email}`} className="hover:text-[#7fffd4]">
                {SITE.email}
              </a>
            </li>
            <li>
              <span className="text-[#00f0ff]">tel</span> ·{" "}
              <a href={`tel:${SITE.phone}`} className="hover:text-[#7fffd4]">
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <span className="text-[#00f0ff]">wa</span> ·{" "}
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7fffd4]"
              >
                Abrir WhatsApp
              </a>
            </li>
            <li>
              <span className="text-[#00f0ff]">geo</span> · {SITE.location}
            </li>
            <li>
              <span className="text-[#00f0ff]">net</span> ·{" "}
              <a
                href={SITE.social.github}
                className="hover:text-[#7fffd4]"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              {" / "}
              <a
                href={SITE.social.linkedin}
                className="hover:text-[#7fffd4]"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </ul>

          <div className="mt-10">
            <SectionHeading eyebrow="faq" title="Pre-contacto" />
            <Accordion className="mt-6" items={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
