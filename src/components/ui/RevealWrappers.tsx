"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export const StaggerReveal = ({ children }: { children: ReactNode }) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="pt-32 px-8 max-w-7xl mx-auto min-h-screen"
    >
      {children}
    </motion.main>
  );
};

export const ImageReveal = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ scale: 1.1, opacity: 0, filter: "blur(8px)" }}
      animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="absolute inset-0 h-full w-full"
    >
      {children}
    </motion.div>
  );
};
