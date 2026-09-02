"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { GlitchWord } from "@/components/seven/GlitchWord";
import { RainGL, type Pointer } from "@/components/seven/RainGL";
import { NeonButton } from "@/components/ui/NeonButton";
import { TypeLine } from "@/components/ui/TypeLine";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";

const PHASES = [
  {
    id: "boot",
    eyebrow: "present day, present time.",
    lockup: true,
    title: SITE.tagline,
    body: "Ingeniería full stack para sistemas a medida, e-commerce headless e integraciones API.",
    command: "boot --module engineering --mode production",
    accent: "aqua" as const,
  },
  {
    id: "systems",
    eyebrow: "node // systems",
    title: "Sistemas & Web Apps A Medida",
    body: "Paneles, portales B2B, backends y flujos críticos con ownership total del código.",
    command: "load module:custom-architecture --stack next,ts,api",
    accent: "cyan" as const,
  },
  {
    id: "commerce",
    eyebrow: "node // commerce",
    title: "Headless E-commerce & Storefronts",
    body: "Shopify Storefront API, WooCommerce custom y storefronts orientados a Core Web Vitals.",
    command: "load module:headless-storefront --target conversion",
    accent: "aqua" as const,
  },
  {
    id: "metrics",
    eyebrow: "hud // metrics",
    title: "Performance en producción",
    body: "Arquitectura edge-ready, observabilidad y despliegues predecibles en cloud.",
    command: "status --lcp 0.9s --uptime 99.9% --years 8+",
    accent: "aqua" as const,
    metrics: [
      { label: "LCP", value: "< 1s" },
      { label: "Uptime", value: "99.9%" },
      { label: "Exp", value: "8+ yrs" },
    ],
  },
  {
    id: "connect",
    eyebrow: "link // ready",
    title: "Establecer conexión",
    body: "Canal directo con el lead engineer. Sin intermediarios ni cajas negras.",
    command: "connect --to /contacto --priority high",
    accent: "cyan" as const,
    cta: true,
  },
] as const;

const PHASE_COUNT = PHASES.length;
const SCROLL_HEIGHT_VH = PHASE_COUNT * 72;

function phaseOpacity(index: number, progress: number) {
  const segment = 1 / PHASE_COUNT;
  const start = index * segment;
  const end = (index + 1) * segment;

  if (progress <= start) return index === 0 ? 1 : 0;
  if (progress >= end) return index === PHASE_COUNT - 1 ? 1 : 0;

  const local = (progress - start) / segment;
  if (local < 0.2 && index > 0) return local / 0.2;
  if (local > 0.8 && index < PHASE_COUNT - 1) return (1 - local) / 0.2;
  return 1;
}

const accentText = {
  aqua: "text-[#7fffd4]",
  cyan: "text-[#00f0ff]",
} as const;

export function ImmersiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rainPaneRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<Pointer>({ x: 0.5, y: 0.5 });
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMq = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reducedMotion) return;

    let frame = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / scrollable));
      setProgress(p);
      setActiveIndex(Math.min(PHASE_COUNT - 1, Math.floor(p * PHASE_COUNT)));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
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

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section className="relative overflow-hidden border-b border-dashed border-[#00ff66]/25 bg-[#030b0c]">
        <HeroBackdrop reduced />
        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl items-center px-4 py-16 sm:px-6">
          <HeroContent phase={PHASES[0]} showCta active />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative border-b border-dashed border-[#00ff66]/25"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      aria-label="Hero inmersivo"
    >
      <div
        ref={rainPaneRef}
        className="sticky top-16 flex h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-[#030b0c]"
      >
        <HeroBackdrop reduced={false} mouseRef={mouseRef} />

        <HeroChrome
          activeIndex={activeIndex}
          progress={progress}
          phaseCount={PHASE_COUNT}
        />

        <div className="relative z-10 grid w-full max-w-5xl flex-1 place-items-center px-4 sm:px-6">
          {PHASES.map((phase, i) => {
            const opacity = phaseOpacity(i, progress);
            const y = (1 - opacity) * 20;

            return (
              <div
                key={phase.id}
                className="col-start-1 row-start-1 w-full"
                style={{
                  opacity,
                  transform: `translateY(${y}px)`,
                  transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
                  pointerEvents: opacity > 0.55 ? "auto" : "none",
                  visibility: opacity < 0.03 ? "hidden" : "visible",
                }}
                aria-hidden={opacity < 0.2}
              >
                <HeroContent
                  phase={phase}
                  showCta={"cta" in phase && phase.cta}
                  active={i === activeIndex}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HeroChrome({
  activeIndex,
  progress,
  phaseCount,
}: {
  activeIndex: number;
  progress: number;
  phaseCount: number;
}) {
  return (
    <>
      <div
        className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex"
        aria-hidden
      >
        {PHASES.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "h-7 w-px origin-bottom bg-[#00ff66]/20 transition-all duration-300",
              i === activeIndex && "bg-[#7fffd4] shadow-[0_0_10px_rgba(127,255,212,0.6)]",
            )}
            style={{ transform: `scaleY(${i === activeIndex ? 1 : 0.3})` }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-[#00ff66]/20">
        <div
          className="h-full bg-gradient-to-r from-[#00ff66] via-[#7fffd4] to-[#00f0ff]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="absolute bottom-5 left-4 z-20 font-mono text-[10px] tracking-[0.3em] text-[#8fb8b0] sm:left-6">
        <span className="text-[#7fffd4]">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="text-[#00ff66]/30"> / </span>
        {String(phaseCount).padStart(2, "0")}
      </p>

      <p
        className={cn(
          "lain-cursor absolute bottom-5 left-1/2 z-20 -translate-x-1/2 font-mono text-[10px] tracking-[0.25em] text-[#7fffd4] lowercase transition-opacity duration-500",
          progress > 0.06 ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      >
        layer 07: de-cipher
      </p>
    </>
  );
}

function HeroBackdrop({
  reduced,
  mouseRef,
}: {
  reduced: boolean;
  mouseRef?: RefObject<Pointer>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {reduced || !mouseRef ? (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,40,42,0.55) 3px, rgba(0,40,42,0.55) 4px)",
          }}
        />
      ) : (
        <RainGL mouseRef={mouseRef} />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(3,11,12,0.35)_55%,rgba(3,11,12,0.88)_100%)]" />
      <div
        className="absolute inset-0 z-[2] opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)",
        }}
      />

      <div className="hero-hud-corner absolute top-5 left-4 sm:top-6 sm:left-6" />
      <div className="hero-hud-corner absolute top-5 right-4 rotate-90 sm:top-6 sm:right-6" />
      <div className="hero-hud-corner absolute bottom-14 left-4 -rotate-90 sm:bottom-16 sm:left-6" />
      <div className="hero-hud-corner absolute right-4 bottom-14 rotate-180 sm:right-6 sm:bottom-16" />
    </div>
  );
}

type Phase = (typeof PHASES)[number];

function HeroContent({
  phase,
  showCta,
  active,
}: {
  phase: Phase;
  showCta?: boolean;
  active?: boolean;
}) {
  const lockup = "lockup" in phase && phase.lockup;

  return (
    <div className="w-full text-center sm:text-left">
      <p
        className={cn(
          "font-mono text-xs tracking-[0.28em] sm:text-sm",
          accentText[phase.accent],
        )}
      >
        {phase.eyebrow}
      </p>

      {lockup ? (
        <>
          <h1 className="font-sans lain-glow relative mt-6 text-[clamp(2.6rem,11vw,7.2rem)] leading-none font-normal tracking-[0.06em] text-[#e8fff8] lowercase">
            <GlitchWord text="layer07" />
          </h1>
          <p className="mt-6 max-w-2xl font-mono text-base leading-relaxed tracking-[0.04em] text-[#8fb8b0] sm:text-lg md:text-xl">
            {phase.body}
          </p>
        </>
      ) : (
        <>
          <h1 className="font-sans mt-4 text-4xl leading-[1.1] font-normal tracking-[0.06em] text-[#e8fff8] lowercase sm:text-5xl lg:text-6xl">
            {phase.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-mono text-base leading-relaxed text-[#8fb8b0] sm:mx-0 sm:text-lg">
            {phase.body}
          </p>
        </>
      )}

      {"metrics" in phase && phase.metrics ? (
        <div className="mt-8 flex flex-wrap justify-center gap-8 sm:justify-start">
          {phase.metrics.map((m) => (
            <div key={m.label} className="text-center sm:text-left">
              <p className="font-mono text-3xl text-[#7fffd4] text-glow-neon sm:text-4xl">
                {m.value}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-[#8fb8b0] uppercase">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex justify-center sm:justify-start">
        {active ? (
          <TypeLine key={phase.id} text={phase.command} startDelayMs={120} />
        ) : (
          <p className="font-mono text-base text-[#8fb8b0] sm:text-lg">
            <span className="text-[#00ff66]">guest@layer07</span>
            <span className="text-[#00f0ff]">:~$</span> {phase.command}
          </p>
        )}
      </div>

      {showCta ? (
        <div className="mt-10 flex flex-wrap justify-center gap-4 sm:justify-start">
          <NeonButton href="/contacto">iniciar conexión</NeonButton>
          <NeonButton href="/portafolio" variant="ghost">
            ver nodos en producción
          </NeonButton>
        </div>
      ) : null}

      {lockup ? (
        <p className="mt-8 font-mono text-xs tracking-[0.22em] text-[#8fb8b0] sm:text-sm">
          a body in Santiago · a ghost in the Wired
        </p>
      ) : null}
    </div>
  );
}
