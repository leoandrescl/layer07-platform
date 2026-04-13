"use client";

import { motion } from "framer-motion";
import { PROJECTS } from "@/constants/projects";

const textVariants = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any }
};

export const ProjectHeader = () => {
  return (
    <section className="w-full pt-32 pb-12 max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-start gap-8 z-10 relative">
      <div className="flex flex-col gap-4">
        <motion.span 
          {...textVariants}
          className="text-emerald-400 font-mono text-[10px] uppercase tracking-[0.4em] block"
        >
          Portfolio Selection
        </motion.span>
        
        <motion.h2 
          {...textVariants}
          transition={{ ...textVariants.transition, delay: 0.1 }}
          className="text-5xl md:text-7xl font-medium tracking-tighter text-white"
        >
          Selected Works
        </motion.h2>
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-t border-neutral-800 pt-8 mt-8">
        <motion.p 
          {...textVariants}
          transition={{ ...textVariants.transition, delay: 0.2 }}
          className="max-w-md text-neutral-400 font-light text-lg leading-relaxed"
        >
          Exploramos las fronteras de la ingeniería web, priorizando arquitecturas desacopladas y latencia cero para marcas que exigen distinción técnica.
        </motion.p>
        
        <motion.div 
          {...textVariants}
          transition={{ ...textVariants.transition, delay: 0.3 }}
          className="flex flex-col items-end gap-2"
        >
          <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Engineering Solutions</span>
          <span className="text-4xl font-mono text-white font-bold">
            {PROJECTS.length.toString().padStart(2, '0')}
          </span>
        </motion.div>
      </div>
    </section>
  );
};
