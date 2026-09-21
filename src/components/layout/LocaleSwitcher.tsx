"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = locales.includes(segments[0] as Locale);
  const rest = hasLocale ? segments.slice(1) : segments;

  return (
    <div
      aria-label={label}
      className="flex items-center gap-1 font-mono text-[0.6875rem] tracking-[0.16em] uppercase"
    >
      {locales.map((locale, index) => {
        const active = locale === current;
        const href = `/${locale}${rest.length ? `/${rest.join("/")}` : ""}`;
        return (
          <span key={locale} className="flex items-center gap-1">
            {index > 0 ? <span className="text-line-strong">/</span> : null}
            <Link
              href={href}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "text-ink"
                  : "text-ink-muted transition-colors hover:text-ink"
              }
            >
              {localeLabels[locale]}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
