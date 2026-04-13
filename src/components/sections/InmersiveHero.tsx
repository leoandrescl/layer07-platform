"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, useMotionValue, useInView } from "framer-motion";
import { TunnelGrid } from "@/components/ui/TunnelGrid";
import { CyberNebula } from "@/components/ui/CyberNebula";
import { RecursiveReveal } from "@/components/ui/RecursiveReveal";
import { GlitchReveal } from "@/components/ui/GlitchReveal";
import { NumberTicker } from "@/components/ui/NumberTicker";

const FRAME_COUNT = 90;
const CHARS = "#@%&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Holographic Hero Text with Shimmer
const HoloHeadline = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200/50 to-white bg-[length:200%_auto] animate-shimmer ${className}`}>
    {children}
  </span>
);


export const InmersiveHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const RevealWrapper = ({ text }: { text: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });
    return (
      <div ref={ref}>
        <GlitchReveal text={text} isVisible={isInView} duration={2500} />
      </div>
    );
  };

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

  // ---------------- MOUSE PARALLAX ----------------
  // ---------------- MOUSE PARALLAX ----------------
  const mouseX = useSpring(useMotionValue<number>(0), { damping: 50, stiffness: 400 });
  const mouseY = useSpring(useMotionValue<number>(0), { damping: 50, stiffness: 400 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    mouseX.set(x as never);
    mouseY.set(y as never);
  };

  // ---------------- TEXT TRANSFORMS (Scroll Based) ----------------
  // TEXT 1: 0 -> 0.3
  const t1Opacity = useTransform(smoothProgress, [0, 0.2, 0.3], [1, 1, 0]);
  const t1Y = useTransform(smoothProgress, [0, 0.3], [0, -100]);

  // TEXT 2: 0.3 -> 0.7
  const t2Opacity = useTransform(smoothProgress, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0]);
  const t2Y = useTransform(smoothProgress, [0.3, 0.5, 0.7], [100, 0, -100]);

  // TEXT 3: 0.7 -> 1.0
  const t3Opacity = useTransform(smoothProgress, [0.75, 0.85, 1], [0, 1, 1]);
  const t3Y = useTransform(smoothProgress, [0.7, 0.9, 1], [100, 0, 0]);

  // ---------------- PARALLAX TRANSFORMS (Mouse Based) ----------------
  const nebulaX = useTransform(mouseX, (x) => -x * 1.5);
  const nebulaY = useTransform(mouseY, (y) => -y * 1.5);
  const tunnelX = useTransform(mouseX, (x) => -x * 2.5);
  const tunnelY = useTransform(mouseY, (y) => -y * 2.5);
  const sequenceX = useTransform(mouseX, (x) => -x * 0.8);
  const sequenceY = useTransform(mouseY, (y) => -y * 0.8);

  return (
    <section 
      ref={containerRef} 
      className="h-[400vh] relative cursor-crosshair"
      onMouseMove={handleMouseMove}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Layer 0: Sequence Background (Subtle Parallax) */}
        <motion.canvas 
          ref={canvasRef} 
          style={{ x: sequenceX, y: sequenceY }}
          className="absolute inset-0 z-0 pointer-events-none opacity-35 mix-blend-screen scale-110" 
        />

        {/* Layer 0.5: Cybernetic Nebula (WebGL) */}
        <motion.div style={{ x: nebulaX, y: nebulaY }} className="absolute inset-0 z-0 pointer-events-none scale-110">
          <CyberNebula progress={smoothProgress} />
        </motion.div>

        {/* Layer 1: Vector Tunnel */}
        <motion.div style={{ x: tunnelX, y: tunnelY }} className="absolute inset-0 z-0 pointer-events-none scale-110">
          <TunnelGrid progress={smoothProgress} />
        </motion.div>

        {/* Layer 2: Typography & HUD */}
        <div className="z-10 text-center px-6">
          
          <motion.div style={{ opacity: t1Opacity, y: t1Y }} className="absolute inset-0 flex flex-col items-center justify-center">
            <RecursiveReveal>
              <h1 className="text-[9vw] font-bold tracking-tighter leading-none text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <HoloHeadline>DETERMINISTIC</HoloHeadline><br/>
                <HoloHeadline>PERFORMANCE</HoloHeadline>
              </h1>
            </RecursiveReveal>
            <RecursiveReveal delay={0.1}>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] mt-8 bg-black/40 backdrop-blur-sm px-4 py-1 border border-zinc-800/50">
                CORE WEB VITALS OPTIMIZATION
              </p>
            </RecursiveReveal>
          </motion.div>

          <motion.div style={{ opacity: t2Opacity, y: t2Y }} className="absolute inset-0 flex flex-col items-center justify-center">
            <RecursiveReveal>
              <h2 className="text-[8vw] font-bold tracking-tighter leading-none text-white uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <HoloHeadline>DECOUPLED</HoloHeadline><br/>
                <HoloHeadline>ARCHITECTURE</HoloHeadline>
              </h2>
            </RecursiveReveal>
            <RecursiveReveal delay={0.1}>
              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] mt-8 bg-black/40 backdrop-blur-sm px-4 py-1 border border-zinc-800/50">
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
                  className="text-[7vw] font-bold tracking-tighter leading-none text-white uppercase min-h-[1.2em] flex items-center justify-center"
                >
                  <HoloHeadline>
                    <RevealWrapper text="LAYER07 // STUDIO" />
                  </HoloHeadline>
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
                      LCP &lt; <NumberTicker value="1" decimals={0} />s <span className="text-[10px] ml-1 opacity-60 italic whitespace-nowrap">AS A STANDARD</span>
                    </span>
                 </div>
               </motion.div>
            </div>
          </motion.div>

        </div>

        {/* Layer 2.5: Dynamic Signal Light (Moving Light Effect) */}
        <motion.div
          animate={{ 
            top: ["-20%", "120%"],
            left: ["-20%", "120%"],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-[5]"
        />
        
        <motion.div
          animate={{ 
            bottom: ["-20%", "120%"],
            right: ["-20%", "120%"],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: "linear",
            delay: 2
          }}
          className="absolute w-[30vw] h-[30vw] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-[5]"
        />

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
