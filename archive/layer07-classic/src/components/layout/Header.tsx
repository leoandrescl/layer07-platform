"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-mono glitch-hover"
          onClick={() => setOpen(false)}
        >
          <span className="text-lg tracking-tight text-neon text-glow-neon sm:text-xl">
            {SITE.name}
          </span>
          <span className="hidden text-[10px] tracking-[0.2em] text-muted-dim uppercase sm:inline">
            .cl
          </span>
        </Link>

        <div className="hidden items-center gap-2 font-mono text-[10px] tracking-widest text-muted-dim md:flex">
          <span className="inline-flex size-2 animate-pulse-online rounded-full bg-neon" />
          <span className="text-neon">ONLINE</span>
          <span className="text-border">|</span>
          <span>NODE // SCL</span>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors",
                  active
                    ? "text-neon text-glow-neon"
                    : "text-muted-dim hover:text-cyan",
                )}
              >
                {active ? `[${link.label}]` : link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="cursor-pointer border border-border px-3 py-2 font-mono text-[10px] tracking-widest text-muted uppercase transition-all duration-200 hover:border-neon hover:bg-neon/10 hover:text-neon lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-surface lg:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6" aria-label="Móvil">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-widest text-neon">
              <span className="inline-flex size-2 animate-pulse-online rounded-full bg-neon" />
              STATUS: ONLINE
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-border/60 py-3 font-mono text-sm tracking-wide text-muted hover:text-neon"
                onClick={() => setOpen(false)}
              >
                <span className="text-neon">&gt;</span> {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
