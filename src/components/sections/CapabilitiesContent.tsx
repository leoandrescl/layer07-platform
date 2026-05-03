import type { ReactNode } from "react";
import Link from "next/link";
import {
  CONTACT,
  CONTACT_MAILTO_HREF,
  CONTACT_TEL_HREF,
  CONTACT_WA_HREF,
} from "@/constants/contact";

/** Línea doble suave (sin border pegado al texto). */
function SectionRule() {
  return (
    <div className="max-w-3xl" aria-hidden="true">
      <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent" />
      <div className="mt-px h-px bg-gradient-to-r from-transparent via-zinc-600/35 to-transparent opacity-80" />
    </div>
  );
}

function Section({
  id,
  kicker,
  title,
  children,
  isFirst = false,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
  /** Sin línea previa: primera sección bajo el encabezado de página. */
  isFirst?: boolean;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      {!isFirst ? (
        <div className="mt-20 md:mt-28 mb-12 md:mb-16">
          <SectionRule />
        </div>
      ) : null}
      <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-emerald-500/60 mb-4">
        {kicker}
      </p>
      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white uppercase leading-tight max-w-4xl">
        {title}
      </h2>
      <div className="mt-8 md:mt-10 space-y-5 md:space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed max-w-3xl">
        {children}
      </div>
    </section>
  );
}

function CvList({ items }: { items: string[] }) {
  return (
    <ul className="list-none pl-0 space-y-3 md:space-y-3.5 text-zinc-400">
      {items.map((line, i) => (
        <li key={i} className="flex gap-4">
          <span
            className="text-emerald-500/80 shrink-0 font-mono text-sm leading-relaxed w-6 text-center select-none"
            aria-hidden
          >
            ·
          </span>
          <span className="min-w-0 leading-relaxed">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function ReferenceCard({
  domain,
  href,
  children,
}: {
  domain: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <article className="border border-zinc-800 bg-zinc-950/40 p-6 md:p-8 hover:border-emerald-500/25 transition-colors">
      <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-zinc-600 underline-offset-4 hover:decoration-emerald-500/60 hover:text-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {domain}
        </a>
      </h3>
      <div className="mt-5 space-y-4 text-zinc-400 text-sm md:text-[15px] leading-relaxed">{children}</div>
    </article>
  );
}

function StackLine({ items }: { items: string[] }) {
  return (
    <p className="font-mono text-[11px] md:text-[12px] text-zinc-500 uppercase tracking-wider border-l border-emerald-500/35 pl-4 mt-5 leading-relaxed">
      {items.join(" · ")}
    </p>
  );
}

export const CapabilitiesContent = () => {
  return (
    <article className="max-w-7xl mx-auto px-6 md:px-8 pt-24 md:pt-28 pb-24 md:pb-32">
      <header className="pt-2 md:pt-4 pb-4 md:pb-6">
        <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-emerald-500/60 mb-5">
          Layer07 Studio
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
          {CONTACT.name.toUpperCase()}
        </h1>
        <p className="mt-5 text-base md:text-lg text-zinc-300 font-medium tracking-tight max-w-3xl leading-snug">
          {CONTACT.roleTitle}
        </p>
        <p className="mt-4 text-sm md:text-base text-zinc-500 font-mono leading-relaxed">
          {CONTACT.location}
          <span className="text-zinc-600 mx-2" aria-hidden>
            |
          </span>
          <a href={CONTACT_TEL_HREF} className="hover:text-emerald-300 transition-colors">
            {CONTACT.phoneDisplay}
          </a>
          <span className="text-zinc-600 mx-2" aria-hidden>
            |
          </span>
          <a href={CONTACT_MAILTO_HREF} className="hover:text-emerald-300 transition-colors break-all">
            {CONTACT.email}
          </a>
        </p>
        <div className="mt-12 md:mt-16">
          <SectionRule />
        </div>
      </header>

      <div className="mt-10 md:mt-12">
        <Section id="resumen" isFirst kicker="Resumen" title="Perfil profesional">
          <p>
            Ingeniero en Informática con ocho años de experiencia técnica en el desarrollo y el
            despliegue de plataformas e-commerce de alta disponibilidad. Combino interfaces de alta
            fidelidad con una base sólida full stack: desde temas y plantillas a medida hasta
            administración de infraestructura en la nube (AWS Lightsail, DigitalOcean).
          </p>
          <p>
            Extiendo WordPress y Shopify con código a medida para lograr soluciones escalables,
            seguras y orientadas al rendimiento. En proyectos por encargo incorporo arquitecturas
            desacopladas (headless) con Next.js (App Router) y GraphQL cuando el requerimiento lo
            amerita.
          </p>
          <p className="text-zinc-500 text-[15px]">
            Uso herramientas de apoyo con IA en especificación, scaffolding y revisión para ganar
            velocidad en tareas repetibles; arquitectura, seguridad y calidad siguen bajo criterio
            humano y revisión explícita.
          </p>
        </Section>

        <Section id="experiencia" kicker="Trayectoria" title="Experiencia laboral">
          <div className="space-y-10 md:space-y-12">
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                Senior Full Stack Developer · ANTDIGITAL
              </h3>
              <p className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
                2019 – Actualidad
              </p>
              <CvList
                items={[
                  "Desarrollo de temas y plantillas: creación de temas personalizados en WordPress y modificación profunda de plantillas Shopify en Liquid, con arquitectura ordenada y alineación a diseño en Figma.",
                  "Ingeniería de plugins y snippets: ajustes técnicos a plugins y funciones a medida en PHP y code snippets para checkout, filtros dinámicos y lógica de negocio.",
                  "Gestión de infraestructura y DNS: despliegue, zonas DNS (incluye NIC Chile), servidores en DigitalOcean y AWS Lightsail, y operación en entornos Linux.",
                  "Ecosistema WordPress avanzado: Elementor, ACF y Crocoblock (JetEngine, JetSmartFilters), con personalización donde el editor visual no alcanza.",
                  "Arquitecturas modernas (headless): aplicaciones desacopladas con Next.js (App Router) y GraphQL, conectando frontends de alto rendimiento con motores Shopify y WordPress.",
                ]}
              />
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                Web Developer · AUTOMASTER
              </h3>
              <p className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
                2018 – 2019
              </p>
              <CvList
                items={[
                  "Desarrollo de tiendas online en PrestaShop y componentes a medida con HTML, CSS y JavaScript.",
                ]}
              />
            </div>
          </div>
        </Section>

        <Section id="stack" kicker="Stack" title="Stack técnico e infraestructura">
          <CvList
            items={[
              "E-commerce y CMS: WordPress (temas y plantillas custom), Shopify (Liquid), WooCommerce, PrestaShop.",
              "Herramientas de desarrollo: Elementor, ACF, Crocoblock (JetEngine, JetSmartFilters, JetSearch), Code Snippets.",
              "Frontend y stack moderno: Next.js (App Router), React, GraphQL, Tailwind CSS.",
              "Lenguajes: PHP (avanzado), JavaScript (ES6+), HTML5, CSS3 / SASS, SQL.",
              "Infraestructura: AWS Lightsail, DigitalOcean, gestión de DNS (NIC.cl), Git, Linux y Windows Server.",
              "Diseño: Figma, Adobe XD, Photoshop.",
            ]}
          />
        </Section>

        <Section id="educacion" kicker="Formación" title="Educación">
          <CvList
            items={[
              "Ingeniero en Informática · INACAP, Santiago (2020).",
              "Licenciado en Informática · INACAP, Santiago (2019).",
            ]}
          />
        </Section>

        <Section id="referencias" kicker="Referencias" title="Proyectos publicados">
          <p>
            Sitios en producción que podés revisar en línea. Donde hay cifras, corresponden al
            trabajo descrito y al contexto del encargo.
          </p>

          <div className="mt-10 space-y-6 md:space-y-8 max-w-4xl">
            <ReferenceCard domain="chanchimercado.cl" href="https://chanchimercado.cl">
              <p>
                Producto web tipo libreta de fiados: interfaz, estado en cliente, persistencia y
                almacenamiento en la nube, experiencia instalable (PWA).
              </p>
              <StackLine
                items={[
                  "Next.js 16 App Router",
                  "React 19",
                  "TypeScript",
                  "Tailwind 4",
                  "Zustand",
                  "Supabase Postgres + Storage",
                  "PWA",
                  "Framer Motion",
                  "@dnd-kit",
                  "Sonner",
                  "Vercel",
                ]}
              />
            </ReferenceCard>

            <ReferenceCard domain="basko.cl" href="https://basko.cl">
              <p>
                WooCommerce: integración masiva de reseñas a partir de datos públicos de listado
                (Falabella) y Bazaarvoice, con matching automático y revisión manual donde
                correspondía. Plugin propio, Woo REST API, import por Customer Reviews CSV y texto
                legal asociado a Fcom.
              </p>
              <p className="text-zinc-500 text-[13px] md:text-sm leading-relaxed">
                Escala del orden de mil seiscientos registros de reseñas integrados; puesta en
                marcha en aproximadamente dos días hábiles una vez cerrados los criterios de
                emparejamiento.
              </p>
              <StackLine items={["WooCommerce", "WordPress", "PHP", "Plugin a medida", "REST API"]} />
            </ReferenceCard>

            <ReferenceCard domain="bytamarajewels.cl" href="https://bytamarajewels.cl">
              <p>
                Joyería en Shopify con storefront desacoplado: experiencia de catálogo y compra con
                frontend propio, priorizando velocidad, SEO técnico y mantenibilidad del código.
              </p>
              <StackLine
                items={[
                  "Shopify",
                  "Storefront API",
                  "Next.js",
                  "React",
                  "TypeScript",
                  "Tailwind CSS",
                ]}
              />
            </ReferenceCard>

            <ReferenceCard domain="allisone.cl" href="https://allisone.cl">
              <p>
                WooCommerce como motor de comercio con capa de presentación desacoplada: datos vía
                API, navegación fluida y entrega estática o incremental según el módulo.
              </p>
              <StackLine
                items={["WooCommerce", "WordPress", "REST / APIs", "Next.js", "TypeScript"]}
              />
            </ReferenceCard>
          </div>

          <p className="mt-10 leading-relaxed">
            Además desarrollo sitios WordPress con temas PHP cien por ciento a medida cuando el
            proyecto lo exige; no los listo acá si no hay URL pública asociada.
          </p>
        </Section>

        <footer className="mt-20 md:mt-28">
          <div className="mb-12 md:mb-16">
            <SectionRule />
          </div>
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-emerald-500/50 mb-5">
            Contacto
          </p>
          <p className="text-zinc-400 max-w-2xl mb-8 leading-relaxed">
            Si tenés un requerimiento concreto (plataforma, URL, plazo), coordinamos por briefing o
            por los canales de abajo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#contact"
              className="inline-flex items-center justify-center px-6 py-3 text-[11px] font-mono uppercase tracking-[0.2em] bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Ir al briefing
            </Link>
            <a
              href={CONTACT_WA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              WhatsApp
            </a>
            <a
              href={CONTACT_MAILTO_HREF}
              className="inline-flex items-center justify-center px-5 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Correo
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              ← Inicio
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
};
