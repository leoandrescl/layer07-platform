"use client";

import { useEffect, useRef } from "react";

const CHARS = " .:=+*#%@";
const SRC = "/seven/wired-face.png";

function bakeAscii(
  source: CanvasImageSource,
  cols: number,
  rows: number,
) {
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

  bctx.fillStyle = "#000000";
  bctx.fillRect(0, 0, baked.width, baked.height);
  bctx.font = `700 ${cellH}px "Geist Mono", ui-monospace, monospace`;
  bctx.textBaseline = "top";
  bctx.textAlign = "left";

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const i = (y * cols + x) * 4;
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      const lum = (0.22 * r + 0.55 * g + 0.23 * b) / 255;
      if (lum < 0.11) continue;
      const idx = Math.min(CHARS.length - 1, Math.floor(lum * CHARS.length));
      const cyan = Math.min(255, 90 + lum * 180);
      const green = Math.min(255, 40 + lum * 220);
      bctx.fillStyle = `rgb(${Math.floor(lum * 70)}, ${Math.floor(green)}, ${Math.floor(cyan)})`;
      bctx.fillText(CHARS[idx] ?? "@", x * cellW, y * cellH);
    }
  }

  return baked;
}

export function AsciiFace({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let baked: HTMLCanvasElement | null = null;
    let raf = 0;
    let wait = 0;
    let running = true;
    let glitchUntil = 0;
    const img = new Image();
    img.src = SRC;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      return { w, h, dpr };
    };

    const rebuild = () => {
      if (!img.complete || img.naturalWidth === 0) return;
      const { w } = layout();
      const cols = Math.max(42, Math.min(86, Math.floor(w / 6.2)));
      const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
      baked = bakeAscii(img, cols, rows);
    };

    const paint = (now: number, glitch: boolean) => {
      if (!running) return;
      const { w, h, dpr } = layout();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      if (baked) {
        const faceSx = 1.13;
        const scale = Math.min(w / (baked.width * faceSx), h / baked.height);
        const dw = baked.width * scale * faceSx;
        const dh = baked.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;

        if (glitch) {
          const strips = 9;
          const stripH = baked.height / strips;
          for (let i = 0; i < strips; i += 1) {
            const sy = i * stripH;
            const ox = (Math.random() - 0.5) * 18;
            ctx.drawImage(
              baked,
              0,
              sy,
              baked.width,
              stripH,
              dx + ox,
              dy + sy * scale,
              dw,
              stripH * scale,
            );
          }
        } else {
          ctx.drawImage(baked, dx, dy, dw, dh);
        }
      }
    };

    const burst = (now: number) => {
      if (!running) return;
      paint(now, true);
      if (now < glitchUntil) {
        raf = requestAnimationFrame(burst);
        return;
      }
      paint(now, false);
      wait = window.setTimeout(() => {
        glitchUntil = performance.now() + 80 + Math.random() * 70;
        raf = requestAnimationFrame(burst);
      }, 1800 + Math.random() * 2600);
    };

    const onLoad = () => {
      rebuild();
      paint(performance.now(), false);
      if (!reducedMotion) {
        wait = window.setTimeout(() => {
          glitchUntil = performance.now() + 90;
          raf = requestAnimationFrame(burst);
        }, 1400);
      }
    };

    img.addEventListener("load", onLoad);
    if (img.complete) onLoad();

    const onResize = () => {
      rebuild();
      paint(performance.now(), false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(wait);
      img.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion]);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="h-full w-full [filter:drop-shadow(2px_0_0_rgba(255,0,85,0.22))_drop-shadow(-1px_0_10px_rgba(0,240,255,0.28))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
}
