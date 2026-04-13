"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from "framer-motion";
import { WiredGrid } from "@/components/ui/WiredGrid";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { WiredTerminal } from "@/components/ui/WiredTerminal";

// Holographic Hero Text with Shimmer
const HoloHeadline = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200/50 to-white bg-[length:200%_auto] animate-shimmer md:whitespace-nowrap ${className}`}
  >
    {children}
  </span>
);

export const InmersiveHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const RevealWrapper = ({
    text,
    className = "",
  }: {
    text: string;
    className?: string;
  }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });
    return (
      <div ref={ref} className={className}>
        <GlitchReveal text={text} isVisible={isInView} duration={2500} />
      </div>
    );
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // Mouse parallax
  const mouseX = useSpring(useMotionValue<number>(0), {
    damping: 50,
    stiffness: 400,
  });
  const mouseY = useSpring(useMotionValue<number>(0), {
    damping: 50,
    stiffness: 400,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(((clientX / innerWidth - 0.5) * 20) as never);
    mouseY.set(((clientY / innerHeight - 0.5) * 20) as never);
  };

  // Scroll-driven text opacity/position
  const t1Opacity = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const t1Y = useTransform(smoothProgress, [0, 0.3], [0, -100]);
  const t2Opacity = useTransform(
    smoothProgress,
    [0.35, 0.45, 0.6, 0.7],
    [0, 1, 1, 0]
  );
  const t2Y = useTransform(smoothProgress, [0.3, 0.5, 0.7], [100, 0, -100]);
  const t3Opacity = useTransform(smoothProgress, [0.75, 0.85, 1], [0, 1, 1]);
  const t3Y = useTransform(smoothProgress, [0.7, 0.9, 1], [100, 0, 0]);

  const wiredX = useTransform(mouseX, (x) => -x * 0.4);
  const wiredY = useTransform(mouseY, (y) => -y * 0.4);

  return (
    <section
      ref={containerRef}
      className="h-[400vh] relative cursor-crosshair font-sans"
      onMouseMove={handleMouseMove}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {/* Layer 0: Wired Vector Grid (replaces heavy CyberNebula shader) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <WiredGrid progress={smoothProgress} />
        </div>

        {/* Layer 1: Ambient Terminal Labels */}
        <motion.div
          style={{ x: wiredX, y: wiredY }}
          className="absolute inset-0 z-[1] pointer-events-none"
        >
          <div className="absolute left-4 md:left-8 top-32 [writing-mode:vertical-lr] rotate-180">
            <WiredTerminal
              text="Layer 01: Weird"
              delay={0.5}
              speed={100}
              className="text-emerald-500/15 text-[10px] md:text-sm uppercase tracking-[0.8em]"
            />
          </div>
          <div className="absolute right-6 md:right-12 top-1/3">
            <WiredTerminal
              text="Layer 02: Girls"
              delay={1}
              speed={80}
              className="text-emerald-500/10 text-[9px] md:text-xs tracking-[0.5em]"
            />
          </div>
          <div className="absolute bottom-32 left-1/4">
            <WiredTerminal
              text="Layer 03: Psyche"
              delay={1.5}
              speed={60}
              className="text-emerald-500/10 text-[10px] uppercase tracking-widest"
            />
          </div>
        </motion.div>

        {/* Layer 2: Typography & HUD */}
        <div className="relative z-10 text-center px-6 w-full overflow-visible">

          {/* Slide 1 — DETERMINISTIC PERFORMANCE */}
          <motion.div
            style={{ opacity: t1Opacity, y: t1Y }}
            className="absolute inset-0 flex flex-col items-center justify-center w-full px-4 md:px-10"
          >
            <h1 className="text-5xl md:text-[5.5vw] font-bold tracking-tight leading-none text-white uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] md:whitespace-nowrap">
              <HoloHeadline>DETERMINISTIC PERFORMANCE</HoloHeadline>
            </h1>
            <div className="mt-8 md:mt-10 bg-black/40 backdrop-blur-md px-6 md:px-8 py-2 border border-emerald-500/20 relative overflow-visible w-full md:w-auto">
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-emerald-400" />
              <p className="text-zinc-400 font-mono text-[10px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.4em] leading-tight md:leading-none">
                CORE WEB VITALS OPTIMIZATION
              </p>
            </div>
          </motion.div>

          {/* Slide 2 — DECOUPLED ARCHITECTURE */}
          <motion.div
            style={{ opacity: t2Opacity, y: t2Y }}
            className="absolute inset-0 flex flex-col items-center justify-center w-full px-4 md:px-10"
          >
            <h2 className="text-5xl md:text-[6.2vw] font-bold tracking-tight leading-none text-white uppercase drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] md:whitespace-nowrap">
              <HoloHeadline>DECOUPLED ARCHITECTURE</HoloHeadline>
            </h2>
            <div className="mt-8 md:mt-10 bg-black/40 backdrop-blur-md px-6 md:px-8 py-2 border border-emerald-500/20 relative overflow-visible w-full md:w-auto">
              <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-emerald-400" />
              <p className="text-zinc-400 font-mono text-[10px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.4em] leading-tight md:leading-none">
                COMPOSABLE COMMERCE SOLUTIONS
              </p>
            </div>
          </motion.div>

          {/* Slide 3 — LAYER07 // STUDIO */}
          <motion.div
            style={{ opacity: t3Opacity, y: t3Y }}
            className="absolute inset-0 flex flex-col items-center justify-center w-full px-4 md:px-10"
          >
            <div className="flex flex-col items-center gap-10 md:gap-14 w-full">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-[6.8vw] font-bold tracking-tight leading-none text-white uppercase min-h-[1.2em] flex items-center justify-center w-full md:whitespace-nowrap"
              >
                <HoloHeadline>
                  <RevealWrapper
                    text="LAYER07 // STUDIO"
                    className="inline-block"
                  />
                </HoloHeadline>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="w-full md:w-auto"
              >
                <div className="flex items-center gap-4 md:gap-6 bg-emerald-400/5 border border-emerald-400/20 px-6 md:px-10 py-4 md:py-5 backdrop-blur-2xl shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-visible">
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-emerald-400" />
                  <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-emerald-400 font-mono text-xs md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase font-bold">
                    LCP &lt; <NumberTicker value="1" decimals={0} />s{" "}
                    <span className="hidden sm:inline text-[10px] ml-2 opacity-50 italic whitespace-nowrap font-normal">
                      AS A STANDARD
                    </span>
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Ambient HUD light sweep */}
        <motion.div
          animate={{
            top: ["-20%", "120%"],
            left: ["-20%", "120%"],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-[5]"
        />
      </div>
    </section>
  );
};
