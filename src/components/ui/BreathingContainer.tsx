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
  
  // Base values for the breathing cycle
  const baseBorderColor = isFocused ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.2)";
  const peakBorderColor = isFocused ? "rgba(16, 185, 129, 0.7)" : "rgba(16, 185, 129, 0.5)";
  
  const baseShadowAlpha = isFocused ? 0.05 : 0.02;
  const peakShadowAlpha = isFocused ? 0.25 : 0.12;

  return (
    <motion.div
      animate={{ 
        borderColor: [baseBorderColor, peakBorderColor, baseBorderColor],
        boxShadow: [
          `0 0 40px rgba(16, 185, 129, ${baseShadowAlpha})`, 
          `0 0 60px rgba(16, 185, 129, ${peakShadowAlpha})`, 
          `0 0 40px rgba(16, 185, 129, ${baseShadowAlpha})`
        ]
      }}
      transition={{ 
        duration: 5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
