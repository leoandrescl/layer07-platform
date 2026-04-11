"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PROJECTS, Project } from "@/constants/projects";

const containerVariants = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as any,
    },
  },
};

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <Link 
      href={`/work/${project.slug}`} 
      aria-label={`View Case Study: ${project.title}`} 
      className="block w-full will-change-transform"
    >
      <motion.div
        variants={cardVariants}
        className="group relative flex flex-col justify-end w-full aspect-[16/10] overflow-hidden bg-black border border-neutral-800 transition-all cursor-pointer"
      >
        {/* Visual Placeholder for Image */}
        <div className="absolute inset-x-0 inset-y-0 md:inset-x-6 md:inset-y-6 bg-neutral-900 border border-neutral-800 transition-transform duration-700 group-hover:scale-105 flex items-center justify-center">
          <span className="text-neutral-500 font-mono tracking-[0.2em] uppercase text-xs opacity-50">
            /{project.slug}
          </span>
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-10 flex flex-col justify-between h-full pointer-events-none">
          
          {/* Top Right "VIEW CASE STUDY" which appears on hover */}
          <div className="flex justify-end w-full opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
             <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white bg-black/50 border border-neutral-700 px-3 py-1">
               VIEW CASE STUDY ↗
             </span>
          </div>

          {/* Bottom Content Area */}
          <div className="flex flex-col items-start w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             <div className="flex gap-2 mb-4">
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/5 px-2 py-1 border border-emerald-400/20">
                  {project.performanceScore}% SCORE
                </span>
             </div>
             
             <h3 className="text-3xl md:text-4xl font-medium tracking-tighter text-white mb-3">
               {project.title}
             </h3>
             
             <p className="border-l border-neutral-700 pl-3 text-neutral-400 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
               {project.techStack.join(" / ")}
             </p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export const ProjectGrid = () => {
  return (
    <section id="work" className="w-full pb-24 md:pb-32 relative z-10">
      <motion.div 
        variants={containerVariants}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: false, amount: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-6 md:px-8"
      >
        {PROJECTS.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>
    </section>
  );
};
