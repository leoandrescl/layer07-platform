"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RainGL, type Pointer } from "./RainGL";
import { SevenShell, type SevenShellHandle } from "./SevenShell";
import type { SevenProcess } from "./commands";

const SCROLL_VH = 280;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function SevenHero({ processes }: { processes: SevenProcess[] }) {
  const reducedMotion = usePrefersReducedMotion();
  const pinRef = useRef<HTMLElement>(null);
  const mouseRef = useRef<Pointer>({ x: 0.5, y: 0.5 });
  const progressRef = useRef(0);
  const lockupRef = useRef<HTMLDivElement>(null);
  const cyanRef = useRef<HTMLSpanElement>(null);
  const magRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const shellApi = useRef<SevenShellHandle>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0, tx: 0, ty: 0, visible: false });
  const typingRef = useRef(false);
  const didFocus = useRef(false);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;

    let raf = 0;

    const readProgress = () => {
      if (reducedMotion) {
        progressRef.current = 0;
        return;
      }
      const rect = pin.getBoundingClientRect();
      const scrollable = pin.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        progressRef.current = 0;
        return;
      }
      progressRef.current = Math.min(1, Math.max(0, -rect.top / scrollable));
    };

    const tick = () => {
      readProgress();
      const p = progressRef.current;
      const m = mouseRef.current;

      const lockup = lockupRef.current;
      if (lockup) {
        const fade = reducedMotion
          ? 0
          : p < 0.42
            ? 1
            : Math.max(0, 1 - (p - 0.42) / 0.28);
        const y = reducedMotion ? 0 : p * -80;
        lockup.style.opacity = String(fade);
        lockup.style.transform = `translate3d(0, ${y}px, 0)`;
        lockup.style.pointerEvents = fade < 0.2 ? "none" : "auto";
      }

      const split = (0.35 + p * 1.4) * 8;
      const dx = (m.x - 0.5) * split;
      const dy = (m.y - 0.5) * split;
      if (cyanRef.current) {
        cyanRef.current.style.transform = `translate3d(${dx}px, ${-dy * 0.4}px, 0)`;
      }
      if (magRef.current) {
        magRef.current.style.transform = `translate3d(${-dx}px, ${dy * 0.4}px, 0)`;
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = reducedMotion
          ? "0"
          : String(p < 0.18 ? 0.85 : Math.max(0, 1 - p / 0.32));
      }

      if (arrivalRef.current) {
        const enter = clamp((p - 0.66) / 0.1);
        const leave = p > 0.8 ? clamp(1 - (p - 0.8) / 0.08) : 1;
        const a = reducedMotion ? 0 : enter * leave;
        arrivalRef.current.style.opacity = String(a);
        arrivalRef.current.style.transform = `translate3d(0, ${(1 - a) * 28}px, 0)`;
      }

      if (shellRef.current) {
        const s = reducedMotion ? 1 : clamp((p - 0.8) / 0.12);
        shellRef.current.style.opacity = String(s);
        shellRef.current.style.pointerEvents = s > 0.55 ? "auto" : "none";
        if (s > 0.85 && !didFocus.current && window.matchMedia("(pointer: fine)").matches) {
          didFocus.current = true;
          shellApi.current?.focus();
        }
      }

      const c = cursorPos.current;
      c.x += (c.tx - c.x) * 0.22;
      c.y += (c.ty - c.y) * 0.22;
      if (cursorRef.current) {
        cursorRef.current.style.opacity =
          c.visible && !typingRef.current ? "1" : "0";
        cursorRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      mouseRef.current = {
        x: event.clientX / Math.max(window.innerWidth, 1),
        y: event.clientY / Math.max(window.innerHeight, 1),
      };
      cursorPos.current.tx = event.clientX;
      cursorPos.current.ty = event.clientY;
      cursorPos.current.visible = event.pointerType === "mouse";
    };

    const onLeave = () => {
      cursorPos.current.visible = false;
    };

    const onHotkey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const inField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement;

      if ((event.key === "/" || event.key === "`") && !inField) {
        event.preventDefault();
        shellApi.current?.focus();
      }
    };

    readProgress();
    raf = requestAnimationFrame(tick);
    window.addEventListener("scroll", readProgress, { passive: true });
    window.addEventListener("resize", readProgress, { passive: true });
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("keydown", onHotkey);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readProgress);
      window.removeEventListener("resize", readProgress);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onHotkey);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <>
      <section
        ref={pinRef}
        className="relative"
        style={{ height: reducedMotion ? "100dvh" : `${SCROLL_VH}vh` }}
        aria-label="Hero inmersivo SEVEN"
      >
        <div className="sticky top-0 h-dvh overflow-hidden bg-[#050505]">
          {reducedMotion ? (
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(0,255,102,0.12) 18px, rgba(0,255,102,0.12) 19px)",
              }}
              aria-hidden
            />
          ) : (
            <RainGL mouseRef={mouseRef} progressRef={progressRef} />
          )}

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.35)_70%,rgba(5,5,5,0.82)_100%)]" />

          <header className="pointer-events-auto absolute top-0 right-0 left-0 z-30 flex items-center justify-between px-4 py-4 font-mono text-[10px] tracking-[0.28em] text-[#00ff66]/80 uppercase sm:px-6">
            <Link href="/labs" className="hover:text-white">
              ESC // LABS
            </Link>
            <span>NODE // SCL</span>
            <span className="text-[#00f0ff]">LAYER 07</span>
          </header>

          <div
            ref={lockupRef}
            className="relative z-10 flex h-full select-none flex-col items-center justify-center px-4 text-center will-change-transform"
          >
            <p className="font-mono text-[10px] tracking-[0.42em] text-[#00ff66] uppercase sm:text-[11px]">
              SYS.LAYER 7 // APPLICATION
            </p>

            <h1 className="relative mt-6 font-sans text-[clamp(2.75rem,14vw,9.5rem)] font-bold tracking-[-0.06em] text-white uppercase">
              <span
                ref={magRef}
                className="absolute inset-0 block leading-[0.78] whitespace-nowrap text-[#ff0055] mix-blend-screen"
                aria-hidden
              >
                LEONARDO
              </span>
              <span
                ref={cyanRef}
                className="absolute inset-0 block leading-[0.78] whitespace-nowrap text-[#00f0ff] mix-blend-screen"
                aria-hidden
              >
                LEONARDO
              </span>
              <span className="relative block leading-[0.78] whitespace-nowrap">
                LEONARDO
              </span>
            </h1>

            <p className="mt-1 font-sans text-[clamp(1.5rem,6vw,4.2rem)] font-medium tracking-[-0.04em] text-white/90 uppercase">
              Contreras
            </p>
            <p className="mt-6 max-w-xl font-mono text-[10px] leading-relaxed tracking-[0.22em] text-[#94a3b8] uppercase sm:text-xs">
              Full Stack Engineer · 8+ years · web · systems · headless
            </p>
          </div>

          <p
            ref={hintRef}
            className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] tracking-[0.32em] text-[#00ff66] uppercase"
          >
            scroll to jack in
          </p>

          <div
            ref={arrivalRef}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center opacity-0"
            aria-hidden
          >
            <p className="font-mono text-[10px] tracking-[0.4em] text-[#00f0ff] uppercase">
              arrived // layer 07
            </p>
            <p className="mt-4 font-sans text-4xl font-bold tracking-[-0.05em] text-white uppercase sm:text-6xl">
              Application
            </p>
            <p className="mt-4 font-mono text-[11px] tracking-[0.22em] text-[#94a3b8] uppercase">
              attach tty — type help
            </p>
          </div>

          <div
            ref={shellRef}
            className="absolute inset-0 z-20 opacity-0"
            style={reducedMotion ? { opacity: 1, pointerEvents: "auto" } : undefined}
          >
            <SevenShell
              ref={shellApi}
              processes={processes}
              onFocusChange={(focused) => {
                typingRef.current = focused;
              }}
            />
          </div>
        </div>
      </section>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform [@media(pointer:fine)]:block"
        aria-hidden
      >
        <span className="absolute inset-0 rounded-full border border-[#00ff66]/80" />
        <span className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 bg-[#00ff66]" />
        <span className="absolute top-0 left-1/2 h-2 w-px -translate-x-1/2 bg-[#00ff66]/70" />
        <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-[#00ff66]/70" />
        <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 bg-[#00ff66]/70" />
        <span className="absolute top-1/2 right-0 h-px w-2 -translate-y-1/2 bg-[#00ff66]/70" />
      </div>
    </>
  );
}
