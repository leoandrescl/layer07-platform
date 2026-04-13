"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence, useInView } from "framer-motion";
import { TunnelGrid } from "@/components/ui/TunnelGrid";
import { CyberNebula } from "@/components/ui/CyberNebula";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";

const FRAME_COUNT = 90;
const CHARS = "#@%&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DecryptedText = ({ text, isVisible }: { text: string, isVisible: boolean }) => {
  const [displayText, setDisplayText] = useState("");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;
    hasAnimated.current = true;

    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iterations) {
              return text[index];
            }
            if (char === " " || char === "/" ) return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, text]);

  return <span>{displayText || (hasAnimated.current ? text : "")}</span>;
};

const DecryptionTrigger = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  return (
    <div ref={ref}>
      <DecryptedText text={text} isVisible={isInView} />
    </div>
  );
};

export const InmersiveHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Global Spring for liquid smooth scroll
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 80, 
    damping: 25, 
    restDelta: 0.001 
  });

  // ---------------- IMAGE PRELOADER ----------------
  useEffect(() => {
    let loaded = 0;
    const items: HTMLImageElement[] = [];
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/hero/f-${i.toString().padStart(3, '0')}.webp`;
      img.onload = () => {
        loaded++;
        if (loaded === FRAME_COUNT) setIsLoaded(true);
      };
      items.push(img);
    }
    setImages(items);
  }, []);

  // ---------------- CANVAS RENDERER ----------------
  const render = (progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    const img = images[idx];
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // Center crop / object-fit cover logic
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let dw, dh, dx, dy;

    if (canvasRatio > imgRatio) {
      dw = w;
      dh = w / imgRatio;
      dx = 0;
      dy = (h - dh) / 2;
    } else {
      dw = h * imgRatio;
      dh = h;
      dx = (w - dw) / 2;
      dy = 0;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  useMotionValueEvent(smoothProgress, "change", render);

  useEffect(() => {
    const resize = () => {
      if (!canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      render(smoothProgress.get());
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, [isLoaded]);

  // ---------------- TEXT TRANSFORMS ----------------
  // TEXT 1: 0 -> 0.3
  const t1Opacity = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const t1Y = useTransform(smoothProgress, [0, 0.3], [0, -100]);

  // TEXT 2: 0.3 -> 0.7
  const t2Opacity = useTransform(smoothProgress, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0]);
  const t2Y = useTransform(smoothProgress, [0.3, 0.5, 0.7], [100, 0, -100]);

  // TEXT 3: 0.7 -> 1.0
  const t3Opacity = useTransform(smoothProgress, [0.75, 0.85, 1], [0, 1, 1]);
  const t3Y = useTransform(smoothProgress, [0.7, 0.9, 1], [100, 0, 0]);

  return (
    <section ref={containerRef} className="h-[400vh] relative">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Layer 0: Sequence Background */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-0 pointer-events-none opacity-35 mix-blend-screen" 
        />

        {/* Layer 0.5: Cybernetic Nebula (WebGL) */}
        <CyberNebula progress={smoothProgress} />

        {/* Layer 1: Vector Tunnel */}
        <TunnelGrid progress={smoothProgress} />

        {/* Layer 2: Typography & HUD */}
        <div className="z-10 text-center px-6">
          
          <motion.div style={{ opacity: t1Opacity, y: t1Y }} className="absolute inset-0 flex flex-col items-center justify-center">
            <RecursiveReveal>
              <h1 className="text-[12vw] font-bold tracking-tighter leading-none text-white uppercase">
                 DETERMINISTIC PERFORMANCE
              </h1>
            </RecursiveReveal>
            <RecursiveReveal delay={0.1}>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] mt-8">
                CORE WEB VITALS OPTIMIZATION
              </p>
            </RecursiveReveal>
          </motion.div>

          <motion.div style={{ opacity: t2Opacity, y: t2Y }} className="absolute inset-0 flex flex-col items-center justify-center">
            <RecursiveReveal>
              <h2 className="text-[10vw] font-bold tracking-tighter leading-none text-white uppercase">
                DECOUPLED ARCHITECTURE
              </h2>
            </RecursiveReveal>
            <RecursiveReveal delay={0.1}>
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] mt-8">
                COMPOSABLE COMMERCE SOLUTIONS
              </p>
            </RecursiveReveal>
          </motion.div>

          <motion.div style={{ opacity: t3Opacity, y: t3Y }} className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-12">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[8vw] font-bold tracking-tighter leading-none text-white uppercase min-h-[1.2em]"
                >
                  <DecryptionTrigger text="LAYER07 // STUDIO" />
                </motion.h1>

               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: false, amount: 0.5 }}
                 transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
               >
                 <div className="flex items-center gap-4 bg-emerald-400/5 border border-emerald-400/20 px-8 py-4 backdrop-blur-xl">
                    <div className="w-2 h-2 bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase">
                      LCP &lt; 1s <span className="text-[10px] ml-1 opacity-60 italic whitespace-nowrap">AS A STANDARD</span>
                    </span>
                 </div>
               </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Layer 3: Peripheral HUD Elements */}
        <div className="absolute inset-x-8 inset-y-8 pointer-events-none flex justify-between items-end z-20">
           <div className="flex flex-col gap-1 opacity-20">
              <span className="text-[8px] font-mono text-white tracking-widest uppercase">system.status</span>
              <div className="w-32 h-px bg-white/20" />
           </div>
           <div className="flex flex-col items-end gap-1 opacity-20">
              <span className="text-[8px] font-mono text-white tracking-widest uppercase">render.engine.v2</span>
              <div className="w-32 h-px bg-white/20" />
           </div>
        </div>

      </div>
    </section>
  );
};
