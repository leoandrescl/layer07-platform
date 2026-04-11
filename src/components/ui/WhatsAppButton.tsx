"use client";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/tu-numero"
      target="_blank"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className="fixed bottom-8 right-8 z-[60] flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-full backdrop-blur-xl group hover:border-zinc-500 transition-all cursor-pointer"
    >
      <div className="relative">
        <MessageSquare size={20} className="text-zinc-400 group-hover:text-white" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white hidden md:block">
        Direct Line
      </span>
    </motion.a>
  );
};
