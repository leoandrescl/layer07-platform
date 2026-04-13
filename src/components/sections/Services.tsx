"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";
import { GlitchTitle } from "@/components/ui/GlitchTitle";
import { BreathingContainer } from "@/components/ui/BreathingContainer";

const SPECS = [
  {
    id: "SPEC-01",
    version: "v4.2",
    title: "HEADLESS CORE",
    tech: "Next.js (App Router) + WordPress CMS",
    description: "Desacoplamiento total del frontend para eliminar la latencia de PHP y maximizar el control sobre el LCP. Arquitectura preparada para el escalado orgánico.",
    kpi: "0.8",
    unit: "s",
    label: "LCP <"
  },
  {
    id: "SPEC-02",
    version: "v3.0",
    title: "DATA TRANSMISSION",
    tech: "GraphQL + ISR (Incremental Static Regeneration)",
    description: "Consultas eficientes a nivel de campo. Los datos se sirven de forma estática pero se revalidan en segundos, garantizando consistencia y velocidad punta.",
    kpi: "50",
    unit: "ms",
    label: "TTFB <"
  },
  {
    id: "SPEC-03",
    version: "v2.5",
    title: "EDGE DEPLOYMENT",
    tech: "Vercel Global Edge Network",
    description: "Distribución de contenidos en el borde de la red. Tiempo de respuesta minimizado globalmente mediante despliegues en infraestructura de clase mundial.",
    kpi: "99.99",
    unit: "%",
    label: "UPTIME"
  }
];

const GlitchText = ({ text }: { text: string }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) triggerGlitch();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className="relative inline-block"
      animate={isGlitching ? {
        x: [0, -2, 2, -1, 1, 0],
        skewX: [0, -5, 5, -2, 2, 0],
        filter: ["none", "hue-rotate(90deg) blur(1px)", "none"]
      } : {}}
      transition={{ duration: 0.15 }}
    >
      {text}
      {isGlitching && (
        <>
          <span className="absolute top-0 left-0 -translate-x-1 translate-y-1 text-red-500 opacity-50 mix-blend-screen select-none">
            {text}
          </span>
          <span className="absolute top-0 left-0 translate-x-1 -translate-y-1 text-blue-500 opacity-50 mix-blend-screen select-none">
            {text}
          </span>
        </>
      )}
    </motion.span>
  );
};

const KPICounter = ({ value, unit, label }: { value: string, unit: string, label: string }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = parseFloat(value);
    const duration = 2000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = (start + (end - start) * easeOutExpo).toFixed(value.includes('.') ? 2 : 0);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex items-center gap-1">
      <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">{label}</span>
      <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest">
        {displayValue}{unit}
      </span>
    </div>
  );
};

const TechnicalBadge = ({ version }: { version: string }) => {
  return (
    <span className="text-[9px] font-mono text-emerald-500/50 border border-emerald-500/20 px-2 py-0.5 backdrop-blur-sm">
      [{version}]
    </span>
  );
};

export const Services = () => {
  return (
    <section id="services" className="w-full py-32 px-6 md:px-8 bg-transparent relative z-10">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-16">
          
          <div className="max-w-2xl">
            <RecursiveReveal>
              <span className="text-emerald-400/60 font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block">
                Engineering Blueprint
              </span>
            </RecursiveReveal>
            <RecursiveReveal delay={0.1}>
              <GlitchTitle
                text="System"
                as="h2"
                delay="0.4s"
                duration="3s"
                className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none"
              /> <br />
              <span className="text-zinc-800">Specifications</span>
            </RecursiveReveal>
          </div>
          <BreathingContainer className="grid grid-cols-1 lg:grid-cols-3 gap-px">
            {SPECS.map((spec, i) => (
              <RecursiveReveal key={spec.id} delay={i * 0.1} className="h-full">
                <div className="bg-black/75 backdrop-blur-xl p-10 h-full flex flex-col justify-between group relative overflow-hidden transition-colors duration-700 hover:bg-black/60">
                  {/* Holographic scanning line effect */}
                  <motion.div 
                    animate={{ y: ["-100%", "300%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent pointer-events-none"
                  />
                  
                  <div>
                    <div className="flex justify-between items-center mb-12">
                      <span className="text-[10px] font-mono text-zinc-600 tracking-widest">{spec.id}</span>
                      <TechnicalBadge version={spec.version} />
                    </div>
                    
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-6 uppercase group-hover:text-emerald-400 transition-colors duration-500">
                      {spec.title}
                    </h3>
                    
                    <div className="mb-6">
                      <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-wider mb-2">Technology Stack</p>
                      <p className="text-zinc-300 font-mono text-xs border-l border-emerald-500/30 pl-3">
                        {spec.tech}
                      </p>
                    </div>

                    <p className="text-zinc-500 font-mono text-[11px] leading-relaxed uppercase tracking-tighter">
                      {spec.description}
                    </p>
                  </div>

                  <div className="mt-12 pt-6 border-t border-emerald-500/10 flex justify-between items-center">
                    <KPICounter value={spec.kpi} unit={spec.unit} label={spec.label} />
                  </div>
                </div>
              </RecursiveReveal>
            ))}
          </BreathingContainer>

        </div>
      </div>
    </section>
  );
};
