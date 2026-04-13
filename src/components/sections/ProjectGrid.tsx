"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SOLUTIONS, Solution, KPI } from "@/constants/projects";
import { GlitchTitle } from "@/components/ui/GlitchTitle";
import { NumberTicker } from "@/components/ui/NumberTicker";

// Animated KPI Hologram component
const KPIHologram = ({ kpi, delay = 0 }: { kpi: KPI; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative group"
    >
      {/* Holographic border */}
      <div className="absolute -inset-2 border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors duration-500" />
      
      <div className="px-4 py-3 space-y-1">
        {/* Value */}
        <motion.div
          animate={isInView ? { opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay }}
          className="text-emerald-400 font-mono text-3xl font-bold tracking-tighter leading-none"
        >
          <NumberTicker value={kpi.value} delay={delay} />
        </motion.div>

        {/* Label */}
        <div className="text-zinc-500 font-mono text-[11px] uppercase tracking-[0.2em] leading-tight">
          {kpi.label}
        </div>

        {/* Source citation — activates on hover */}
        {kpi.source && (
          <div className="text-emerald-900 font-mono text-[12px] uppercase tracking-wider group-hover:text-zinc-300 transition-colors duration-500">
            ↳ {kpi.source}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ASCII Architecture Diagram
const ArchDiagram = ({ lines }: { lines: string[] }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative font-mono text-[12px] leading-relaxed p-6 border border-emerald-900/30 bg-emerald-950/[0.02] backdrop-blur-sm"
      style={{ filter: 'drop-shadow(0 0 2px rgba(16,185,129,0.15))' }}
    >
      {/* Scanning line */}
      <motion.div
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent pointer-events-none z-20 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
      />

      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-emerald-500/40" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-emerald-500/40" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-emerald-500/40" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-emerald-500/40" />

      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}
          className={`${
            line.startsWith("[")
              ? "text-emerald-400/80"
              : line.includes("↓") || line.includes("→")
              ? "text-zinc-600"
              : line.includes("CLIENT")
              ? "text-white/90"
              : "text-zinc-600"
          }`}
        >
          {line}
        </motion.div>
      ))}
    </motion.div>
  );
};

const SolutionShowcase = ({ solution, index }: { solution: Solution; index: number }) => {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0.4 }}
      transition={{ duration: 1 }}
      className="w-full min-h-[80vh] flex flex-col items-center justify-center relative py-24"
    >
      {/* Subtle section divider */}
      {index > 0 && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      )}

      <div className={`w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-12 md:gap-24`}>

        {/* Left: Text & KPIs */}
        <div className="flex-1 space-y-10 z-10">

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-emerald-500/50 font-mono text-[11px] uppercase tracking-[0.5em]">
                {solution.id}
              </span>
              <div className="h-px flex-1 bg-emerald-900/40" />
            </div>
            <GlitchTitle
              text={solution.title}
              as="h3"
              delay={`${index * 0.8}s`}
              duration="3s"
              className="text-5xl md:text-6xl font-bold tracking-tighter text-white uppercase leading-none"
            />
            <p className="text-emerald-400/60 font-mono text-sm uppercase tracking-[0.4em]">
              // {solution.subtitle}
            </p>
          </div>

          {/* Concept */}
          <div className="border-l border-emerald-500/20 pl-6">
            <p className="text-zinc-400 font-mono text-sm leading-relaxed uppercase tracking-tighter max-w-md">
              {solution.concept}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {solution.techStack.map((tech) => (
              <span key={tech} className="text-[12px] font-mono text-zinc-600 uppercase tracking-widest">
                // {tech}
              </span>
            ))}
          </div>

          {/* KPI Holograms */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {solution.kpis.map((kpi, i) => (
              <KPIHologram key={kpi.label} kpi={kpi} delay={i * 0.15} />
            ))}
          </div>
        </div>

        {/* Right: Architecture Diagram */}
        <div className="flex-1 w-full z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[11px] font-mono text-emerald-500/40 uppercase tracking-[0.4em]">
                Architecture.Blueprint
              </span>
              <div className="h-px flex-1 bg-emerald-900/30" />
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
            </div>
            <ArchDiagram lines={solution.architectureDiagram} />
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export const ProjectGrid = () => {
  return (
    <section id="work" className="w-full relative z-10 flex flex-col">
      {SOLUTIONS.map((solution, i) => (
        <SolutionShowcase key={solution.id} solution={solution} index={i} />
      ))}
    </section>
  );
};
