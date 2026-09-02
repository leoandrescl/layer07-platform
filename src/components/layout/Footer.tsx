import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-dashed border-[#00ff66]/25 bg-[#030b0c]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-sans lain-glow text-lg tracking-[0.08em] text-[#e8fff8] lowercase">
            {SITE.name}
          </p>
          <p className="mt-3 max-w-xs font-mono text-sm leading-relaxed text-[#8fb8b0]">
            Nodo de ingeniería independiente. Desarrollo web, headless e-commerce
            e integraciones API.
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.22em] text-[#7fffd4]/80">
            a body in Santiago · a ghost in the Wired
          </p>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
            nodos
          </p>
          <ul className="space-y-2 font-mono text-sm text-[#8fb8b0]">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#7fffd4]">
                  /{link.label.toLowerCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
            red
          </p>
          <ul className="space-y-2 font-mono text-sm text-[#8fb8b0]">
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-[#7fffd4]">
                {SITE.email}
              </a>
            </li>
            <li>
              <a
                href={SITE.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7fffd4]"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7fffd4]"
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

      <div className="border-t border-dashed border-[#00ff66]/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 font-mono text-[10px] tracking-[0.22em] text-[#8fb8b0] uppercase sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {year} {SITE.name} · {SITE.founder.name}
          </span>
          <span className="text-[#7fffd4]/70">present day, present time.</span>
        </div>
      </div>
    </footer>
  );
}
