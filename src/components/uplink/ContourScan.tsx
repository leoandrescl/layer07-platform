"use client";

import { useEffect, useRef } from "react";

const GREEN = "0, 255, 65";
const CELL = 7;
const LEVEL = 0.2;

/**
 * Dotted isolines of a drifting implicit field, swept by a scanline.
 * Pointer adds a Gaussian blob that warps the contours.
 */
export function ContourScan() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    el.appendChild(canvas);
    canvas.style.display = "block";

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let rafId = 0;
    let visible = true;
    let px = -1;
    let py = -1;
    let tx = -1;
    let ty = -1;

    function resize() {
      const r = el.getBoundingClientRect();
      w = Math.max(1, Math.floor(r.width));
      h = Math.max(1, Math.floor(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    function field(x: number, y: number, t: number) {
      const b1x = w * (0.5 + 0.32 * Math.sin(t * 0.31));
      const b1y = h * (0.5 + 0.3 * Math.cos(t * 0.23));
      const b2x = w * (0.5 + 0.36 * Math.cos(t * 0.19 + 2.1));
      const b2y = h * (0.5 + 0.28 * Math.sin(t * 0.27 + 1.3));
      const b3x = w * (0.5 + 0.25 * Math.sin(t * 0.17 + 4.2));
      const b3y = h * (0.5 + 0.34 * Math.cos(t * 0.29 + 3.1));
      const s = Math.min(w, h);
      let f = 0;
      f += 1.0 * Math.exp(-((x - b1x) ** 2 + (y - b1y) ** 2) / (2 * (s * 0.22) ** 2));
      f += 0.85 * Math.exp(-((x - b2x) ** 2 + (y - b2y) ** 2) / (2 * (s * 0.18) ** 2));
      f += 0.7 * Math.exp(-((x - b3x) ** 2 + (y - b3y) ** 2) / (2 * (s * 0.26) ** 2));
      if (px >= 0) {
        f += 0.9 * Math.exp(-((x - px) ** 2 + (y - py) ** 2) / (2 * (s * 0.15) ** 2));
      }
      return f;
    }

    function render(t: number) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (tx >= 0) {
        if (px < 0) {
          px = tx;
          py = ty;
        } else {
          px += (tx - px) * 0.08;
          py += (ty - py) * 0.08;
        }
      }

      const scanX = ((t * 0.045) % 1.3) * w;
      const dot = Math.max(1, 2.2 * dpr);

      for (let gy = 0; gy * CELL < h; gy++) {
        for (let gx = 0; gx * CELL < w; gx++) {
          const x = gx * CELL;
          const y = gy * CELL;
          const f = field(x, y, t) / LEVEL;
          const frac = f - Math.floor(f);
          const d = Math.min(frac, 1 - frac);
          if (d > 0.12) continue;

          let a = (1 - d / 0.12) * 0.8;
          const sd = Math.abs(x - scanX);
          if (sd < 46) a += (1 - sd / 46) * 0.5;
          if (a < 0.05) continue;

          ctx.fillStyle = `rgba(${GREEN}, ${Math.min(1, a).toFixed(3)})`;
          ctx.fillRect(x * dpr, y * dpr, dot, dot);
        }
      }

      const grad = ctx.createLinearGradient((scanX - 46) * dpr, 0, scanX * dpr, 0);
      grad.addColorStop(0, `rgba(${GREEN}, 0)`);
      grad.addColorStop(1, `rgba(${GREEN}, 0.16)`);
      ctx.fillStyle = grad;
      ctx.fillRect((scanX - 46) * dpr, 0, 46 * dpr, h * dpr);
      ctx.fillStyle = `rgba(${GREEN}, 0.35)`;
      ctx.fillRect(scanX * dpr, 0, Math.max(1, dpr), h * dpr);
    }

    resize();
    const startT = performance.now();
    const tick = (now: number) => {
      if (visible && document.visibilityState === "visible") {
        render((now - startT) * 0.001);
      }
      rafId = requestAnimationFrame(tick);
    };

    if (reduced) {
      render(3.2);
    } else {
      rafId = requestAnimationFrame(tick);
    }

    const onMove = (event: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = event.clientX - r.left;
      ty = event.clientY - r.top;
    };
    const onLeave = () => {
      tx = -1;
      ty = -1;
      px = -1;
      py = -1;
    };

    if (!reduced) {
      window.addEventListener("pointermove", onMove);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) render(3.2);
    });
    ro.observe(el);

    const vio = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0 },
    );
    vio.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      vio.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020503]"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, rgba(0, 255, 65, 0.05), transparent 62%), #020503",
      }}
      aria-hidden
    />
  );
}
