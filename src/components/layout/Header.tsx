"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/cn";
import { getLenis } from "@/lib/scroll";
import { NAV, SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = overlayRef.current;
    const toggle = toggleRef.current;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tween: gsap.core.Tween | undefined;

    if (el && !reduced) {
      const items = el.querySelectorAll("[data-menu-item]");
      tween = gsap.fromTo(
        items,
        { yPercent: 130, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.06,
          ease: "power4.out",
          delay: 0.08,
        },
      );
    }

    const focusables = () =>
      el
        ? el.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
        : null;

    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      tween?.kill();
      window.removeEventListener("keydown", onKey);
      getLenis()?.start();
      document.documentElement.style.overflow = "";
      toggle?.focus();
    };
  }, [open]);

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` ||
    pathname.startsWith(`/${locale}${path}/`);

  return (
    <>
      <header
        className={cn(
          "site-header fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          scrolled && !open
            ? "border-b border-line bg-bg/75 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 md:h-20">
          <Link
            href={`/${locale}`}
            onClick={() => setOpen(false)}
            className="font-display text-[1.35rem] leading-none tracking-[-0.03em] text-ink"
          >
            layer07<span className="text-accent">.</span>
          </Link>

          <nav
            aria-label={dict.common.menu}
            className="hidden items-center gap-7 lg:flex"
          >
            {NAV.map((item, index) => (
              <Link
                key={item.path}
                href={`/${locale}${item.path}`}
                className={cn(
                  "inline-flex items-baseline gap-1.5 font-mono text-[0.6875rem] tracking-[0.18em] uppercase transition-colors",
                  isActive(item.path)
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                <span className="text-[0.5625rem] text-ink-muted/70">
                  0{index + 1}
                </span>
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LocaleSwitcher current={locale} label={dict.common.language} />
            </div>
            <Button
              href={`/${locale}/contact`}
              variant="solid"
              className="hidden md:inline-flex"
            >
              {dict.common.startProject}
            </Button>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="inline-flex h-11 items-center rounded-full border border-line px-4 font-mono text-[0.6875rem] tracking-[0.16em] text-ink uppercase transition-colors hover:border-line-strong lg:hidden"
            >
              {open ? dict.common.close : dict.common.menu}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="site-menu"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={dict.common.menu}
          className="fixed inset-0 z-[60] flex flex-col bg-bg"
        >
          <div className="shell flex h-16 items-center justify-between md:h-20">
            <Link
              href={`/${locale}`}
              onClick={() => setOpen(false)}
              className="font-display text-[1.35rem] leading-none tracking-[-0.03em] text-ink"
            >
              layer07<span className="text-accent">.</span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 items-center rounded-full border border-line px-4 font-mono text-[0.6875rem] tracking-[0.16em] text-ink uppercase transition-colors hover:border-line-strong"
            >
              {dict.common.close}
            </button>
          </div>

          <nav className="shell flex flex-1 flex-col justify-center gap-1 py-8">
            {NAV.map((item, index) => (
              <div key={item.path} className="overflow-hidden">
                <Link
                  data-menu-item
                  href={`/${locale}${item.path}`}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4 py-1.5 text-ink transition-colors hover:text-accent"
                >
                  <span className="font-mono text-xs text-ink-muted">
                    0{index + 1}
                  </span>
                  <span className="font-display text-[clamp(2.5rem,9vw,5rem)] leading-[1.02] tracking-[-0.03em]">
                    {dict.nav[item.key]}
                  </span>
                </Link>
              </div>
            ))}
          </nav>

          <div className="shell flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <a
                href={`mailto:${SITE.email}`}
                className="link-line font-mono text-xs tracking-[0.08em] text-ink"
              >
                {SITE.email}
              </a>
              <span className="font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                {SITE.location}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <LocaleSwitcher current={locale} label={dict.common.language} />
              <a
                href={SITE.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
              >
                GitHub
              </a>
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase transition-colors hover:text-ink"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
