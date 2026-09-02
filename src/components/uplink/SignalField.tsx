"use client";

import { useEffect, useRef } from "react";

export function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0.62, y: 0.48 };
    let raf = 0;
    let t = 0;
    let running = true;

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      mouse.y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      t += reduced ? 0 : 0.008;

      const cx = w * 0.52;
      const cy = h * 0.5;
      const mx = mouse.x * w;
      const my = mouse.y * h;

      const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 190);
      glow.addColorStop(0, "rgba(0, 255, 102, 0.16)");
      glow.addColorStop(1, "rgba(0, 255, 102, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(0, 255, 102, 0.38)";
      ctx.lineWidth = 1;
      for (let r = 40; r < Math.min(w, h) * 0.48; r += 36) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(0, 255, 102, 0.22)";
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy);
      ctx.lineTo(cx + 180, cy);
      ctx.moveTo(cx, cy - 180);
      ctx.lineTo(cx, cy + 180);
      ctx.stroke();

      const sweep = t % (Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * 170, cy + Math.sin(sweep) * 170);
      ctx.stroke();

      ctx.fillStyle = "rgba(0, 240, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 90; i += 1) {
        const a = (i / 90) * Math.PI * 2 + t * 0.4;
        const rad = 50 + (i % 7) * 18;
        let x = cx + Math.cos(a) * rad;
        let y = cy + Math.sin(a) * rad;
        const dx = mx - x;
        const dy = my - y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.exp(-dist / 90) * 22;
        x += (dx / dist) * pull;
        y += (dy / dist) * pull;
        ctx.fillStyle =
          i % 9 === 0 ? "rgba(0, 240, 255, 0.9)" : "rgba(0, 255, 102, 0.75)";
        ctx.fillRect(x, y, 2, 2);
      }

      ctx.fillStyle = "rgba(0, 255, 102, 0.55)";
      ctx.font = "10px ui-monospace, monospace";
      ctx.fillText("LAT -33.45", 16, h - 36);
      ctx.fillText("LON -70.66", 16, h - 20);
      ctx.fillText("NODE SCL", w - 88, 28);

      raf = requestAnimationFrame(draw);
    };

    resize();
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden
    />
  );
}
