"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { PROJECTS, Project } from "@/constants/projects";

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  },
};

const ProjectShowcase = ({ project, index }: { project: Project, index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: false, amount: 0.2 }}
      className="w-full min-h-[70vh] flex flex-col items-center justify-center relative py-24"
    >
      <div className={`w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-24`}>
        
        {/* Text content - Authority Positioning */}
        <div className="flex-1 space-y-8 z-10">
          <div className="space-y-2">
            <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.4em] block">
              Project Specification 0{index + 1}
            </span>
            <h3 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase leading-none">
              {project.title}
            </h3>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2">
               {project.slug}.cl
            </p>
          </div>

          <div className="border-l border-emerald-500/20 pl-6 space-y-6">
            <p className="text-zinc-400 font-mono text-sm leading-relaxed uppercase tracking-tight max-w-md">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {project.techStack.map(tech => (
                <span key={tech} className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  // {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Prominent KPIs */}
          <div className="flex gap-12 pt-4">
             <div className="flex flex-col">
                <span className="text-emerald-400 font-mono text-4xl font-bold tracking-tighter">
                  {project.performanceScore}%
                </span>
                <span className="text-zinc-700 font-mono text-[9px] uppercase tracking-[0.3em]">
                  Performance Score
                </span>
             </div>
             <div className="flex flex-col">
                <span className="text-emerald-400 font-mono text-4xl font-bold tracking-tighter">
                  &lt;0.8s
                </span>
                <span className="text-zinc-700 font-mono text-[9px] uppercase tracking-[0.3em]">
                  LCP Standard
                </span>
             </div>
          </div>

          <div className="pt-8">
            <Link 
              href={`/work/${project.slug}`}
              className="group flex items-center gap-4 text-white font-mono text-[10px] uppercase tracking-[0.4em] hover:text-emerald-400 transition-colors"
            >
              EXPLORE ARCHITECTURE <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Visual Showcase - Holographic Station */}
        <div className="flex-1 w-full relative">
          <div className="relative aspect-video md:aspect-[4/3] w-full group">
            {/* Holographic Border & Glow */}
            <div className="absolute -inset-4 border border-emerald-900/40 bg-emerald-500/[0.01] backdrop-blur-3xl transition-all duration-700 group-hover:bg-emerald-500/[0.03] group-hover:border-emerald-500/20" />
            
            <div className="relative w-full h-full overflow-hidden border border-white/5 grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl">
              <Image 
                src={project.coverImage}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            </div>

            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-emerald-500/20 translate-x-1.5 -translate-y-1.5" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-emerald-500/20 -translate-x-1.5 translate-y-1.5" />
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export const ProjectGrid = () => {
  return (
    <section id="work" className="w-full relative z-10 flex flex-col">
      {/* Depth Veil Overlay */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
      
      {PROJECTS.map((project, i) => (
        <ProjectShowcase key={project.id} project={project} index={i} />
      ))}
    </section>
  );
};
