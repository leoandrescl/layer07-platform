"use client";

import { useEffect, useRef, useState } from "react";
import { createParticlesScene } from "./scene";

export default function ParticlesGalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let scene: ReturnType<typeof createParticlesScene> | null = null;
    try {
      scene = createParticlesScene(canvas, { onReady: () => setReady(true) });
    } catch (error) {
      console.error("[particles-galaxy] no se pudo iniciar WebGL", error);
    }

    return () => scene?.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`fixed inset-0 z-0 h-full w-full transition-opacity duration-[1600ms] ease-out ${
        ready ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
