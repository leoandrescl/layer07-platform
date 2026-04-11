"use client";

import { motion } from "framer-motion";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";

const SPECS = [
  {
    id: "SPEC-01",
    version: "v4.2",
    title: "HEADLESS CORE",
    tech: "Next.js (App Router) + WordPress CMS",
    description: "Desacoplamiento total del frontend para eliminar la latencia de PHP y maximizar el control sobre el LCP. Arquitectura preparada para el escalado orgánico.",
    kpi: "LCP < 0.8s"
  },
  {
    id: "SPEC-02",
    version: "v3.0",
    title: "DATA TRANSMISSION",
    tech: "GraphQL + ISR (Incremental Static Regeneration)",
    description: "Consultas eficientes a nivel de campo. Los datos se sirven de forma estática pero se revalidan en segundos, garantizando consistencia y velocidad punta.",
    kpi: "TTFB < 50ms"
  },
  {
    id: "SPEC-03",
    version: "v2.5",
    title: "EDGE DEPLOYMENT",
    tech: "Vercel Global Edge Network",
    description: "Distribución de contenidos en el borde de la red. Tiempo de respuesta minimizado globalmente mediante despliegues en infraestructura de clase mundial.",
    kpi: "UPTIME 99.99%"
  }
];

const TechnicalBadge = ({ version }: { version: string }) => {
  return (
    <motion.span
      variants={{
        initial: { opacity: 0 },
        whileInView: { 
          opacity: 1,
          transition: {
            delay: 0.8, // Wait for RecursiveReveal to finish
            duration: 0.1,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            repeat: 0,
            ease: "linear"
          }
        }
      }}
      className="text-[9px] font-mono text-zinc-600 border border-zinc-800 px-2 py-0.5"
    >
      [{version}]
    </motion.span>
  );
};

export const Services = () => {
  return (
    <section id="services" className="w-full py-32 px-6 md:px-8 bg-black relative z-10 border-t border-neutral-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-16">
          
          <div className="max-w-2xl">
            <RecursiveReveal>
              <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.4em] mb-4 block">
                Engineering Blueprint
              </span>
            </RecursiveReveal>
            <RecursiveReveal delay={0.1}>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none">
                System <br /> <span className="text-zinc-800">Specifications</span>
              </h2>
            </RecursiveReveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800 overflow-hidden">
            {SPECS.map((spec, i) => (
              <RecursiveReveal key={spec.id} delay={i * 0.1} className="h-full">
                <div className="bg-black p-10 h-full flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-center mb-12">
                      <span className="text-[10px] font-mono text-zinc-500 tracking-widest">{spec.id}</span>
                      <TechnicalBadge version={spec.version} />
                    </div>
                    
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-6 uppercase">
                      {spec.title}
                    </h3>
                    
                    <div className="mb-6">
                      <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider mb-2">Technology Stack</p>
                      <p className="text-zinc-300 font-mono text-xs border-l border-emerald-500/30 pl-3">
                        {spec.tech}
                      </p>
                    </div>

                    <p className="text-zinc-500 font-mono text-[11px] leading-relaxed uppercase tracking-tighter">
                      {spec.description}
                    </p>
                  </div>

                  <div className="mt-12 pt-6 border-t border-neutral-900 flex justify-between items-center">
                    <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Target Metric</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold tracking-widest">{spec.kpi}</span>
                  </div>
                </div>
              </RecursiveReveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
