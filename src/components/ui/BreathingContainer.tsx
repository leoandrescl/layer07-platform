"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface BreathingContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  isFocused?: boolean;
}

export const BreathingContainer = ({ 
  children, 
  isFocused = false, 
  className = "",
  ...props 
}: BreathingContainerProps) => {
  
  const baseShadowAlpha = isFocused ? 0.08 : 0.04;
  const peakShadowAlpha = isFocused ? 0.22 : 0.12;

  // HUD Corner Bracket Component
  const CornerBracket = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
    const posClasses = {
      tl: "top-0 left-0 border-t-2 border-l-2",
      tr: "top-0 right-0 border-t-2 border-r-2",
      bl: "bottom-0 left-0 border-b-2 border-l-2",
      br: "bottom-0 right-0 border-b-2 border-r-2",
    };

    return (
      <motion.div
        animate={{ 
          opacity: [0.3, 0.8, 0.4, 1, 0.3],
          borderColor: [
            "rgba(16, 185, 129, 0.3)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(16, 185, 129, 0.4)",
            "rgba(255, 255, 255, 0.9)", // Flash effect
            "rgba(16, 185, 129, 0.3)"
          ]
        }}
        transition={{ 
          duration: 4 + Math.random() * 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          times: [0, 0.45, 0.48, 0.5, 1]
        }}
        className={`absolute w-4 h-4 z-20 ${posClasses[position]}`}
      />
    );
  };

  return (
    <motion.div
      animate={{ 
        boxShadow: [
          `0 0 60px rgba(16, 185, 129, ${baseShadowAlpha}), inset 0 0 30px rgba(16, 185, 129, 0.02)`, 
          `0 0 140px rgba(16, 185, 129, ${peakShadowAlpha}), inset 0 0 50px rgba(16, 185, 129, 0.05)`, 
          `0 0 60px rgba(16, 185, 129, ${baseShadowAlpha}), inset 0 0 30px rgba(16, 185, 129, 0.02)`, 
        ]
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        ease: "easeInOut",
      }}
      className="relative group/container"
      {...props}
    >
      {/* Outer Shell for Background & Static Border */}
      <div className="absolute inset-0 border border-emerald-500/5 bg-black/60 z-0 pointer-events-none" />

      {/* Internal Content Wrapper - RE-ENGINEERED TO PROPAGATE LAYOUT CLASSES */}
      <div className={`relative z-10 w-full h-full ${className}`}>
        
        {/* Clipping mask Layer for internal effects only */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <CornerBracket position="tl" />
          <CornerBracket position="tr" />
          <CornerBracket position="bl" />
          <CornerBracket position="br" />

          {/* Dynamic Light Sweep Effect */}
          <motion.div
            initial={{ left: "-100%", opacity: 0 }}
            animate={{ 
              left: ["-100%", "100%"],
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "linear",
              repeatDelay: 4 + Math.random() * 2,
              times: [0, 0.15, 0.85, 1]
            }}
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
            }}
            className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-emerald-400/[0.04] to-transparent skew-x-[30deg] pointer-events-none z-0"
          />
        </div>
        
        {/* Actual children in the correct layout context */}
        {children}
      </div>
    </motion.div>
  );
};
