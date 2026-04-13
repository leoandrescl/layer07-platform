"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface WiredTerminalProps {
  text: string;
  delay?: number;
  cipher?: boolean;
  className?: string;
  speed?: number;
  unstable?: boolean;
}

const GLITCH_CHARS = "01!@#$%^&*()_+-=[]{}|;':\",./<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ마미무메모ヤユヨラリルレロワヲン";

export const WiredTerminal = ({
  text,
  delay = 0,
  cipher = false,
  className = "",
  speed = 50,
  unstable = false,
}: WiredTerminalProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.05 });

  // Typewriter + Initial Glitch
  useEffect(() => {
    if (!isInView) return;

    let timeout: NodeJS.Timeout;
    let currentIndex = 0;
    
    const startAnimation = () => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          const targetChar = text[currentIndex];
          
          if ((cipher || unstable) && currentIndex < text.length) {
            let cycles = 0;
            const limit = unstable ? 8 : 5;
            const cipherInterval = setInterval(() => {
              const randomChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
              setDisplayText(text.slice(0, currentIndex) + randomChar);
              cycles++;
              if (cycles > limit) {
                clearInterval(cipherInterval);
                setDisplayText(text.slice(0, currentIndex + 1));
              }
            }, unstable ? 20 : 30);
          } else {
            setDisplayText(text.slice(0, currentIndex + 1));
          }
          
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
      
      return () => clearInterval(interval);
    };

    timeout = setTimeout(startAnimation, delay * 1000);
    return () => clearTimeout(timeout);
  }, [text, delay, cipher, speed, isInView, unstable]);

  // Persistent Jitter Glitch (Post-Completion)
  useEffect(() => {
    if (!isComplete || !isInView) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance per tick to glitch a char
        const charIdx = Math.floor(Math.random() * text.length);
        const originalText = text;
        
        // Brief swap to random char
        const randomChar = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        const glitched = originalText.split('');
        glitched[charIdx] = randomChar;
        setDisplayText(glitched.join(''));

        setTimeout(() => {
          setDisplayText(originalText);
        }, 50 + Math.random() * 100);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isComplete, isInView, text]);

  return (
    <div 
      ref={containerRef}
      className={`font-vt323 select-none pointer-events-none relative transition-opacity duration-1000 ${isInView ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      <span className={unstable ? "text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" : ""}>
        {displayText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            className="inline-block w-[0.6em] h-[1em] bg-current ml-1 align-middle"
          />
        )}
        
        {/* Wired Static Noise Layer (Random Flicker) */}
        <motion.div
          animate={{ 
            opacity: [0, 0.1, 0, 0.05, 0],
            x: unstable ? [0, 3, -3, 0] : [0, 1, -1, 0],
            backgroundColor: unstable ? ["rgba(255,255,255,0.05)", "rgba(255,0,255,0.15)", "rgba(255,255,255,0.05)"] : "rgba(255,255,255,0.05)"
          }}
          transition={{ 
            duration: unstable ? 0.1 : 0.2, 
            repeat: Infinity, 
            repeatType: "mirror",
            repeatDelay: Math.random() * (unstable ? 1 : 4)
          }}
          className="absolute inset-x-0 bottom-0 h-full mix-blend-overlay pointer-events-none -z-10"
        />
        
        {/* Unstable Magenta Glitch Shadow */}
        {unstable && (
          <motion.div
            animate={{ 
              opacity: [0, 0.5, 0],
              x: [-10, 10, -10],
              skewX: [-5, 5, -5]
            }}
            transition={{
              duration: 0.08,
              repeat: Infinity,
              repeatDelay: 1 + Math.random() * 2
            }}
            className="absolute inset-0 text-[#ff00ff] blur-[1px] opacity-0 mix-blend-screen"
          >
            {displayText}
          </motion.div>
        )}
      </span>
    </div>
  );
};
