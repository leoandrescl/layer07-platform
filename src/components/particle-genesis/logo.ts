import { CONFIG } from "./config";
import type { V3 } from "./math";

interface Bar {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  weight: number;
}

/**
 * "L07" defined as a set of axis-aligned bars inside a normalized unit box
 * (x: 0..1, y: 0..1, centered later). Each bar has a sampling weight so the
 * density of points follows the stroke area.
 */
const LOGO_BARS: Bar[] = [
  // L
  { x0: 0.02, y0: 0.08, x1: 0.16, y1: 0.92, weight: 1.4 }, // vertical
  { x0: 0.02, y0: 0.08, x1: 0.34, y1: 0.2, weight: 1.0 }, // horizontal foot
  // 0
  { x0: 0.42, y0: 0.08, x1: 0.56, y1: 0.92, weight: 1.0 }, // left wall
  { x0: 0.72, y0: 0.08, x1: 0.86, y1: 0.92, weight: 1.0 }, // right wall
  { x0: 0.42, y0: 0.08, x1: 0.86, y1: 0.2, weight: 1.0 }, // top
  { x0: 0.42, y0: 0.8, x1: 0.86, y1: 0.92, weight: 1.0 }, // bottom
  // 7
  { x0: 0.94, y0: 0.08, x1: 1.0, y1: 0.92, weight: 1.0 }, // right vertical
  { x0: 0.86, y0: 0.08, x1: 1.0, y1: 0.2, weight: 1.0 }, // top
  { x0: 0.86, y0: 0.38, x1: 1.0, y1: 0.5, weight: 1.0 }, // middle slash
];

const AREAS = LOGO_BARS.map((b) => (b.x1 - b.x0) * (b.y1 - b.y0) * b.weight);
const TOTAL_AREA = AREAS.reduce((a, b) => a + b, 0);

function sampleBar(): Bar {
  let r = Math.random() * TOTAL_AREA;
  for (let i = 0; i < LOGO_BARS.length; i += 1) {
    r -= AREAS[i];
    if (r <= 0) return LOGO_BARS[i];
  }
  return LOGO_BARS[LOGO_BARS.length - 1];
}

/**
 * Samples `count` points along the L07 mark plus a soft halo around it.
 * Points are returned in world units, centered at the origin.
 */
export function generateLogoTargets(count: number): V3[] {
  const cfg = CONFIG.logo;
  const haloCount = Math.floor(count * cfg.haloRatio);
  const bodyCount = count - haloCount;

  const targets: V3[] = new Array(count);
  const camZ = CONFIG.camera.z;

  for (let i = 0; i < bodyCount; i += 1) {
    const bar = sampleBar();
    const u = bar.x0 + Math.random() * (bar.x1 - bar.x0);
    const v = bar.y0 + Math.random() * (bar.y1 - bar.y0);
    // remap unit box (x:0..1, y:0..1) to centered world coords, XZ space.
    const x = (u - 0.5) * cfg.scale;
    const z = (0.5 - v) * cfg.scale * 0.62;
    targets[i] = {
      x,
      y: 0,
      z: -camZ * 0.3 + z,
    };
  }

  for (let i = bodyCount; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = cfg.scale * (0.5 + Math.random() * 0.75);
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.62;
    targets[i] = {
      x,
      y: (Math.random() - 0.5) * cfg.scale * 0.18,
      z: -camZ * 0.3 + z,
    };
  }

  return targets;
}