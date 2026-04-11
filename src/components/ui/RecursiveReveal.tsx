"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RecursiveRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const RecursiveReveal = ({ 
  children, 
  delay = 0, 
  className = "" 
}: RecursiveRevealProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};
