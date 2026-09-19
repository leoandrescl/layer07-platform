import { CONFIG, PALETTE } from "./config";

const { goldenAngle } = CONFIG;
const TAU = Math.PI * 2;

export interface ParticleBuffers {
  /** scattered field the intro converges from */
  start: Float32Array;
  /** fibonacci sphere (written into the geometry "position" attribute) */
  sphere: Float32Array;
  /** Vogel phyllotaxis disc */
  disc: Float32Array;
  /** logarithmic golden coil */
  spiral: Float32Array;
  /** random unit vector used for drift and dispersion */
  dir: Float32Array;
  seed: Float32Array;
  size: Float32Array;
  color: Float32Array;
  bright: Float32Array;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function unitVector(out: Float32Array, i: number) {
  const u = Math.random() * 2 - 1;
  const theta = Math.random() * TAU;
  const r = Math.sqrt(Math.max(0, 1 - u * u));
  out[i] = Math.cos(theta) * r;
  out[i + 1] = u;
  out[i + 2] = Math.sin(theta) * r;
}

function makeColorTable() {
  const table: { r: number; g: number; b: number; cumulative: number }[] = [];
  let cumulative = 0;
  for (const entry of PALETTE) {
    const hex = entry.hex.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    cumulative += entry.weight;
    table.push({ r, g, b, cumulative });
  }
  return table;
}

const COLOR_TABLE = makeColorTable();
const SIZE_TIERS = CONFIG.particles.sizeTiers;
const TIER_WEIGHTS = CONFIG.particles.tierWeights;

function pickColorIndex() {
  const r = Math.random();
  for (let i = 0; i < COLOR_TABLE.length; i += 1) {
    if (r <= COLOR_TABLE[i].cumulative) return i;
  }
  return COLOR_TABLE.length - 1;
}

function pickSize() {
  let r = Math.random();
  for (let t = 0; t < TIER_WEIGHTS.length; t += 1) {
    if (r < TIER_WEIGHTS[t]) {
      // slight per-particle variance so tiers never look stamped
      return Math.max(CONFIG.particles.minSize, SIZE_TIERS[t] * rand(0.72, 1.28));
    }
    r -= TIER_WEIGHTS[t];
  }
  return SIZE_TIERS[SIZE_TIERS.length - 1];
}

/**
 * Builds every per-particle buffer for the scene. Four positions per particle:
 * the scattered intro field plus the three morph targets (sphere / disc /
 * spiral). The vertex shader blends them with a weight vector, so the CPU only
 * touches a handful of uniforms per frame.
 */
export function buildParticles(count: number): ParticleBuffers {
  const { sphere: sphereCfg, disc: discCfg, spiral: spiralCfg } = CONFIG.formations;

  const start = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const disc = new Float32Array(count * 3);
  const spiral = new Float32Array(count * 3);
  const dir = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const bright = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const t = (i + 0.5) / count;

    // --- scattered intro field: a large, sparse star volume ---
    unitVector(dir, i3);
    const radius = 7 + Math.pow(Math.random(), 0.6) * 16;
    start[i3] = dir[i3] * radius * rand(0.7, 1.3);
    start[i3 + 1] = dir[i3 + 1] * radius * rand(0.55, 1.1);
    start[i3 + 2] = dir[i3 + 2] * radius;

    // --- fibonacci sphere: uniform shell, denser toward the camera-neutral band ---
    const y = 1 - 2 * t;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * goldenAngle;
    const shell = shellRadius(sphereCfg.radius, sphereCfg.shellMin);
    sphere[i3] = Math.cos(theta) * ring * shell;
    sphere[i3 + 1] = y * shell;
    sphere[i3 + 2] = Math.sin(theta) * ring * shell;

    // --- phyllotaxis disc (Vogel model) with a shallow dome and thickness ---
    const rn = Math.sqrt(t);
    const dr = rn * discCfg.radius;
    const dTheta = i * goldenAngle;
    disc[i3] = Math.cos(dTheta) * dr;
    disc[i3 + 1] = (1 - rn) * discCfg.radius * discCfg.dome + rand(-1, 1) * discCfg.radius * discCfg.thickness;
    disc[i3 + 2] = Math.sin(dTheta) * dr;

    // --- logarithmic golden coil: exponential radius, linear height ---
    const sr = spiralCfg.inner + (spiralCfg.outer - spiralCfg.inner) * (Math.exp(spiralCfg.turns * t) - 1) /
      (Math.exp(spiralCfg.turns) - 1);
    const sTheta = t * spiralCfg.turns * TAU;
    spiral[i3] = Math.cos(sTheta) * sr + rand(-1, 1) * spiralCfg.jitter;
    spiral[i3 + 1] = (t - 0.5) * spiralCfg.height + rand(-1, 1) * spiralCfg.jitter;
    spiral[i3 + 2] = Math.sin(sTheta) * sr + rand(-1, 1) * spiralCfg.jitter;

    // --- attributes ---
    const ci = pickColorIndex();
    const entry = COLOR_TABLE[ci];
    const s = pickSize();
    const b = rand(0.55, 1.5) * (1 + (s / SIZE_TIERS[SIZE_TIERS.length - 1]) * CONFIG.particles.brightnessSize);

    seed[i] = Math.random();
    size[i] = s;
    color[i3] = entry.r;
    color[i3 + 1] = entry.g;
    color[i3 + 2] = entry.b;
    bright[i] = b;
  }

  return { start, sphere, disc, spiral, dir, seed, size, color, bright };
}

function shellRadius(radius: number, shellMin: number) {
  return radius * (shellMin + Math.random() * (1 - shellMin));
}
