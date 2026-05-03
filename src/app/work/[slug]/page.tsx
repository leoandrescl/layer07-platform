import { notFound } from "next/navigation";
import Link from "next/link";
import { SOLUTIONS } from "@/constants/projects";
import { StaggerReveal } from "@/components/ui/RevealWrappers";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.code.toLowerCase() }));
}

export default async function SolutionDetail({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const solution = SOLUTIONS.find(
    (s) => s.code.toLowerCase() === slug || s.id.toLowerCase() === slug
  );

  if (!solution) notFound();

  return (
    <StaggerReveal>
      <main className="w-full min-h-screen pb-32">

        {/* Navigation */}
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference text-white">
          <Link href="/#work" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] hover:opacity-50 transition-opacity">
            <ArrowLeft size={12} /> Back
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">Architecture Blueprint</span>
        </nav>

        {/* Hero */}
        <section className="pt-40 px-6 md:px-16 max-w-7xl mx-auto flex flex-col gap-6 mb-24">
          <span className="text-emerald-500/50 font-mono text-[9px] uppercase tracking-[0.5em]">{solution.id}</span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white uppercase leading-none">{solution.title}</h1>
          <p className="text-emerald-400/60 font-mono text-sm uppercase tracking-[0.3em]">// {solution.subtitle}</p>
          <p className="max-w-2xl text-lg font-mono text-zinc-400 leading-relaxed border-l-2 border-emerald-900/40 pl-6 uppercase tracking-tight">
            {solution.concept}
          </p>
        </section>

        {/* KPIs */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-emerald-900/20 border border-emerald-900/30 mb-24">
          {solution.kpis.map((kpi) => (
            <div key={kpi.label} className="p-10 bg-emerald-950/[0.01] backdrop-blur-sm flex flex-col gap-2">
              <span className="text-emerald-400 font-mono text-5xl font-bold tracking-tighter">{kpi.value}</span>
              <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">{kpi.label}</span>
              {kpi.source && <span className="text-zinc-800 font-mono text-[8px]">↳ {kpi.source}</span>}
            </div>
          ))}
        </section>

        {/* Architecture Diagram */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 mb-24">
          <h3 className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em] mb-8">Architecture.Blueprint</h3>
          <div className="border border-emerald-900/30 p-8 font-mono text-sm text-emerald-400/80 space-y-1 bg-emerald-950/[0.01] backdrop-blur-sm">
            {solution.architectureDiagram.map((line, i) => (
              <div key={i} className={line.includes("CLIENT") ? "text-white font-bold" : ""}>{line}</div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 mb-24">
          <h3 className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em] mb-8">Stack Diagnostics</h3>
          <div className="flex flex-col gap-px">
            {solution.techStack.map((tech) => (
              <div key={tech} className="border-b border-emerald-900/20 py-6 group">
                <span className="text-3xl text-zinc-300 group-hover:text-emerald-400 transition-colors font-mono tracking-tight">
                  // {tech}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Return */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 mt-40 flex justify-center">
          <Link href="/#work" className="border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase tracking-[0.4em] px-12 py-6 hover:bg-emerald-500/5 transition-colors">
            Return to Solutions
          </Link>
        </section>

      </main>
    </StaggerReveal>
  );
}
