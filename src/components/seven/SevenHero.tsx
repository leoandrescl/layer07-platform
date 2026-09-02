"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DuvetPlayer } from "./DuvetPlayer";
import { RainGL, type Pointer } from "./RainGL";
import { SevenShell, type SevenShellHandle } from "./SevenShell";
import { SevenWorld } from "./SevenWorld";
import type { SevenProcess } from "./commands";

const SCROLL_VH = 420;

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
  const stageRef = useRef<HTMLDivElement>(null);
  const rainPaneRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<Pointer>({ x: 0.5, y: 0.5 });
  const progressRef = useRef(0);
  const lockupRef = useRef<HTMLDivElement>(null);
  const cyanRef = useRef<HTMLSpanElement>(null);
  const magRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const shellApi = useRef<SevenShellHandle>(null);
  const typingRef = useRef(false);
  const didFocus = useRef(false);
  const [naviOpen, setNaviOpen] = useState(true);
  const naviOpenRef = useRef(true);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;

    let raf = 0;
    let alive = true;

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
      try {
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
        lockup.style.pointerEvents = "none";
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
        const jacked = reducedMotion ? 1 : clamp((p - 0.8) / 0.12);
        const s = naviOpenRef.current ? jacked : 0;
        shellRef.current.style.opacity = String(s);
        const live = s > 0.55;
        if (shellRef.current.classList.contains("is-live") !== live) {
          shellRef.current.classList.toggle("is-live", live);
        }
        if (
          naviOpenRef.current &&
          s > 0.85 &&
          !didFocus.current &&
          window.matchMedia("(pointer: fine)").matches
        ) {
          didFocus.current = true;
          shellApi.current?.focus();
        }
      }

      if (worldRef.current) {
        const jacked = reducedMotion ? 1 : clamp((p - 0.8) / 0.12);
        const show = !naviOpenRef.current && jacked > 0.55;
        worldRef.current.style.opacity = show ? "1" : "0";
        const card = worldRef.current.firstElementChild;
        if (card instanceof HTMLElement) {
          card.style.pointerEvents = show ? "auto" : "none";
        }
      }

      } finally {
        if (alive) raf = requestAnimationFrame(tick);
      }
    };

    const onPointer = (event: PointerEvent) => {
      const pane = rainPaneRef.current;
      if (!pane) return;
      const rect = pane.getBoundingClientRect();
      mouseRef.current = {
        x: (event.clientX - rect.left) / Math.max(rect.width, 1),
        y: (event.clientY - rect.top) / Math.max(rect.height, 1),
      };
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

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readProgress);
      window.removeEventListener("resize", readProgress);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onHotkey);
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
        <div
          ref={stageRef}
          className="sticky top-0 h-dvh overflow-hidden bg-[#030b0c] will-change-transform select-none"
        >
          <header className="pointer-events-auto absolute top-0 right-0 left-0 z-30 flex items-center justify-between gap-3 px-4 py-4 font-mono text-[10px] tracking-[0.22em] text-[#7fffd4]/80 sm:px-6">
            <Link href="/labs" className="hover:text-white">
              close the world
            </Link>
            <span className="hidden sm:inline">the Wired</span>
            <span className="text-[#7fffd4]">LAYER 07</span>
          </header>

          <div className="pointer-events-auto absolute right-3 bottom-3 z-40 sm:right-5 sm:bottom-4">
            <DuvetPlayer />
          </div>

          <div ref={rainPaneRef} className="relative h-full">
            {reducedMotion ? (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,40,42,0.55) 3px, rgba(0,40,42,0.55) 4px)",
                }}
                aria-hidden
              />
            ) : (
              <RainGL mouseRef={mouseRef} />
            )}

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,11,12,0.35)_55%,rgba(3,11,12,0.88)_100%)]" />
            <div
              className="pointer-events-none absolute inset-0 z-[2] opacity-40 mix-blend-multiply"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)",
              }}
              aria-hidden
            />

            <div
              ref={lockupRef}
              className="pointer-events-none relative z-10 flex h-full select-none flex-col items-center justify-center px-4 text-center will-change-transform"
            >
              <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fffd4] sm:text-xs">
                present day, present time.
              </p>

              <h1 className="font-lain lain-glow relative mt-8 text-[clamp(2.4rem,12vw,8.4rem)] font-normal tracking-[0.06em] text-[#e8fff8] lowercase">
                <span
                  ref={magRef}
                  className="absolute inset-0 block leading-[0.88] whitespace-nowrap text-[#5eead4]/50 mix-blend-screen"
                  aria-hidden
                >
                  leonardo
                </span>
                <span
                  ref={cyanRef}
                  className="absolute inset-0 block leading-[0.88] whitespace-nowrap text-[#7fffd4] mix-blend-screen"
                  aria-hidden
                >
                  leonardo
                </span>
                <span className="relative block leading-[0.88] whitespace-nowrap">
                  leonardo
                </span>
              </h1>

              <p className="font-lain mt-1 text-[clamp(1.35rem,5.5vw,3.6rem)] tracking-[0.14em] text-[#c8efe6]/90 lowercase">
                contreras
              </p>
              <p className="mt-7 max-w-xl font-mono text-[11px] leading-relaxed tracking-[0.18em] text-[#8fb8b0] sm:text-xs">
                a body in Santiago · a ghost in the Wired
              </p>
            </div>

            <p
              ref={hintRef}
              className="lain-cursor pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 font-mono text-[11px] tracking-[0.22em] text-[#7fffd4]"
            >
              LAYER 07: DE-CIPHER
            </p>

            <div
              ref={arrivalRef}
              className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center opacity-0"
              aria-hidden
            >
              <p className="font-mono text-[10px] tracking-[0.28em] text-[#7fffd4]">
                unpacking cipher-data...
              </p>
              <p className="font-lain lain-glow mt-4 text-4xl tracking-[0.12em] text-[#e8fff8] lowercase sm:text-6xl">
                connected
              </p>
              <p className="mt-4 font-mono text-[11px] tracking-[0.2em] text-[#8fb8b0]">
                the Wired accepts you
              </p>
            </div>

            <div
              ref={shellRef}
              className="pointer-events-none absolute inset-0 z-20 px-3 pt-12 pb-11 opacity-0 sm:px-4 sm:pt-12 sm:pb-1.5"
              style={reducedMotion ? { opacity: 1 } : undefined}
            >
              <SevenShell
                ref={shellApi}
                processes={processes}
                reducedMotion={reducedMotion}
                onClose={() => {
                  naviOpenRef.current = false;
                  setNaviOpen(false);
                }}
                onFocusChange={(focused) => {
                  typingRef.current = focused;
                }}
              />
            </div>

            {naviOpen ? null : (
              <div
                ref={worldRef}
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-4 opacity-0 sm:px-6"
              >
                <SevenWorld
                  onRestore={() => {
                    naviOpenRef.current = true;
                    setNaviOpen(true);
                    didFocus.current = false;
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
