"use client";

import { useEffect, useRef } from "react";
import { isFaceLocked, subscribeDeck } from "./deck";

const CHARS = " .:=+*#%@";

const FRAMES = [
  { src: "/neo/wired-face.png", sx: 1.13, minLum: 0.11 },
  { src: "/neo/wired-build.png", sx: 1, minLum: 0.08 },
  { src: "/neo/wired-track.png", sx: 1.08, minLum: 0.09 },
] as const;

const LOCK_FRAME = 2;

const SWAP_MS = 7000;
const SWAP_GLITCH_MS = 420;

type Baked = HTMLCanvasElement;

function bakeAscii(
  source: CanvasImageSource,
  cols: number,
  rows: number,
  minLum: number,
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
      if (lum < minLum) continue;
      const idx = Math.min(CHARS.length - 1, Math.floor(lum * CHARS.length));
      const cyan = Math.min(255, 90 + lum * 180);
      const green = Math.min(255, 40 + lum * 220);
      bctx.fillStyle = `rgb(${Math.floor(lum * 70)}, ${Math.floor(green)}, ${Math.floor(cyan)})`;
      bctx.fillText(CHARS[idx] ?? "@", x * cellW, y * cellH);
    }
  }

  return baked;
}

function fitRect(
  baked: Baked,
  w: number,
  h: number,
  sx: number,
) {
  const scale = Math.min(w / (baked.width * sx), h / baked.height);
  const dw = baked.width * scale * sx;
  const dh = baked.height * scale;
  return { dx: (w - dw) / 2, dy: (h - dh) / 2, dw, dh, scale };
}

export function AsciiFace({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baked: Array<Baked | null> = FRAMES.map(() => null);
    const images = FRAMES.map((frame) => {
      const img = new Image();
      img.src = frame.src;
      return img;
    });

    let current = 0;
    let next = 1;
    let rotateIdx = 0;
    let raf = 0;
    let idleWait = 0;
    let swapWait = 0;
    let running = true;
    let glitchUntil = 0;
    let swapUntil = 0;
    let swapStart = 0;
    let lockWanted = isFaceLocked();

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

    const rebuildOne = (index: number) => {
      const img = images[index];
      const frame = FRAMES[index];
      if (!img || !frame || !img.complete || img.naturalWidth === 0) return;
      const { w } = layout();
      const cols = Math.max(42, Math.min(96, Math.floor(w / 6.2)));
      const rows = Math.round((cols * img.naturalHeight) / img.naturalWidth);
      baked[index] = bakeAscii(img, cols, rows, frame.minLum);
    };

    const rebuild = () => {
      FRAMES.forEach((_, index) => rebuildOne(index));
    };

    const rotateTarget = () => (rotateIdx === 0 ? 1 : 0);

    const drawFitted = (frame: Baked, sx: number, w: number, h: number) => {
      const r = fitRect(frame, w, h, sx);
      ctx.drawImage(frame, r.dx, r.dy, r.dw, r.dh);
    };

    const drawStrips = (
      frame: Baked,
      sx: number,
      w: number,
      h: number,
      strips: number,
      jitterX: number,
      jitterY: number,
    ) => {
      const r = fitRect(frame, w, h, sx);
      const stripH = frame.height / strips;
      for (let i = 0; i < strips; i += 1) {
        const sy = i * stripH;
        const ox = (Math.random() - 0.5) * jitterX;
        const oy = (Math.random() - 0.5) * jitterY;
        ctx.drawImage(
          frame,
          0,
          sy,
          frame.width,
          stripH,
          r.dx + ox,
          r.dy + sy * r.scale + oy,
          r.dw,
          stripH * r.scale,
        );
      }
    };

    const paintIdle = (glitch: boolean) => {
      if (!running) return;
      const { w, h, dpr } = layout();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      const frame = baked[current];
      const sx = FRAMES[current]?.sx ?? 1;
      if (!frame) return;

      if (glitch) {
        drawStrips(frame, sx, w, h, 9, 18, 0);
      } else {
        drawFitted(frame, sx, w, h);
      }
    };

    const paintSwap = (now: number) => {
      if (!running) return;
      const { w, h, dpr } = layout();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      const from = baked[current];
      const to = baked[next];
      const fromSx = FRAMES[current]?.sx ?? 1;
      const toSx = FRAMES[next]?.sx ?? 1;
      const t = Math.min(1, Math.max(0, (now - swapStart) / SWAP_GLITCH_MS));
      const strips = 22;
      const jitterX = 36 + t * 64;
      const jitterY = 4 + t * 14;

      if (from && (!to || Math.random() > t * 0.72)) {
        drawStrips(from, fromSx, w, h, strips, jitterX, jitterY);
      }
      if (to) {
        ctx.save();
        ctx.globalAlpha = 0.35 + t * 0.65;
        drawStrips(to, toSx, w, h, strips, jitterX * 1.15, jitterY);
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.28 + t * 0.22;
      const chroma = from && Math.random() < 0.55 ? from : to;
      const chromaSx = chroma === to ? toSx : fromSx;
      if (chroma) {
        const r = fitRect(chroma, w, h, chromaSx);
        ctx.drawImage(chroma, r.dx + 10 + t * 8, r.dy, r.dw, r.dh);
        ctx.drawImage(chroma, r.dx - 8 - t * 6, r.dy, r.dw, r.dh);
      }
      ctx.restore();

      for (let i = 0; i < 3 + Math.floor(t * 4); i += 1) {
        ctx.fillStyle = Math.random() < 0.4 ? "#00ff66" : "#000000";
        ctx.globalAlpha = Math.random() < 0.4 ? 0.18 : 0.85;
        ctx.fillRect(0, Math.random() * h, w, 2 + Math.random() * 16);
      }
      ctx.globalAlpha = 1;

      if (Math.random() < 0.45) {
        ctx.fillStyle = "rgba(0,240,255,0.07)";
        ctx.fillRect(0, 0, w, h);
      }
    };

    const idleBurst = (now: number) => {
      if (!running) return;
      if (swapUntil > 0) return;
      paintIdle(true);
      if (now < glitchUntil) {
        raf = requestAnimationFrame(idleBurst);
        return;
      }
      paintIdle(false);
      idleWait = window.setTimeout(() => {
        glitchUntil = performance.now() + 80 + Math.random() * 70;
        raf = requestAnimationFrame(idleBurst);
      }, 1800 + Math.random() * 2600);
    };

    const swapBurst = (now: number) => {
      if (!running) return;
      paintSwap(now);
      if (now < swapUntil) {
        raf = requestAnimationFrame(swapBurst);
        return;
      }
      current = next;
      swapUntil = 0;
      if (current !== LOCK_FRAME) rotateIdx = current;
      paintIdle(false);
      if (lockWanted && current !== LOCK_FRAME) {
        beginSwapTo(LOCK_FRAME);
        return;
      }
      if (!lockWanted && current === LOCK_FRAME) {
        beginSwapTo(rotateIdx === LOCK_FRAME ? 0 : rotateIdx);
        return;
      }
      scheduleIdle();
      if (current !== LOCK_FRAME) scheduleSwap();
    };

    const scheduleIdle = () => {
      if (reducedMotion) return;
      window.clearTimeout(idleWait);
      idleWait = window.setTimeout(() => {
        if (swapUntil > 0) return;
        glitchUntil = performance.now() + 90;
        raf = requestAnimationFrame(idleBurst);
      }, 1400 + Math.random() * 800);
    };

    const beginSwapTo = (target: number) => {
      if (!running) return;
      if (target === current && swapUntil === 0) return;
      const dest = baked[target];
      if (!dest) {
        if (!lockWanted) scheduleSwap();
        return;
      }
      window.clearTimeout(idleWait);
      cancelAnimationFrame(raf);
      next = target;
      swapStart = performance.now();
      if (reducedMotion) {
        current = target;
        if (current !== LOCK_FRAME) rotateIdx = current;
        swapUntil = 0;
        paintIdle(false);
        scheduleIdle();
        if (current !== LOCK_FRAME && !lockWanted) scheduleSwap();
        return;
      }
      swapUntil = swapStart + SWAP_GLITCH_MS + 80;
      raf = requestAnimationFrame(swapBurst);
    };

    const beginSwap = () => {
      if (!running || lockWanted || current === LOCK_FRAME) return;
      if (!baked[0] || !baked[1]) {
        scheduleSwap();
        return;
      }
      beginSwapTo(rotateTarget());
    };

    const scheduleSwap = () => {
      window.clearTimeout(swapWait);
      if (lockWanted || current === LOCK_FRAME) return;
      swapWait = window.setTimeout(beginSwap, SWAP_MS + Math.random() * 1800);
    };

    const syncLock = () => {
      const want = isFaceLocked();
      lockWanted = want;
      if (want && current !== LOCK_FRAME) beginSwapTo(LOCK_FRAME);
      else if (!want && current === LOCK_FRAME) beginSwapTo(rotateIdx);
    };

    const tryStart = () => {
      rebuild();
      if (!baked[current]) return;
      paintIdle(false);
      scheduleIdle();
      if (lockWanted && baked[LOCK_FRAME]) beginSwapTo(LOCK_FRAME);
      else if (baked[0] && baked[1]) scheduleSwap();
    };

    const onResize = () => {
      rebuild();
      paintIdle(false);
    };

    const unsubDeck = subscribeDeck(() => {
      if (running) syncLock();
    });

    images.forEach((img) => {
      img.addEventListener("load", tryStart);
      if (img.complete) tryStart();
    });
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      unsubDeck();
      cancelAnimationFrame(raf);
      window.clearTimeout(idleWait);
      window.clearTimeout(swapWait);
      images.forEach((img) => img.removeEventListener("load", tryStart));
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
