"use client";

import Link from "next/link";
import { SITE, whatsappUrl } from "@/lib/site";
import { ScrambleText } from "./ScrambleText";
import { SignalField } from "./SignalField";

export type UplinkWork = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  year: number;
  liveUrl?: string;
  repoUrl?: string;
  stack: string[];
};

const TICKER = [
  "SIGNAL LIVE",
  "NODE SCL",
  "8+ YEARS",
  "NEXT.JS",
  "TYPESCRIPT",
  "HEADLESS COMMERCE",
  "CUSTOM SYSTEMS",
  "API INTEGRATIONS",
  "OPEN FOR BUILDS",
];

const OFFERS = [
  {
    code: "01",
    title: "Sistemas a medida",
    body: "Paneles, POS, portales B2B y flujos críticos con ownership total del código.",
  },
  {
    code: "02",
    title: "Headless e-commerce",
    body: "Storefronts Next.js sobre Shopify o WooCommerce, orientados a conversión y LCP.",
  },
  {
    code: "03",
    title: "Integraciones API",
    body: "Contratos claros entre CMS, pagos, inventario y el producto que ve el usuario.",
  },
];

export function UplinkHome({
  featured,
  shipped,
  githubRepos,
}: {
  featured: UplinkWork[];
  shipped: number;
  githubRepos: number | null;
}) {
  const ticker = [...TICKER, ...TICKER];

  return (
    <div className="relative overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")",
        }}
        aria-hidden
      />

      <div className="overflow-hidden border-b border-[#00ff66]/20 bg-black py-2">
        <div className="flex w-max animate-marquee font-mono text-[10px] tracking-[0.28em] text-[#00ff66] uppercase">
          {ticker.map((item, i) => (
            <span key={`${item}-${i}`} className="px-6">
              {item} ·
            </span>
          ))}
        </div>
      </div>

      <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link
          href="/s/uplink"
          className="font-mono text-sm tracking-[0.2em] text-white uppercase"
        >
          uplink
        </Link>
        <nav className="hidden items-center gap-5 font-mono text-[11px] tracking-[0.16em] text-[#94a3b8] uppercase md:flex">
          <a href="#work" className="hover:text-[#00ff66]">
            Sistemas
          </a>
          <a href="#stack" className="hover:text-[#00ff66]">
            Stack
          </a>
          <a href="#contact" className="hover:text-[#00ff66]">
            Contacto
          </a>
          <Link href="/s/seven" className="hover:text-[#00f0ff]">
            Seven
          </Link>
        </nav>
        <Link
          href="/labs"
          className="font-mono text-[10px] tracking-[0.22em] text-[#00ff66] uppercase"
        >
          ESC // LABS
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="font-mono text-[11px] tracking-[0.32em] text-[#00ff66] uppercase">
            uplink established · santiago
          </p>
          <ScrambleText
            as="h1"
            playOnMount
            text="Software que se siente producto."
            className="mt-5 max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-white sm:text-6xl"
          />
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#cbd5e1]">
            {SITE.founder.name}, {SITE.founder.role}. {SITE.founder.years} años
            armando sistemas a medida, storefronts headless e integraciones API
            — con el código y la infra en un solo nodo.
            <span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-[#00ff66] align-middle" />
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contacto"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00ff66]"
            >
              Iniciar conexión
            </Link>
            <Link
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm text-white hover:border-[#00ff66] hover:text-[#00ff66]"
            >
              WhatsApp
            </Link>
            <a
              href="#work"
              className="rounded-full border border-[#00ff66]/50 px-5 py-2.5 font-mono text-[11px] tracking-[0.18em] text-[#00ff66] uppercase"
            >
              ver sistemas ↗
            </a>
          </div>
        </div>
        <div className="relative h-[320px] overflow-hidden border border-[#00ff66]/20 bg-black/40 sm:h-[420px]">
          <SignalField />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(3,3,3,0.45)_100%)]" />
        </div>
      </section>

      <section className="relative z-10 border-y border-white/10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-white/10 sm:grid-cols-4">
          {[
            { label: "Producción", value: `${SITE.founder.years} yrs` },
            { label: "Sistemas", value: String(shipped).padStart(2, "0") },
            {
              label: "Repos públicos",
              value: githubRepos != null ? String(githubRepos) : "—",
            },
            { label: "Nodo", value: "SCL" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#030303] px-4 py-6 sm:px-8">
              <p className="font-mono text-2xl text-[#00ff66] sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-[#64748b] uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#00ff66] uppercase">
              01 / encargo
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Para qué me escriben
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#94a3b8]">
            Alcance cerrado, ejecución senior, sin teatro de agencia. Cada línea
            de abajo es algo que ya está en producción.
          </p>
        </div>
        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {OFFERS.map((offer) => (
            <Link
              key={offer.code}
              href="/servicios"
              className="border border-white/10 bg-black/30 p-5 transition-colors hover:border-[#00ff66]/40"
            >
              <p className="font-mono text-[11px] text-[#00ff66]">{offer.code}</p>
              <h3 className="mt-3 text-lg text-white">{offer.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">
                {offer.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="work"
        className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-8"
      >
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#00ff66] uppercase">
          02 / sistemas
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Nodos que ya corren
        </h2>
        <ol className="mt-10 space-y-3">
          {featured.map((item, index) => (
            <li key={item.slug}>
              <article className="border border-white/10 bg-black/25 p-5 transition-colors hover:border-[#00f0ff]/35 sm:p-6">
                <p className="font-mono text-[11px] text-[#00f0ff]">
                  {String(index + 1).padStart(2, "0")} · {item.category} ·{" "}
                  {item.year}
                </p>
                <h3 className="mt-2 text-2xl text-white">{item.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94a3b8]">
                  {item.excerpt}
                </p>
                <p className="mt-3 font-mono text-[10px] tracking-wide text-[#64748b] uppercase">
                  {item.stack.join(" · ")}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 font-mono text-[11px] tracking-widest uppercase">
                  {item.liveUrl ? (
                    <Link
                      href={item.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#00ff66] hover:text-white"
                    >
                      Live ↗
                    </Link>
                  ) : null}
                  {item.repoUrl ? (
                    <Link
                      href={item.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#94a3b8] hover:text-white"
                    >
                      Repo
                    </Link>
                  ) : null}
                  <Link
                    href={`/portafolio/${item.slug}`}
                    className="text-[#94a3b8] hover:text-white"
                  >
                    Case
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
        <Link
          href="/portafolio"
          className="mt-8 inline-block font-mono text-[11px] tracking-[0.2em] text-[#00ff66] uppercase hover:text-white"
        >
          Catálogo completo →
        </Link>
      </section>

      <section
        id="stack"
        className="relative z-10 border-y border-white/10 py-10"
      >
        <p className="mb-6 px-4 font-mono text-[11px] tracking-[0.28em] text-[#00ff66] uppercase sm:px-8">
          03 / runtime
        </p>
        <div className="flex flex-wrap justify-center gap-2 px-4">
          {SITE.founder.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[#00ff66]/35 px-4 py-1.5 font-mono text-[11px] tracking-widest text-[#00ff66] uppercase"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:px-8"
      >
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#00ff66] uppercase">
          04 / handshake
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Un brief corto basta.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#94a3b8]">
          Problema, outcome, stack actual y timing. Respondo desde {SITE.location}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/contacto"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-[#00ff66]"
          >
            Formulario
          </Link>
          <Link
            href={`mailto:${SITE.email}`}
            className="rounded-full border border-white/30 px-5 py-2.5 font-mono text-sm text-white hover:border-[#00ff66]"
          >
            {SITE.email}
          </Link>
        </div>
      </section>

      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-6 font-mono text-[10px] tracking-[0.2em] text-[#64748b] uppercase sm:px-8">
        <span>
          {SITE.name} · uplink · {SITE.location}
        </span>
        <span className="flex gap-4">
          <Link href={SITE.social.github} className="hover:text-[#00ff66]">
            GitHub
          </Link>
          <Link href={SITE.social.linkedin} className="hover:text-[#00ff66]">
            LinkedIn
          </Link>
          <Link href="/s/seven" className="hover:text-[#00f0ff]">
            Seven
          </Link>
        </span>
      </footer>
    </div>
  );
}
