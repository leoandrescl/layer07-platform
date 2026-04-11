import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PROJECTS } from "@/constants/projects";
import { StaggerReveal, ImageReveal } from "@/components/ui/RevealWrappers";
import { KpiScore } from "@/components/ui/KPI";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export default async function ProjectCaseStudy({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) notFound();

  return (
    <StaggerReveal>
      <main className="w-full bg-black min-h-screen pb-32">
        
        {/* Boutique Navigation */}
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center mix-blend-difference text-white">
          <Link href="/#work" className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] hover:opacity-50 transition-opacity">
            <ArrowLeft size={12} /> Back
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">Case Study</span>
        </nav>

        {/* Hero Section */}
        <section className="pt-40 px-6 md:px-16 max-w-7xl mx-auto flex flex-col gap-8 mb-24">
           <h1 className="text-5xl md:text-8xl font-medium tracking-tighter text-white">{project.title}</h1>
           <p className="max-w-2xl text-xl md:text-2xl font-light text-zinc-400 leading-relaxed border-l-2 border-zinc-800 pl-6">
             {project.description}
           </p>
        </section>

        {/* Main Image Viewport Reveal */}
        <section className="relative w-full aspect-[16/10] md:aspect-[21/9] bg-zinc-900 border-y border-zinc-800 my-16 overflow-hidden">
          <ImageReveal>
            <Image 
              src={project.coverImage}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
            />
          </ImageReveal>
        </section>

        {/* Stack & Metrics Ledger */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-24 mt-32">
          {/* Engineering KPI */}
          <div>
             <h3 className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em] mb-12">Performance KPI</h3>
             <KpiScore score={project.performanceScore} />
          </div>

          {/* Value Tech Stack */}
          <div className="flex flex-col gap-10 border-t md:border-t-0 md:border-l border-zinc-800 pt-12 md:pt-0 md:pl-16">
             <h3 className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em]">Stack Diagnostics</h3>
             <div className="flex flex-col gap-8">
                {project.techStack.map(tech => (
                  <div key={tech} className="border-b border-zinc-800 pb-6 group">
                     <span className="text-3xl text-zinc-300 group-hover:text-white transition-colors font-medium tracking-tight block">{tech}</span>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Footer Traversal Nav */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 mt-40 flex justify-center">
           <Link href="/#work" className="bg-white text-black font-mono text-[10px] uppercase tracking-[0.4em] font-bold px-12 py-6 hover:bg-zinc-200 transition-colors">
              Return to Grid
           </Link>
        </section>

      </main>
    </StaggerReveal>
  );
}
