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
    <header className="sticky top-0 z-50 border-b border-dashed border-[#00ff66]/25 bg-[#030b0c]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2"
          onClick={() => setOpen(false)}
        >
          <span className="font-sans lain-glow text-lg tracking-[0.08em] text-[#e8fff8] lowercase sm:text-xl">
            {SITE.name}
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.22em] text-[#7fffd4]/70 sm:inline">
            the Wired
          </span>
        </Link>

        <div className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-[#8fb8b0] md:flex">
          <span className="inline-flex size-1.5 animate-pulse-online rounded-full bg-[#00ff66]" />
          <span className="text-[#7fffd4]">present</span>
          <span className="text-[#00ff66]/30">·</span>
          <span>SCL</span>
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
                  "px-3 py-2 font-mono text-[11px] tracking-[0.16em] lowercase transition-colors",
                  active
                    ? "text-[#7fffd4] text-glow-neon"
                    : "text-[#8fb8b0] hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="cursor-pointer border border-dashed border-[#00ff66]/35 px-3 py-2 font-mono text-[10px] tracking-widest text-[#8fb8b0] uppercase transition-all duration-200 hover:border-[#7fffd4]/60 hover:bg-[#00ff66]/10 hover:text-[#7fffd4] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "close" : "menu"}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-dashed border-[#00ff66]/25 bg-black/70 lg:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6" aria-label="Móvil">
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-[#7fffd4]">
              <span className="inline-flex size-1.5 animate-pulse-online rounded-full bg-[#00ff66]" />
              present day, present time.
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="border-b border-dashed border-[#00ff66]/15 py-3 font-mono text-sm tracking-wide text-[#c8efe6] hover:text-[#7fffd4]"
                onClick={() => setOpen(false)}
              >
                <span className="text-[#00ff66]">&gt;</span> {link.label.toLowerCase()}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
