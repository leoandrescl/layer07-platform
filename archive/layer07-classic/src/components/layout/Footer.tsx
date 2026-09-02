import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-mono text-lg text-neon text-glow-neon">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-dim">
            Nodo de ingeniería independiente. Desarrollo web, headless e-commerce
            e integraciones API.
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-widest text-muted-dim uppercase">
            SYS.STATUS // GREEN
          </p>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-cyan uppercase">
            Nodos
          </p>
          <ul className="space-y-2 font-mono text-sm text-muted-dim">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-neon">
                  /{link.label.toLowerCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-cyan uppercase">
            Red
          </p>
          <ul className="space-y-2 font-mono text-sm text-muted-dim">
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-neon">
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={SITE.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neon"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-neon"
              >
                LinkedIn
              </a>
            </li>
            <li className="pt-2 text-[11px] tracking-widest uppercase">
              {SITE.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 font-mono text-[10px] tracking-widest text-muted-dim uppercase sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {year} {SITE.name} · {SITE.founder.name}
          </span>
          <span className="text-neon/70">uptime target 99.9% · edge ready</span>
        </div>
      </div>
    </footer>
  );
}
