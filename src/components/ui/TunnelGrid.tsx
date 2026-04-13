"use client";

import { useRef, useEffect } from "react";
import { useMotionValueEvent, MotionValue } from "framer-motion";

interface TunnelGridProps {
  progress: MotionValue<number>;
  color?: string;
}

export const TunnelGrid = ({ progress, color = "rgba(52, 211, 153, 0.15)" }: TunnelGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = (latest: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / (2 * dpr);
    const centerY = height / (2 * dpr);
    const depth = 2000;
    const step = 200;
    
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;

    // Drawing the perspective lines (infinite corridor)
    // Horizontal and Vertical lines that converge at center
    const lineCount = 12;
    for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const x = Math.cos(angle) * width;
        const y = Math.sin(angle) * height;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + x, centerY + y);
        ctx.stroke();
    }

    // Depth rings (Moving squares)
    const offset = (latest * 1000) % step;
    for (let z = offset; z < depth; z += step) {
        const scale = 1 - (z / depth);
        if (scale <= 0) continue;
        
        const w = width * scale;
        const h = height * scale;
        
        ctx.strokeRect(centerX - w / 2, centerY - h / 2, w, h);
    }

    ctx.restore();
  };

  useMotionValueEvent(progress, "change", (latest) => {
    draw(latest);
  });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.scale(dpr, dpr);
        draw(progress.get());
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-40 mix-blend-screen"
    />
  );
};
