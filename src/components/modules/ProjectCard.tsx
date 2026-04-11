"use client";
import { motion } from "framer-motion";
import { Project } from "@/types/project";
import { Zap, ShieldCheck, Gauge } from "lucide-react";

interface Props {
  project: Project;
  index: number;
}

export const ProjectCard = ({ project, index }: Props) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative aspect-[16/10] w-full overflow-hidden bg-zinc-900 border border-zinc-800"
    >
      {/* Background Image con desaturación en hover */}
      <motion.img 
        src={project.featuredImage.node.sourceUrl}
        alt={project.title}
        className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-30 group-hover:grayscale-0"
      />

      {/* Overlay de Datos Técnicos (Solo visible en Hover) */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <Gauge size={14} className="text-green-400" />
            <span className="text-[10px] font-mono font-bold">{project.projectDetails.performanceScore} LCP</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-mono font-bold">STABLE CLS</span>
          </div>
        </div>

        <h3 className="text-3xl font-medium tracking-tighter mb-2 text-white">{project.title}</h3>
        <p className="text-zinc-400 text-sm max-w-md line-clamp-2 mb-6 font-mono uppercase tracking-widest text-[10px]">
          {project.projectDetails.challengeDescription}
        </p>
        
        <div className="flex gap-2">
          {project.projectDetails.techStack.map(tech => (
            <span key={tech} className="text-[9px] border border-zinc-700 px-2 py-0.5 text-zinc-500">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Indicador de "View Case" sutil */}
      <div className="absolute top-6 right-6 opacity-40 group-hover:opacity-100 transition-opacity text-white">
        <Zap size={18} />
      </div>
    </motion.div>
  );
};
