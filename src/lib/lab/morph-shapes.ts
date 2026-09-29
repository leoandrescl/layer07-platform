/**
 * Target figures for the "07 morfosis" lab hero. Every builder lays out the
 * same particle budget as one figure, so the vertex shader can morph between
 * any pair of figures by interpolating position + color buffers.
 *
 * All figures are normalised to roughly the same bounding radius
 * (FIGURE_RADIUS) so the on-screen size stays consistent across morphs.
 */

import { SEVEN_PATH, ZERO } from "@/components/hero/glyphs";

const TAU = Math.PI * 2;

/** Shared bounding radius every figure is designed around. */
export const FIGURE_RADIUS = 2.5;

/** Index of the "07" figure: the only one where the idle spin pauses. */
export const GLYPH_INDEX = 4;

export const FIGURE_KEYS = [
  "galaxy",
  "ring",
  "sphere",
  "helix",
  "glyph",
] as const;

export type FigureKey = (typeof FIGURE_KEYS)[number];

export const FIGURE_COUNT = FIGURE_KEYS.length;

/** Deterministic seed for the shipped build. */
export const MORPH_SEED = 7;

export type FigureBuffers = {
  positions: Float32Array;
  colors: Float32Array;
};

export type Rand = () => number;

/** mulberry32 — small deterministic PRNG so builds are reproducible and testable. */
export function createRand(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

type Palette = { hex: string; weight: number }[];

function pickColor(palette: Palette, rand: Rand, out: Float32Array, i3: number) {
  let roll = rand();
  let chosen = palette[palette.length - 1];
  for (const entry of palette) {
    if (roll < entry.weight) {
      chosen = entry;
      break;
    }
    roll -= entry.weight;
  }
  const [r, g, b] = hexToRgb(chosen.hex);
  out[i3] = r;
  out[i3 + 1] = g;
  out[i3 + 2] = b;
}

/** Cheap bell-ish noise in [-1.5, 1.5]. */
function bell(rand: Rand) {
  return rand() + rand() + rand() - 1.5;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type Vec2 = { x: number; y: number };

function quadBezier(p0: Vec2, c: Vec2, p1: Vec2, u: number): Vec2 {
  const v = 1 - u;
  return {
    x: v * v * p0.x + 2 * v * u * c.x + u * u * p1.x,
    y: v * v * p0.y + 2 * v * u * c.y + u * u * p1.y,
  };
}

const GALAXY_WARM: Palette = [
  { hex: "#ffd9a0", weight: 0.7 },
  { hex: "#ffb066", weight: 0.3 },
];

const GALAXY_COOL: Palette = [
  { hex: "#bcd4ff", weight: 0.45 },
  { hex: "#8fb8ff", weight: 0.35 },
  { hex: "#ffffff", weight: 0.2 },
];

/** Spiral disk: 3 arms, hot core, cold outskirts — the house galaxy look. */
export function buildGalaxyFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const arms = 3;
  const core = 0.2;
  const twist = 3.15;
  const radialCurve = 2.3;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const t = rand();
    const rf = 1 - t;
    const r = core + (FIGURE_RADIUS - core) * Math.pow(rf, radialCurve);
    const arm = Math.floor(rand() * arms);
    const spread = (rand() * 2 - 1) * 0.55;
    const theta =
      arm * (TAU / arms) +
      spread * (0.35 + 0.65 * rf) +
      twist * Math.log(Math.max(r, 0.08) / FIGURE_RADIUS);
    const thickness = 0.16 * (0.18 + 0.82 * rf);

    positions[i3] = Math.cos(theta) * r;
    positions[i3 + 1] = bell(rand) * thickness;
    positions[i3 + 2] = Math.sin(theta) * r;

    const warmChance = Math.max(0, 1 - r / (FIGURE_RADIUS * 0.45));
    pickColor(rand() < warmChance ? GALAXY_WARM : GALAXY_COOL, rand, colors, i3);
  }

  return { positions, colors };
}

const RING_PALETTE: Palette = [
  { hex: "#9fe3ff", weight: 0.6 },
  { hex: "#d9f6ff", weight: 0.18 },
  { hex: "#5db3d9", weight: 0.22 },
];

/** Torus ring facing the camera: the first structure the swarm holds. */
export function buildRingFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const R = 2.05;
  const tube = 0.24;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const ang = rand() * TAU;
    const tubeAng = rand() * TAU;
    const tubeR = Math.sqrt(rand()) * tube;
    const ringR = R + Math.cos(tubeAng) * tubeR;

    positions[i3] = Math.cos(ang) * ringR;
    positions[i3 + 1] = Math.sin(ang) * ringR;
    positions[i3 + 2] = Math.sin(tubeAng) * tubeR;

    pickColor(RING_PALETTE, rand, colors, i3);
  }

  return { positions, colors };
}

const SPHERE_PALETTE: Palette = [
  { hex: "#c9b8ff", weight: 0.5 },
  { hex: "#9d8bff", weight: 0.28 },
  { hex: "#e9e2ff", weight: 0.22 },
];

/** Fibonacci sphere with an inner volume so the body reads as solid. */
export function buildSphereFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const R = 2.3;
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    if (rand() < 0.8) {
      const y = 1 - (2 * (i + 0.5)) / count;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const jitter = 1 + bell(rand) * 0.025;
      positions[i3] = Math.cos(i * golden) * rad * R * jitter;
      positions[i3 + 1] = y * R * jitter;
      positions[i3 + 2] = Math.sin(i * golden) * rad * R * jitter;
    } else {
      const u = Math.cbrt(rand()) * 0.85;
      const theta = rand() * TAU;
      const cosPhi = rand() * 2 - 1;
      const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));
      positions[i3] = sinPhi * Math.cos(theta) * u * R;
      positions[i3 + 1] = cosPhi * u * R;
      positions[i3 + 2] = sinPhi * Math.sin(theta) * u * R;
    }

    pickColor(SPHERE_PALETTE, rand, colors, i3);
  }

  return { positions, colors };
}

const HELIX_A: Palette = [{ hex: "#a8ffd7", weight: 1 }];
const HELIX_B: Palette = [{ hex: "#bcd4ff", weight: 1 }];
const HELIX_RUNG: Palette = [{ hex: "#ffd9a0", weight: 1 }];

/** Double helix with bridging rungs: two flows advancing in the same tempo. */
export function buildHelixFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const R = 1.05;
  const H = 4.3;
  const TURNS = 2.75;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const strand = i % 2;
    const jitter = 0.05;

    if (rand() < 0.16) {
      // rung: bridge between the two strands at a quantised height
      const u = Math.floor(rand() * 21) / 20;
      const phaseA = u * TAU * TURNS;
      const phaseB = phaseA + Math.PI;
      const lambda = rand();
      positions[i3] =
        lerp(Math.cos(phaseA) * R, Math.cos(phaseB) * R, lambda) +
        bell(rand) * jitter * 0.5;
      positions[i3 + 1] = (u - 0.5) * H + bell(rand) * jitter * 0.5;
      positions[i3 + 2] =
        lerp(Math.sin(phaseA) * R, Math.sin(phaseB) * R, lambda) +
        bell(rand) * jitter * 0.5;
      pickColor(HELIX_RUNG, rand, colors, i3);
    } else {
      const u = rand();
      const phase = u * TAU * TURNS + strand * Math.PI;
      positions[i3] = Math.cos(phase) * R + bell(rand) * jitter;
      positions[i3 + 1] = (u - 0.5) * H + bell(rand) * jitter;
      positions[i3 + 2] = Math.sin(phase) * R + bell(rand) * jitter;
      pickColor(strand === 0 ? HELIX_A : HELIX_B, rand, colors, i3);
    }
  }

  return { positions, colors };
}

const GLYPH_PALETTE: Palette = [
  { hex: "#bcd4ff", weight: 0.55 },
  { hex: "#eaf2ff", weight: 0.25 },
  { hex: "#8fb8ff", weight: 0.15 },
  { hex: "#ffd9a0", weight: 0.05 },
];

/** The house mark: the "0" ring plus the two Béziers of the "7". */
export function buildGlyphFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;

    if (rand() < 0.45) {
      const ang = rand() * TAU;
      const rr = 1 + bell(rand) * 0.035;
      positions[i3] = ZERO.center.x + Math.cos(ang) * ZERO.rx * rr;
      positions[i3 + 1] = Math.sin(ang) * ZERO.ry * rr;
      positions[i3 + 2] = bell(rand) * 0.05;
    } else {
      const u = rand();
      const onBar = u >= 0.5;
      const t = onBar ? (u - 0.5) * 2 : u * 2;
      const base = onBar
        ? quadBezier(SEVEN_PATH.p1, SEVEN_PATH.c1, SEVEN_PATH.p0, t)
        : quadBezier(SEVEN_PATH.p2, SEVEN_PATH.c2, SEVEN_PATH.p1, t);

      // numeric tangent -> perpendicular offset across the stroke
      const eps = 0.01;
      const t2 = Math.min(1, t + eps);
      const ahead = onBar
        ? quadBezier(SEVEN_PATH.p1, SEVEN_PATH.c1, SEVEN_PATH.p0, t2)
        : quadBezier(SEVEN_PATH.p2, SEVEN_PATH.c2, SEVEN_PATH.p1, t2);
      let dx = ahead.x - base.x;
      let dy = ahead.y - base.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const lateral = bell(rand) * 0.12;

      positions[i3] = base.x - dy * lateral;
      positions[i3 + 1] = base.y + dx * lateral;
      positions[i3 + 2] = bell(rand) * 0.06;
    }

    pickColor(GLYPH_PALETTE, rand, colors, i3);
  }

  return { positions, colors };
}

const FIGURE_BUILDERS: Record<
  FigureKey,
  (count: number, rand: Rand) => FigureBuffers
> = {
  galaxy: buildGalaxyFigure,
  ring: buildRingFigure,
  sphere: buildSphereFigure,
  helix: buildHelixFigure,
  glyph: buildGlyphFigure,
};

export function buildFigure(
  key: FigureKey,
  count: number,
  seed: number = MORPH_SEED,
): FigureBuffers {
  return FIGURE_BUILDERS[key](count, createRand(seed));
}
