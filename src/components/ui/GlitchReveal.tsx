"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlitchRevealProps {
  text: string;
  isVisible: boolean;
  className?: string;
  duration?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*[]{}/<>_-+";

export const GlitchReveal = ({ 
  text, 
  isVisible, 
  className = "",
  duration = 2000 
}: GlitchRevealProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  useEffect(() => {
    if (!isVisible) {
      setDisplayText("");
      setIsDone(false);
      return;
    }

    let iterations = 0;
    const totalSteps = text.length;
    const intervalTime = duration / (totalSteps * 4); 

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iterations) {
              return text[index];
            }
            if (char === " " || char === "/") return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (Math.random() > 0.85) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 100);
      }

      if (iterations >= text.length) {
        clearInterval(interval);
        setIsDone(true);
      }

      iterations += 0.25; 
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isVisible, text, duration]);

  return (
    <div className="relative inline-block">
      <motion.div
        animate={!isDone ? {
          x: [0, -2, 2, -1, 0],
          y: [0, 1, -1, 0],
          opacity: [1, 0.8, 1, 0.9, 1]
        } : {}}
        transition={{ 
          duration: 0.2, 
          repeat: isDone ? 0 : Infinity,
          repeatType: "mirror" 
        }}
        className={`
          ${className} 
          ${isVisible ? "glitch-text" : ""} 
          transition-colors duration-500
          ${isDone ? "text-white" : "text-emerald-500/80"}
        `}
        data-text={displayText}
      >
        {displayText || (isVisible ? text : "")}
      </motion.div>

      {/* Persistence Flickering for the "failure" look */}
      {!isDone && isVisible && (
        <motion.div 
          className="absolute inset-0 bg-emerald-500/10 blur-xl pointer-events-none"
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.1, repeat: Infinity }}
        />
      )}
    </div>
  );
};
