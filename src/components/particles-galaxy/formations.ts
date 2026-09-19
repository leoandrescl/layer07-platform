import { CONFIG, PALETTE } from "./config";

const PI = Math.PI;

export interface ParticleBuffers {
  /** required by three (unused by the shader, positions are computed on GPU) */
  position: Float32Array;
  /** starting life 0..1, offset so particles are spread across the flow */
  phase: Float32Array;
  /** per-particle flow rate multiplier */
  speed: Float32Array;
  /** arm index, or -1 for diffuse halo matter */
  arm: Float32Array;
  /** angular jitter within the arm (grows/decreases with radius in shader) */
  spread: Float32Array;
  /** vertical offset (disc thickness) */
  height: Float32Array;
  seed: Float32Array;
  size: Float32Array;
  color: Float32Array;
  bright: Float32Array;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

/** cheap approx-gaussian in roughly [-1.5, 1.5] */
function gaussian() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

function makeColorTable() {
  const table: { r: number; g: number; b: number; cumulative: number }[] = [];
  let cumulative = 0;
  for (const entry of PALETTE) {
    const hex = entry.hex.replace("#", "");
    table.push({
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      cumulative: (cumulative += entry.weight),
    });
  }
  return table;
}

const COLOR_TABLE = makeColorTable();

function pickColor(out: Float32Array, i3: number) {
  const r = Math.random();
  let entry = COLOR_TABLE[COLOR_TABLE.length - 1];
  for (let i = 0; i < COLOR_TABLE.length; i += 1) {
    if (r <= COLOR_TABLE[i].cumulative) {
      entry = COLOR_TABLE[i];
      break;
    }
  }
  out[i3] = entry.r;
  out[i3 + 1] = entry.g;
  out[i3 + 2] = entry.b;
}

function pickSize() {
  const tiers = CONFIG.particles.sizeTiers;
  const weights = CONFIG.particles.tierWeights;
  let r = Math.random();
  for (let t = 0; t < weights.length; t += 1) {
    if (r < weights[t]) {
      return Math.max(CONFIG.particles.minSize, tiers[t] * rand(0.72, 1.28));
    }
    r -= weights[t];
  }
  return tiers[tiers.length - 1];
}

/**
 * Builds the per-particle attributes for the galaxy. Radius and angle are not
 * baked here: the vertex shader derives them from a looping "life" value so the
 * whole field flows inward continuously without any per-frame CPU work.
 */
export function buildParticles(count: number): ParticleBuffers {
  const { arms, armWidth, halo } = CONFIG.galaxy;

  const position = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  const arm = new Float32Array(count);
  const spread = new Float32Array(count);
  const height = new Float32Array(count);
  const seed = new Float32Array(count);
  const size = new Float32Array(count);
  const color = new Float32Array(count * 3);
  const bright = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const isHalo = Math.random() < halo;

    phase[i] = Math.random();
    speed[i] = rand(0.65, 1.35);
    seed[i] = Math.random();

    if (isHalo) {
      arm[i] = -1;
      spread[i] = rand(-PI, PI);
      height[i] = gaussian() * 1.4;
      size[i] = pickSize() * 0.7;
      bright[i] = rand(0.12, 0.38);
    } else {
      arm[i] = Math.floor(Math.random() * arms);
      spread[i] = gaussian() * armWidth;
      height[i] = gaussian() * (Math.random() < 0.12 ? 1.8 : 1);
      size[i] = pickSize();
      bright[i] = rand(0.5, 1.45) * (1 + (size[i] / CONFIG.particles.sizeTiers[5]) * CONFIG.particles.brightnessSize);
    }

    pickColor(color, i3);
  }

  return { position, phase, speed, arm, spread, height, seed, size, color, bright };
}
