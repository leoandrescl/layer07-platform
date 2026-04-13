"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface BreathingContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  isFocused?: boolean;
  intensity?: "low" | "medium" | "high";
}

export const BreathingContainer = ({ 
  children, 
  isFocused = false, 
  intensity = "low",
  className = "",
  ...props 
}: BreathingContainerProps) => {
  
  // Normalized Emerald-500 (16, 185, 129)
  const baseBorderColor = isFocused ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.25)";
  const peakBorderColor = isFocused ? "rgba(16, 185, 129, 0.7)" : "rgba(16, 185, 129, 0.55)";
  
  const baseShadowAlpha = isFocused ? 0.08 : 0.04;
  const peakShadowAlpha = isFocused ? 0.28 : 0.16;

  return (
    <motion.div
      animate={{ 
        borderColor: [
          baseBorderColor, 
          peakBorderColor, 
          "rgba(16, 185, 129, 0.9)", // Flicker peak
          baseBorderColor,
          peakBorderColor,
          baseBorderColor
        ],
        boxShadow: [
          `0 0 40px rgba(16, 185, 129, ${baseShadowAlpha})`, 
          `0 0 60px rgba(16, 185, 129, ${peakShadowAlpha})`, 
          `0 0 100px rgba(16, 185, 129, 0.4)`, // Flicker glow
          `0 0 40px rgba(16, 185, 129, ${baseShadowAlpha})`
        ]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "easeInOut",
        times: [0, 0.45, 0.46, 0.47, 0.5, 1] // Stochastic flicker timing
      }}
      className={`bg-emerald-950/20 border relative overflow-hidden group/container ${className}`}
      {...props}
    >
      {/* Dynamic Light Sweep Effect - Re-engineered for full-surface coverage */}
      <motion.div
        initial={{ left: "-100%", opacity: 0 }}
        animate={{ 
          left: ["-100%", "100%"],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "linear",
          repeatDelay: 3 + Math.random() * 2,
          times: [0, 0.1, 0.9, 1]
        }}
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-emerald-400/[0.04] to-transparent skew-x-[35deg] pointer-events-none z-0"
      />
      
      {children}
    </motion.div>
  );
};
