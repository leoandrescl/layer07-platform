"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AsciiFace } from "./AsciiFace";
import {
  FIRE_GAP_MS,
  isUiTarget,
  playShot,
  pruneHits,
  type ShotHit,
} from "./fx";
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
  const stageRef = useRef<HTMLDivElement>(null);
  const rainPaneRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<Pointer>({ x: 0.5, y: 0.5 });
  const progressRef = useRef(0);
  const hitsRef = useRef<ShotHit[]>([]);
  const lockupRef = useRef<HTMLDivElement>(null);
  const cyanRef = useRef<HTMLSpanElement>(null);
  const magRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const arrivalRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const shellApi = useRef<SevenShellHandle>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const muzzleRef = useRef<HTMLSpanElement>(null);
  const shockRef = useRef<HTMLSpanElement>(null);
  const cursorPos = useRef({ x: 0, y: 0, tx: 0, ty: 0, visible: false });
  const gunRef = useRef({
    flash: 0,
    kickX: 0,
    kickY: 0,
    shakeX: 0,
    shakeY: 0,
    lastShot: 0,
  });
  const typingRef = useRef(false);
  const didFocus = useRef(false);

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
        const s = reducedMotion ? 1 : clamp((p - 0.8) / 0.12);
        shellRef.current.style.opacity = String(s);
        const live = s > 0.55;
        if (shellRef.current.classList.contains("is-live") !== live) {
          shellRef.current.classList.toggle("is-live", live);
        }
        if (s > 0.85 && !didFocus.current && window.matchMedia("(pointer: fine)").matches) {
          didFocus.current = true;
          shellApi.current?.focus();
        }
      }

      const gun = gunRef.current;
      gun.flash *= 0.72;
      gun.kickX *= 0.7;
      gun.kickY *= 0.7;
      gun.shakeX *= 0.76;
      gun.shakeY *= 0.76;

      if (stageRef.current) {
        stageRef.current.style.transform = `translate3d(${gun.shakeX}px, ${gun.shakeY}px, 0)`;
      }

      const c = cursorPos.current;
      const follow = gun.flash > 0.15 ? 0.48 : 0.28;
      c.x += (c.tx - c.x) * follow;
      c.y += (c.ty - c.y) * follow;
      if (cursorRef.current) {
        cursorRef.current.style.opacity =
          c.visible && !typingRef.current ? "1" : "0";
        cursorRef.current.style.transform = `translate3d(${c.x + gun.kickX}px, ${c.y + gun.kickY}px, 0)`;
      }
      if (muzzleRef.current) {
        const bloom = gun.flash;
        muzzleRef.current.style.opacity = String(bloom);
        muzzleRef.current.style.transform = `translate(-50%, -50%) scale(${1 + bloom * 2.8})`;
      }
      if (shockRef.current) {
        const since = (performance.now() - gun.lastShot) / 1000;
        const live = gun.lastShot > 0 && since < 0.32;
        shockRef.current.style.opacity = live ? String(1 - since / 0.32) : "0";
        shockRef.current.style.transform = `translate(-50%, -50%) scale(${live ? 1 + since * 11 : 1})`;
      }

      } finally {
        if (alive) raf = requestAnimationFrame(tick);
      }
    };

    const fireAt = (clientX: number, clientY: number) => {
      if (reducedMotion) return;
      const now = performance.now();
      const gun = gunRef.current;
      if (now - gun.lastShot < FIRE_GAP_MS) return;

      const pane = rainPaneRef.current;
      if (!pane) return;
      const rect = pane.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return;
      }
      const w = Math.max(rect.width, 1);
      const h = Math.max(rect.height, 1);
      const hits = hitsRef.current;
      pruneHits(hits, now);
      hits.push({
        x: (clientX - rect.left) / w,
        y: (clientY - rect.top) / h,
        t: now,
        power: 0.78 + Math.random() * 0.35,
      });

      gun.lastShot = now;
      gun.flash = 1;
      gun.kickX = Math.max(-14, Math.min(14, gun.kickX + (Math.random() - 0.5) * 12));
      gun.kickY = Math.max(-16, Math.min(4, gun.kickY - 8 - Math.random() * 6));
      gun.shakeX = Math.max(-5, Math.min(5, gun.shakeX + (Math.random() - 0.5) * 5));
      gun.shakeY = Math.max(-5, Math.min(5, gun.shakeY + (Math.random() - 0.5) * 4));
      playShot();
    };

    const onPointer = (event: PointerEvent) => {
      const pane = rainPaneRef.current;
      if (pane) {
        const rect = pane.getBoundingClientRect();
        mouseRef.current = {
          x: (event.clientX - rect.left) / Math.max(rect.width, 1),
          y: (event.clientY - rect.top) / Math.max(rect.height, 1),
        };
      }
      cursorPos.current.tx = event.clientX;
      cursorPos.current.ty = event.clientY;
      cursorPos.current.visible = event.pointerType === "mouse";
    };

    const onLeave = () => {
      cursorPos.current.visible = false;
    };

    const canShoot = (event: PointerEvent) => {
      if (reducedMotion) return false;
      if (event.button !== 0) return false;
      if (isUiTarget(event.target)) return false;
      return true;
    };

    const onDown = (event: PointerEvent) => {
      if (!canShoot(event)) return;
      if (typingRef.current) {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
      }
      fireAt(event.clientX, event.clientY);
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
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onHotkey);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readProgress);
      window.removeEventListener("resize", readProgress);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
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
        <div
          ref={stageRef}
          className="sticky top-0 h-dvh overflow-hidden bg-[#050505] will-change-transform select-none"
        >
          <header className="pointer-events-auto absolute top-0 right-0 left-0 z-30 flex items-center justify-between px-4 py-4 font-mono text-[10px] tracking-[0.28em] text-[#00ff66]/80 uppercase sm:px-6">
            <Link href="/labs" className="hover:text-white">
              ESC // LABS
            </Link>
            <span>NODE // SCL</span>
            <span className="text-[#00f0ff]">LAYER 07</span>
          </header>

          <div className="flex h-full flex-col pt-12 lg:flex-row">
            <aside
              aria-label="Retrato ASCII"
              className="relative z-10 h-[40%] min-h-[220px] shrink-0 border-[#00f0ff]/25 lg:h-full lg:w-[min(44vw,540px)] lg:border-r lg:border-dotted"
            >
              <AsciiFace reducedMotion={reducedMotion} />
            </aside>

            <div ref={rainPaneRef} className="relative min-h-0 flex-1">
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
                <RainGL mouseRef={mouseRef} progressRef={progressRef} hitsRef={hitsRef} />
              )}

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,5,0.35)_70%,rgba(5,5,5,0.82)_100%)]" />

              <div
                ref={lockupRef}
                className="pointer-events-none relative z-10 flex h-full select-none flex-col items-center justify-center px-4 text-center will-change-transform"
              >
                <p className="font-mono text-[10px] tracking-[0.42em] text-[#00ff66] uppercase sm:text-[11px]">
                  SYS.LAYER 7 // APPLICATION
                </p>

                <h1 className="relative mt-6 font-sans text-[clamp(2rem,9vw,6.5rem)] font-bold tracking-[-0.06em] text-white uppercase">
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

                <p className="mt-1 font-sans text-[clamp(1.1rem,4vw,2.8rem)] font-medium tracking-[-0.04em] text-white/90 uppercase">
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
                click to fire · scroll to jack in
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
                  click a process — or type
                </p>
              </div>

              <div
                ref={shellRef}
                className="pointer-events-none absolute inset-0 z-20 opacity-0"
                style={reducedMotion ? { opacity: 1 } : undefined}
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
          </div>
        </div>
      </section>

      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform [@media(pointer:fine)]:block"
        aria-hidden
      >
        <span
          ref={muzzleRef}
          className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,230,0.95)_0%,rgba(0,255,120,0.55)_38%,transparent_70%)] opacity-0"
        />
        <span
          ref={shockRef}
          className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00ff66] opacity-0"
        />
        <span className="absolute inset-0 rounded-full border border-[#00ff66]/80" />
        <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#00ff66] shadow-[0_0_10px_#00ff66]" />
        <span className="absolute top-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-[#00ff66]/80" />
        <span className="absolute bottom-0 left-1/2 h-2.5 w-px -translate-x-1/2 bg-[#00ff66]/80" />
        <span className="absolute top-1/2 left-0 h-px w-2.5 -translate-y-1/2 bg-[#00ff66]/80" />
        <span className="absolute top-1/2 right-0 h-px w-2.5 -translate-y-1/2 bg-[#00ff66]/80" />
      </div>
    </>
  );
}
