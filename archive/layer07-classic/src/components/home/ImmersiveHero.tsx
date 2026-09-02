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
  neon: "text-neon text-glow-neon",
  cyan: "text-cyan text-glow-cyan",
  magenta: "text-magenta",
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
      setActiveIndex(Math.min(PHASE_COUNT - 1, Math.floor(p * PHASE_COUNT)));
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
    return (
      <section className="relative overflow-hidden border-b border-border">
        <HeroBackdrop progress={0} parallax={() => 0} />
        <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-5xl items-center px-4 py-16 sm:px-6">
          <HeroContent phase={PHASES[0]} showCta active />
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
      <div className="sticky top-16 flex h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden">
        <HeroBackdrop progress={progress} parallax={parallax} />

        <HeroChrome
          activeIndex={activeIndex}
          progress={progress}
          phaseCount={PHASE_COUNT}
        />

        {/* Todas las fases en la misma celda → centrado real */}
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
              "h-7 w-px origin-bottom bg-border transition-all duration-300",
              i === activeIndex && "bg-neon shadow-neon",
            )}
            style={{ transform: `scaleY(${i === activeIndex ? 1 : 0.3})` }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 h-px bg-border">
        <div
          className="h-full bg-gradient-to-r from-neon via-cyan to-magenta"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p className="absolute bottom-5 left-4 z-20 font-mono text-[10px] tracking-[0.3em] text-muted-dim sm:left-6">
        <span className="text-neon">
          {String(activeIndex + 1).padStart(2, "0")}
        </span>
        <span className="text-border"> / </span>
        {String(phaseCount).padStart(2, "0")}
      </p>

      <div
        className={cn(
          "absolute bottom-5 left-1/2 z-20 -translate-x-1/2 font-mono text-[10px] tracking-[0.25em] text-muted-dim uppercase transition-opacity duration-500",
          progress > 0.06 ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      >
        <span className="animate-bounce-subtle block text-center">▼ scroll</span>
      </div>
    </>
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
      <div className="absolute inset-0 bg-background" />

      <div
        className="hero-perspective-grid absolute inset-x-0 bottom-0 h-[42%] opacity-40"
        style={{ transform: `translateY(${parallax(-15)}px)` }}
      />

      <div
        className="absolute -top-1/4 left-1/4 size-[min(80vw,520px)] rounded-full bg-neon/8 blur-[100px]"
        style={{ transform: `translate(${parallax(25)}px, ${parallax(15)}px)` }}
      />
      <div
        className="absolute right-0 bottom-0 size-[min(70vw,400px)] rounded-full bg-cyan/8 blur-[90px]"
        style={{ transform: `translate(${parallax(-20)}px, ${parallax(-10)}px)` }}
      />

      <div className="hero-nodes absolute inset-0 opacity-20" />
      <div className="hero-scan-beam absolute inset-x-0 top-0 h-16 opacity-20" />
      <div className="absolute inset-0 bg-scanlines opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,#050505_100%)]" />

      <div className="hero-hud-corner absolute top-5 left-4 sm:top-6 sm:left-6" />
      <div className="hero-hud-corner absolute top-5 right-4 rotate-90 sm:top-6 sm:right-6" />
      <div className="hero-hud-corner absolute bottom-14 left-4 -rotate-90 sm:bottom-16 sm:left-6" />
      <div className="hero-hud-corner absolute right-4 bottom-14 rotate-180 sm:right-6 sm:bottom-16" />

      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent"
        style={{ opacity: 0.4 + progress * 0.6 }}
      />
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
  return (
    <div className="w-full text-center sm:text-left">
      <p
        className={cn(
          "font-mono text-[11px] tracking-[0.35em] uppercase",
          accentText[phase.accent],
        )}
      >
        {phase.eyebrow}
      </p>

      <h1 className="mt-4 text-3xl leading-[1.1] font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
        {phase.title}
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-dim sm:mx-0 sm:text-base">
        {phase.body}
      </p>

      {"metrics" in phase && phase.metrics ? (
        <div className="mt-8 flex flex-wrap justify-center gap-8 sm:justify-start">
          {phase.metrics.map((m) => (
            <div key={m.label} className="text-center sm:text-left">
              <p className="font-mono text-2xl text-neon text-glow-neon sm:text-3xl">
                {m.value}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted-dim uppercase">
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
          <p className="font-mono text-sm text-muted-dim">
            <span className="text-neon">root@layer07</span>
            <span className="text-cyan">:~$</span> {phase.command}
          </p>
        )}
      </div>

      {showCta ? (
        <div className="mt-10 flex flex-wrap justify-center gap-4 sm:justify-start">
          <NeonButton href="/contacto">Iniciar conexión</NeonButton>
          <NeonButton href="/portafolio" variant="ghost">
            Ver nodos en producción
          </NeonButton>
        </div>
      ) : null}

      <p className="mt-8 font-mono text-[10px] tracking-widest text-muted-dim uppercase">
        <span className="text-cyan">session</span> · dark · edge · scl
      </p>
    </div>
  );
}
