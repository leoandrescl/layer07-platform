import { Code2, Cpu, Globe, Zap } from "lucide-react";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";
import { BreathingContainer } from "@/components/ui/BreathingContainer";

const SPECS = [
  {
    category: "01. Frontend Engine",
    title: "Next.js 16 & App Router",
    details: ["Partial Prerendering (PPR)", "Server Actions", "Streaming SSR"],
    icon: <Cpu size={20} className="text-zinc-500" />
  },
  {
    category: "02. Content Infrastructure",
    title: "Composable Commerce",
    details: ["WP-GraphQL Mesh", "Atomic Design Systems", "Headless Shopify"],
    icon: <Code2 size={20} className="text-zinc-500" />
  },
  {
    category: "03. Performance Metrics",
    title: "Ultra-Low Latency",
    details: ["LCP < 0.8s", "100/100 Core Web Vitals", "Edge Runtime Deployment"],
    icon: <Zap size={20} className="text-zinc-500" />
  }
];

export const TechBoard = () => {
  return (
    <section id="services" className="py-32 px-8 bg-zinc-950/50 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Header de la sección */}
          <div className="lg:col-span-1">
            <RecursiveReveal>
              <h2 className="text-5xl font-medium tracking-tighter mb-6 leading-tight">
                System <br /> <span className="text-zinc-700 italic">Specifications</span>
              </h2>
            </RecursiveReveal>
            <RecursiveReveal delay={0.2}>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest leading-relaxed">
                No construimos sitios web convencionales. Diseñamos sistemas de software optimizados para la conversión y la escala, utilizando el stack más avanzado disponible en 2026.
              </p>
            </RecursiveReveal>
          </div>

          {/* Board de Specs */}
          <BreathingContainer className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
            {SPECS.map((spec, i) => (
              <RecursiveReveal key={i} delay={i * 0.1} className="h-full">
                <div 
                  className="bg-black p-8 group hover:bg-zinc-950 transition-colors pointer-events-auto border border-zinc-900 h-full"
                >
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">{spec.category}</span>
                    {spec.icon}
                  </div>
                  <h3 className="text-2xl font-medium mb-4 tracking-tight">{spec.title}</h3>
                  <ul className="space-y-2">
                    {spec.details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 uppercase tracking-tighter">
                        <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </RecursiveReveal>
            ))}
            
            {/* CTA / Availability Box */}
            <div className="bg-zinc-900 p-8 flex flex-col justify-center items-center text-center pointer-events-auto">
              <Globe size={32} className="mb-4 text-zinc-700 animate-pulse" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-2">Network Status</p>
              <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Available for Q3-2026</span>
            </div>
          </BreathingContainer>

        </div>
      </div>
    </section>
  );
};
