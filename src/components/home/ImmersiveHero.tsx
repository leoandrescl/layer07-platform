"use client";

import { useEffect, useRef, useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import { TypeLine } from "@/components/ui/TypeLine";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";

const PHASES = [
  {
    id: "boot",
    eyebrow: SITE.name,
    title: SITE.tagline,
    body: "Ingeniería full stack para sistemas a medida, e-commerce headless e integraciones API.",
    command: "boot --module engineering --mode production",
    accent: "neon" as const,
  },
  {
    id: "systems",
    eyebrow: "NODE // SYSTEMS",
    title: "Sistemas & Web Apps A Medida",
    body: "Paneles, portales B2B, backends y flujos críticos con ownership total del código.",
    command: "load module:custom-architecture --stack next,ts,api",
    accent: "cyan" as const,
  },
  {
    id: "commerce",
    eyebrow: "NODE // COMMERCE",
    title: "Headless E-commerce & Storefronts",
    body: "Shopify Storefront API, WooCommerce custom y storefronts orientados a Core Web Vitals.",
    command: "load module:headless-storefront --target conversion",
    accent: "magenta" as const,
  },
  {
    id: "metrics",
    eyebrow: "HUD // METRICS",
    title: "Performance en producción",
    body: "Arquitectura edge-ready, observabilidad y despliegues predecibles en cloud.",
    command: "status --lcp 0.9s --uptime 99.9% --years 8+",
    accent: "neon" as const,
    metrics: [
      { label: "LCP", value: "< 1s" },
      { label: "Uptime", value: "99.9%" },
      { label: "Exp", value: "8+ yrs" },
    ],
  },
  {
    id: "connect",
    eyebrow: "LINK // READY",
    title: "Establecer conexión",
    body: "Canal directo con el lead engineer. Sin intermediarios ni cajas negras.",
    command: "connect --to /contacto --priority high",
    accent: "cyan" as const,
    cta: true,
  },
] as const;

const PHASE_COUNT = PHASES.length;
const SCROLL_HEIGHT_VH = PHASE_COUNT * 85;

function phaseOpacity(index: number, progress: number) {
  const center = (index + 0.5) / PHASE_COUNT;
  const halfBand = 0.5 / PHASE_COUNT;
  const dist = Math.abs(progress - center);
  if (dist >= halfBand * 2) return 0;
  return 1 - dist / halfBand;
}

const accentText = {
  neon: "text-neon text-glow-neon",
  cyan: "text-cyan text-glow-cyan",
  magenta: "text-magenta",
} as const;

const accentBorder = {
  neon: "border-neon/40 shadow-neon",
  cyan: "border-cyan/40 shadow-cyan",
  magenta: "border-magenta/40 shadow-magenta",
} as const;

export function ImmersiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
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
      setActiveIndex(
        Math.min(PHASE_COUNT - 1, Math.floor(p * PHASE_COUNT)),
      );
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  const parallax = (factor: number) =>
    reducedMotion ? 0 : (progress - 0.5) * factor;

  if (reducedMotion) {
    const phase = PHASES[0];
    return (
      <section className="relative overflow-hidden border-b border-border">
        <HeroBackdrop progress={0} parallax={() => 0} />
        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
          <HeroContent phase={phase} showCta />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative border-b border-border"
      style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      aria-label="Hero inmersivo"
    >
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
        <HeroBackdrop progress={progress} parallax={parallax} />

        {/* Phase rail */}
        <div
          className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 flex-col gap-2 sm:flex"
          aria-hidden
        >
          {PHASES.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "h-8 w-0.5 origin-bottom bg-border transition-all duration-300",
                i === activeIndex && "bg-neon shadow-neon",
              )}
              style={{
                transform: `scaleY(${i === activeIndex ? 1 : 0.35})`,
              }}
            />
          ))}
        </div>

        {/* Scroll progress */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-border">
          <div
            className="h-full bg-gradient-to-r from-neon via-cyan to-magenta transition-[width] duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Phase counter */}
        <p className="absolute bottom-6 left-4 z-20 font-mono text-[10px] tracking-[0.3em] text-muted-dim sm:left-6">
          <span className="text-neon">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="text-border"> / </span>
          {String(PHASE_COUNT).padStart(2, "0")}
        </p>

        {/* Scroll hint */}
        <div
          className={cn(
            "absolute bottom-6 left-1/2 z-20 -translate-x-1/2 font-mono text-[10px] tracking-[0.25em] text-muted-dim uppercase transition-opacity duration-500",
            progress > 0.08 ? "opacity-0" : "opacity-100",
          )}
          aria-hidden
        >
          <span className="animate-bounce-subtle block text-center">▼ scroll</span>
        </div>

        {/* Content phases */}
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6">
          {PHASES.map((phase, i) => {
            const opacity = phaseOpacity(i, progress);
            const scale = 0.94 + opacity * 0.06;
            const y = (1 - opacity) * 28;
            return (
              <div
                key={phase.id}
                className="pointer-events-none absolute inset-x-4 top-1/2 max-w-3xl -translate-y-1/2 sm:inset-x-6"
                style={{
                  opacity,
                  transform: `translateY(calc(-50% + ${y}px)) scale(${scale})`,
                  transition: "opacity 0.15s linear, transform 0.15s linear",
                  pointerEvents: opacity > 0.6 ? "auto" : "none",
                }}
                aria-hidden={opacity < 0.2}
              >
                <HeroContent
                  phase={phase}
                  showCta={"cta" in phase && phase.cta}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HeroBackdrop({
  progress,
  parallax,
}: {
  progress: number;
  parallax: (factor: number) => number;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Layer 0 — void */}
      <div className="absolute inset-0 bg-background" />

      {/* Layer 1 — perspective grid */}
      <div
        className="hero-perspective-grid absolute inset-0 opacity-60"
        style={{ transform: `translateY(${parallax(-40)}px)` }}
      />

      {/* Layer 2 — radial glows */}
      <div
        className="absolute -top-1/4 left-1/4 size-[min(80vw,520px)] rounded-full bg-neon/10 blur-[100px]"
        style={{ transform: `translate(${parallax(30)}px, ${parallax(20)}px)` }}
      />
      <div
        className="absolute right-0 bottom-0 size-[min(70vw,400px)] rounded-full bg-cyan/10 blur-[90px]"
        style={{ transform: `translate(${parallax(-25)}px, ${parallax(-15)}px)` }}
      />
      <div
        className="absolute top-1/3 right-1/4 size-48 rounded-full bg-magenta/8 blur-[70px]"
        style={{ transform: `translate(${parallax(15)}px, ${parallax(35)}px)` }}
      />

      {/* Layer 3 — horizon line */}
      <div
        className="absolute inset-x-0 top-[58%] h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent"
        style={{
          transform: `translateY(${parallax(-60)}px) scaleX(${0.6 + progress * 0.4})`,
        }}
      />

      {/* Layer 4 — floating nodes */}
      <div className="hero-nodes absolute inset-0 opacity-40" />

      {/* Layer 5 — scan beam */}
      <div className="hero-scan-beam absolute inset-x-0 top-0 h-32 opacity-50" />

      {/* Layer 6 — scanlines + vignette */}
      <div className="absolute inset-0 bg-scanlines opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#050505_100%)]" />

      {/* Layer 7 — HUD corners */}
      <div className="hero-hud-corner absolute top-6 left-4 sm:top-8 sm:left-6" />
      <div className="hero-hud-corner absolute top-6 right-4 rotate-90 sm:top-8 sm:right-6" />
      <div className="hero-hud-corner absolute bottom-16 left-4 -rotate-90 sm:bottom-20 sm:left-6" />
      <div className="hero-hud-corner absolute right-4 bottom-16 rotate-180 sm:right-6 sm:bottom-20" />

      {/* Layer 8 — top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
    </div>
  );
}

type Phase = (typeof PHASES)[number];

function HeroContent({
  phase,
  showCta,
}: {
  phase: Phase;
  showCta?: boolean;
}) {
  return (
    <div
      className={cn(
        "border bg-surface/40 p-6 backdrop-blur-sm sm:p-8",
        accentBorder[phase.accent],
      )}
    >
      <p
        className={cn(
          "font-mono text-[11px] tracking-[0.35em] uppercase",
          accentText[phase.accent],
        )}
      >
        {phase.eyebrow}
      </p>
      <h1 className="mt-4 text-2xl leading-tight font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {phase.title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-dim sm:text-base">
        {phase.body}
      </p>

      {"metrics" in phase && phase.metrics ? (
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          {phase.metrics.map((m) => (
            <div
              key={m.label}
              className="border border-border/80 bg-background/60 px-2 py-3 text-center sm:px-3"
            >
              <p className="font-mono text-lg text-neon text-glow-neon sm:text-2xl">
                {m.value}
              </p>
              <p className="mt-1 font-mono text-[9px] tracking-widest text-muted-dim uppercase">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5">
        <TypeLine text={phase.command} startDelayMs={200} />
      </div>

      {showCta ? (
        <div className="mt-8 flex flex-wrap gap-4">
          <NeonButton href="/contacto">Iniciar conexión</NeonButton>
          <NeonButton href="/portafolio" variant="ghost">
            Ver nodos en producción
          </NeonButton>
        </div>
      ) : null}

      <p className="mt-6 font-mono text-[10px] tracking-widest text-muted-dim uppercase">
        <span className="text-cyan">session</span> · dark · edge · scl
      </p>
    </div>
  );
}
