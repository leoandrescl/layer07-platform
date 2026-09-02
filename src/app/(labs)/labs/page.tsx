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
    <div className="bg-grid relative flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-[11px] tracking-[0.3em] text-neon uppercase">
          /labs
        </p>
        <h1 className="mt-4 text-3xl tracking-tight text-foreground sm:text-4xl">
          Vitrinas
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-dim">
          Sitios demo con layout propio. El estudio sigue en{" "}
          <Link href="/" className="text-cyan hover:text-neon">
            {SITE.domain}
          </Link>
          ; estas rutas no heredan header, footer ni WhatsApp.
        </p>

        <ul className="mt-12 divide-y divide-border border border-border">
          {sites.map((site) => (
            <li key={site.slug}>
              <Link
                href={site.path}
                className="flex items-baseline justify-between gap-4 px-4 py-4 hover:bg-surface/60"
              >
                <span>
                  <span className="font-mono text-sm text-foreground">
                    {site.name}
                  </span>
                  <span className="mt-1 block font-mono text-[11px] text-muted-dim">
                    {site.path}
                    <span className="mx-2 text-border">·</span>
                    {site.summary}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[10px] tracking-widest text-cyan uppercase">
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
