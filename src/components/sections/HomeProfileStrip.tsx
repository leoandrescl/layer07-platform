import Link from "next/link";
import { CONTACT, CONTACT_MAILTO_HREF, CONTACT_TEL_HREF, CONTACT_WA_HREF } from "@/constants/contact";

const bullets = [
  "Ocho años en e-commerce de alta disponibilidad: WordPress y WooCommerce, Shopify (Liquid), PrestaShop, temas custom, plugins, Elementor, ACF y Crocoblock.",
  "Infraestructura y despliegue: DNS (NIC Chile), DigitalOcean, AWS Lightsail, Linux, Git.",
  "Front moderno y headless: Next.js (App Router), React, GraphQL, Tailwind; PHP y JavaScript a nivel avanzado.",
  "Figma a implementación; IA como apoyo en especificación y revisión, sin sustituir criterio de arquitectura ni seguridad.",
] as const;

export const HomeProfileStrip = () => {
  return (
    <section
      id="perfil"
      aria-labelledby="perfil-heading"
      className="relative z-10 w-full scroll-mt-28 border-t border-emerald-500/15 bg-black/50 backdrop-blur-sm"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-28 pb-20 md:pt-32 md:pb-28">
        <p className="text-[11px] font-mono uppercase tracking-[0.35em] text-emerald-500/70 mb-4">
          {CONTACT.name} · {CONTACT.location}
        </p>
        <h2
          id="perfil-heading"
          className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-[1.15] max-w-4xl"
        >
          {CONTACT.roleTitle}
        </h2>
        <p className="mt-6 text-zinc-400 text-base md:text-lg leading-relaxed max-w-3xl">
          Ingeniero en Informática: interfaces de alta fidelidad y base full stack sólida, desde
          plantillas y temas a medida hasta extensión de WordPress y Shopify con código escalable y
          orientado al rendimiento.
        </p>
        <ul className="mt-8 space-y-4 max-w-3xl text-zinc-500 text-sm md:text-[15px] leading-relaxed list-none pl-0">
          {bullets.map((text, i) => (
            <li key={i} className="flex gap-4">
              <span
                className="shrink-0 font-mono text-emerald-500/80 text-sm leading-relaxed w-6 text-center select-none"
                aria-hidden
              >
                ·
              </span>
              <span className="min-w-0">{text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/capacidades"
            className="inline-flex items-center justify-center px-6 py-3 text-[11px] font-mono uppercase tracking-[0.2em] bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 hover:border-emerald-400/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Ver perfil profesional
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
            href="/#contact"
            className="inline-flex items-center justify-center px-5 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Briefing
          </a>
          <a
            href={CONTACT_MAILTO_HREF}
            className="inline-flex items-center justify-center px-5 py-3 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Correo
          </a>
          <a
            href={CONTACT_TEL_HREF}
            className="inline-flex items-center justify-center px-5 py-3 text-[11px] font-mono tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
};
