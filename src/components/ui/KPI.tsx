"use client";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

export const KpiScore = ({ score }: { score: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const stepTime = 15;
      const increment = Math.ceil(score / 50);
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setCount(score);
          clearInterval(interval);
        } else {
          setCount(current);
        }
      }, stepTime);
      return () => clearInterval(interval);
    }
  }, [isInView, score]);

  return (
    <div ref={ref} className="flex flex-col items-start gap-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {  }}
        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        className="text-[12vw] md:text-[8vw] leading-none font-mono text-emerald-400 font-bold tracking-tighter mix-blend-screen"
      >
        {count}<span className="text-4xl md:text-6xl text-emerald-600">%</span>
      </motion.div>
      <span className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] border-l border-zinc-800 pl-4 py-2">
        LCP Optimization <br /> Verified Target
      </span>
    </div>
  );
};
