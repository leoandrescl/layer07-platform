import Link from "next/link";
import { NAV, SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-line bg-bg/70 backdrop-blur-md">
      <div className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="eyebrow">{SITE.name}</p>
            <Link
              href={`/${locale}/contact`}
              className="display-md mt-6 inline-block max-w-md text-ink transition-colors hover:text-accent"
            >
              {dict.footer.tagline}
            </Link>
          </div>

          <nav aria-label={dict.footer.explore}>
            <p className="eyebrow">{dict.footer.explore}</p>
            <ul className="mt-6 space-y-3">
              {NAV.map((item) => (
                <li key={item.path}>
                  <Link
                    href={`/${locale}${item.path}`}
                    className="link-line text-[0.9375rem] text-ink-soft transition-colors hover:text-ink"
                  >
                    {dict.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow">{dict.footer.contact}</p>
            <ul className="mt-6 space-y-3 text-[0.9375rem] text-ink-soft">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="link-line transition-colors hover:text-ink"
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE.phone}`}
                  className="link-line transition-colors hover:text-ink"
                >
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line transition-colors hover:text-ink"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line transition-colors hover:text-ink"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {SITE.name} — {SITE.founder.name}
          </span>
          <span>{dict.footer.madeIn}</span>
        </div>
      </div>
    </footer>
  );
}
