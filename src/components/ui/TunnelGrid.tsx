"use client";
import { useRef, useEffect } from "react";
import { useMotionValueEvent, MotionValue } from "framer-motion";

interface TunnelGridProps {
  progress: MotionValue<number>;
  color?: string;
}

interface Particle {
  z: number;
  angle: number;
  speed: number;
}

export const TunnelGrid = ({ progress, color = "rgba(16, 185, 129, 0.25)" }: TunnelGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    particles.current = Array.from({ length: 40 }, () => ({
      z: Math.random() * 2000,
      angle: (Math.random() * Math.PI * 2),
      speed: 2 + Math.random() * 4
    }));
  }, []);

  const draw = (latest: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;
    const time = Date.now() * 0.001;
    
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / (2 * dpr);
    const centerY = height / (2 * dpr);
    const depth = 2000;
    const step = 200;
    
    ctx.save();
    ctx.lineWidth = 1.0;
    ctx.shadowBlur = 6;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;

    // 1. Perspective Lines (Higher density: 18 lines)
    const lineCount = 18;
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2 + (latest * 0.2); // Subtle rotation with scroll
        const x = Math.cos(angle) * width * 1.5;
        const y = Math.sin(angle) * height * 1.5;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + x, centerY + y);
        ctx.globalAlpha = 0.4 + Math.sin(time + i) * 0.1; // Pulsing lines
        ctx.stroke();
    }

    // 2. Depth Rings
    const offset = (latest * 1500) % step;
    for (let z = offset; z < depth; z += step) {
        const scale = 1 - (z / depth);
        if (scale <= 0) continue;
        
        const w = width * 1.2 * scale;
        const h = height * 1.2 * scale;
        
        ctx.globalAlpha = (1 - z/depth) * 0.5;
        ctx.strokeRect(centerX - w / 2, centerY - h / 2, w, h);
    }

    // 3. Data Particles (Travel to center)
    ctx.fillStyle = color;
    particles.current.forEach((p, i) => {
        p.z -= p.speed + (latest * 10); // Speed increases with scroll
        if (p.z < 0) p.z = depth;

        const scale = 1 - (p.z / depth);
        if (scale <= 0) return;

        const x = centerX + Math.cos(p.angle) * (width * 0.8) * (1 - scale);
        const y = centerY + Math.sin(p.angle) * (height * 0.8) * (1 - scale);
        
        const pSize = 1.5 * scale;
        ctx.globalAlpha = scale * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle trail
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(p.angle) * 20 * scale, y - Math.sin(p.angle) * 20 * scale);
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();
    });

    ctx.restore();
  };

  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      draw(progress.get());
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-65 mix-blend-screen"
    />
  );
};
