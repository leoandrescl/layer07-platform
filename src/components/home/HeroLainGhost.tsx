"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Pointer } from "@/components/seven/RainGL";

const CHARS = " .:=+*#%@";
const SRC = "/seven/wired-face.png";
const MIN_LUM = 0.1;
const SX = 1.08;

function bakeAscii(source: CanvasImageSource, cols: number, rows: number) {
  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  if (!sctx) return null;

  sctx.drawImage(source, 0, 0, cols, rows);
  const pixels = sctx.getImageData(0, 0, cols, rows).data;

  const cellW = 8;
  const cellH = 9;
  const baked = document.createElement("canvas");
  baked.width = cols * cellW;
  baked.height = rows * cellH;
  const bctx = baked.getContext("2d");
  if (!bctx) return null;

  bctx.clearRect(0, 0, baked.width, baked.height);
  bctx.font = `700 ${cellH}px "Courier Prime", "Courier New", ui-monospace, monospace`;
  bctx.textBaseline = "top";
  bctx.textAlign = "left";

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = (y * cols + x) * 4;
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      const lum = (0.22 * r + 0.55 * g + 0.23 * b) / 255;
      if (lum < MIN_LUM) continue;
      const idx = Math.min(CHARS.length - 1, Math.floor(lum * CHARS.length));
      const cyan = Math.min(255, 90 + lum * 180);
      const green = Math.min(255, 40 + lum * 220);
      bctx.fillStyle = `rgb(${Math.floor(lum * 70)}, ${Math.floor(green)}, ${Math.floor(cyan)})`;
      bctx.fillText(CHARS[idx] ?? "@", x * cellW, y * cellH);
    }
  }

  return baked;
}

type Props = {
  mouseRef?: RefObject<Pointer>;
  presence?: number;
  reducedMotion?: boolean;
};

export function HeroLainGhost({
  mouseRef,
  presence = 1,
  reducedMotion = false,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = SRC;

    let baked: HTMLCanvasElement | null = null;
    let bakedFor = 0;
    let raf = 0;
    let running = true;
    let glitchUntil = 0;
    let nextGlitch = 0;
    const look = { x: 0.68, y: 0.48 };

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      if (spot.width !== pw || spot.height !== ph) {
        spot.width = pw;
        spot.height = ph;
      }
      return { w, h, dpr };
    };

    const rebuild = () => {
      if (!img.complete || img.naturalWidth === 0) return;
      const { w } = layout();
      const cols = Math.max(56, Math.min(118, Math.floor(w / 6)));
      if (cols === bakedFor && baked) return;
      const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
      baked = bakeAscii(img, cols, rows);
      bakedFor = cols;
    };

    const fit = (w: number, h: number) => {
      if (!baked) return null;
      const scale = Math.min((w * 0.64) / (baked.width * SX), (h * 0.94) / baked.height);
      const dw = baked.width * scale * SX;
      const dh = baked.height * scale;
      return {
        dx: w - dw + w * 0.08,
        dy: (h - dh) * 0.36,
        dw,
        dh,
        scale,
      };
    };

    const spot = document.createElement("canvas");
    const sctx = spot.getContext("2d");
    if (!sctx) return;

    const drawFace = (
      target: CanvasRenderingContext2D,
      w: number,
      h: number,
      ox: number,
      oy: number,
      strips: number,
      jitter: number,
    ) => {
      if (!baked) return;
      const r = fit(w, h);
      if (!r) return;
      if (strips <= 1 || jitter <= 0) {
        target.drawImage(baked, r.dx + ox, r.dy + oy, r.dw, r.dh);
        return;
      }
      const stripH = baked.height / strips;
      for (let i = 0; i < strips; i += 1) {
        const sy = i * stripH;
        const jx = (Math.random() - 0.5) * jitter;
        target.drawImage(
          baked,
          0,
          sy,
          baked.width,
          stripH,
          r.dx + ox + jx,
          r.dy + oy + sy * r.scale,
          r.dw,
          stripH * r.scale,
        );
      }
    };

    const fadeMask = (w: number, h: number) => {
      ctx.globalCompositeOperation = "destination-in";
      const fade = ctx.createLinearGradient(0, 0, w, 0);
      fade.addColorStop(0, "rgba(0,0,0,0)");
      fade.addColorStop(0.38, "rgba(0,0,0,0)");
      fade.addColorStop(0.55, "rgba(0,0,0,0.4)");
      fade.addColorStop(0.78, "rgba(0,0,0,0.9)");
      fade.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);

      const vert = ctx.createLinearGradient(0, 0, 0, h);
      vert.addColorStop(0, "rgba(0,0,0,0.15)");
      vert.addColorStop(0.18, "rgba(0,0,0,1)");
      vert.addColorStop(0.82, "rgba(0,0,0,1)");
      vert.addColorStop(1, "rgba(0,0,0,0.2)");
      ctx.fillStyle = vert;
      ctx.fillRect(0, 0, w, h);
    };

    const tick = (now: number) => {
      if (!running) return;
      const { w, h, dpr } = layout();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!baked) {
        rebuild();
        raf = requestAnimationFrame(tick);
        return;
      }

      const target = mouseRef?.current ?? { x: 0.68, y: 0.48 };
      look.x += (target.x - look.x) * 0.16;
      look.y += (target.y - look.y) * 0.16;

      const px = (look.x - 0.5) * -22;
      const py = (look.y - 0.5) * -14;
      const glitch = !reducedMotion && now < glitchUntil;
      const strips = glitch ? 14 : 1;
      const jitter = glitch ? 18 : 0;
      const focus = Math.exp(
        -((look.x - 0.72) ** 2 * 4.5 + (look.y - 0.48) ** 2 * 3.2),
      );

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.2 + focus * 0.1;
      drawFace(ctx, w, h, px * 0.3, py * 0.3, 1, 0);
      ctx.restore();

      const cx = look.x * w;
      const cy = look.y * h;
      const radius = Math.min(w, h) * 0.1;

      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, w, h);
      sctx.globalCompositeOperation = "source-over";
      sctx.globalAlpha = 0.62 + focus * 0.22;
      drawFace(sctx, w, h, px, py, strips, jitter);
      sctx.globalAlpha = 0.18;
      drawFace(sctx, w, h, px + 4, py, strips, jitter * 0.4);

      const lamp = sctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      lamp.addColorStop(0, "rgba(0,0,0,1)");
      lamp.addColorStop(0.18, "rgba(0,0,0,0.82)");
      lamp.addColorStop(0.42, "rgba(0,0,0,0.42)");
      lamp.addColorStop(0.68, "rgba(0,0,0,0.14)");
      lamp.addColorStop(0.88, "rgba(0,0,0,0.04)");
      lamp.addColorStop(1, "rgba(0,0,0,0)");
      sctx.globalCompositeOperation = "destination-in";
      sctx.globalAlpha = 1;
      sctx.fillStyle = lamp;
      sctx.fillRect(0, 0, w, h);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 1;
      ctx.drawImage(spot, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fadeMask(w, h);

      if (!reducedMotion) {
        if (nextGlitch === 0) {
          nextGlitch = now + 2200;
        } else if (now > nextGlitch) {
          glitchUntil = now + 80 + Math.random() * 60;
          nextGlitch = now + 2800 + Math.random() * 3600;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    img.addEventListener("load", rebuild);
    if (img.complete) rebuild();
    const ro = new ResizeObserver(() => {
      bakedFor = 0;
      rebuild();
    });
    ro.observe(canvas);
    raf = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      img.removeEventListener("load", rebuild);
      ro.disconnect();
    };
  }, [mouseRef, reducedMotion]);

  if (presence <= 0.01) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full mix-blend-screen"
      style={{
        opacity: presence,
        filter: "blur(0.35px) drop-shadow(0 0 28px rgba(0, 240, 255, 0.14))",
      }}
      aria-hidden
    />
  );
}
