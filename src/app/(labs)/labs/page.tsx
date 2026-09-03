import type { Metadata } from "next";
import Link from "next/link";
import { getLabs } from "@/lib/sites";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Vitrinas aisladas de layer07: demos de distintos tipos de producto, sin el chrome del sitio principal.",
};

const STATUS_LABEL: Record<string, string> = {
  smoke: "smoke",
  draft: "draft",
  live: "live",
};

export default function LabsIndexPage() {
  const sites = getLabs();

  return (
    <div className="seven-root relative flex min-h-dvh flex-col bg-[#030b0c]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fffd4]">
          /labs
        </p>
        <h1 className="font-sans lain-glow mt-4 text-3xl tracking-[0.06em] text-[#e8fff8] lowercase sm:text-4xl">
          vitrinas
        </h1>
        <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-[#8fb8b0]">
          Sitios demo con layout propio. El estudio sigue en{" "}
          <Link href="/" className="text-[#00f0ff] hover:text-[#7fffd4]">
            {SITE.domain}
          </Link>
          ; Seven vive en{" "}
          <Link href="/seven" className="text-[#00f0ff] hover:text-[#7fffd4]">
            /seven
          </Link>
          . Estas rutas no heredan header, footer ni WhatsApp.
        </p>

        <ul className="mt-12 divide-y divide-[#00ff66]/20 border border-dashed border-[#00ff66]/35">
          {sites.map((site) => (
            <li key={site.slug}>
              <Link
                href={site.path}
                className="flex items-baseline justify-between gap-4 px-4 py-4 hover:bg-white/5"
              >
                <span>
                  <span className="font-sans text-sm tracking-[0.04em] text-[#e8fff8] lowercase">
                    {site.name}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] text-[#8fb8b0]">
                    {site.path}
                    <span className="mx-2 text-[#00ff66]/30">·</span>
                    {site.summary}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] tracking-widest text-[#00f0ff] uppercase">
                  {STATUS_LABEL[site.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
