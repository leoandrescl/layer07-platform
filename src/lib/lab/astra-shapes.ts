/**
 * Figures for the "07 astra" lab — a study of the GPT-6 Astra landing
 * aesthetic: a near-monochrome warm cosmos. Galaxy → dispersed field →
 * star burst → the 07. Original code and copy; nothing is extracted from
 * OpenAI's site (their particle shaders never leave the browser anyway).
 */

import { SEVEN_PATH, ZERO } from "@/components/hero/glyphs";
import { createRand, type Rand } from "./morph-shapes";

const TAU = Math.PI * 2;

/** Shared bounding radius every figure is designed around. */
export const FIGURE_RADIUS = 2.5;

/** Index of the "07" figure: tilt returns to zero and the spin stops. */
export const GLYPH_INDEX = 3;

export const FIGURE_KEYS = ["galaxy", "field", "star", "glyph"] as const;

export type FigureKey = (typeof FIGURE_KEYS)[number];

export const FIGURE_COUNT = FIGURE_KEYS.length;

/** Deterministic seed for the shipped build. */
export const ASTRA_SEED = 6;

export type FigureBuffers = {
  positions: Float32Array;
  colors: Float32Array;
};

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

type Vec2 = { x: number; y: number };

function quadBezier(p0: Vec2, c: Vec2, p1: Vec2, u: number): Vec2 {
  const v = 1 - u;
  return {
    x: v * v * p0.x + 2 * v * u * c.x + u * u * p1.x,
    y: v * v * p0.y + 2 * v * u * c.y + u * u * p1.y,
  };
}

// The whole lab keeps Astra's warm monochrome: white stars, cream and amber
// embers, a whisper of cold blue in the far arms. No saturated hues.
const GALAXY_CORE: Palette = [
  { hex: "#fff6e8", weight: 0.5 },
  { hex: "#ffd9a8", weight: 0.35 },
  { hex: "#ffb066", weight: 0.15 },
];

const GALAXY_ARMS: Palette = [
  { hex: "#ffffff", weight: 0.34 },
  { hex: "#f2ecdf", weight: 0.2 },
  { hex: "#ffd9a0", weight: 0.14 },
  { hex: "#c9d6ee", weight: 0.22 },
  { hex: "#93a9d4", weight: 0.1 },
];

/** Tilted spiral with a heavy glowing bulge, like the Astra hero. */
export function buildGalaxyFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const arms = 3;
  const core = 0.22;
  const twist = 3.05;
  const radialCurve = 2.6;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;

    if (rand() < 0.24) {
      // central bulge: dense gaussian ball, hottest color in the scene
      positions[i3] = bell(rand) * 0.34;
      positions[i3 + 1] = bell(rand) * 0.22;
      positions[i3 + 2] = bell(rand) * 0.34;
      pickColor(GALAXY_CORE, rand, colors, i3);
      continue;
    }

    const t = rand();
    const rf = 1 - t;
    const r = core + (FIGURE_RADIUS - core) * Math.pow(rf, radialCurve);
    const arm = Math.floor(rand() * arms);
    const spread = (rand() * 2 - 1) * 0.5;
    const theta =
      arm * (TAU / arms) +
      spread * (0.35 + 0.65 * rf) +
      twist * Math.log(Math.max(r, 0.08) / FIGURE_RADIUS);
    const thickness = 0.2 * (0.18 + 0.82 * rf);

    positions[i3] = Math.cos(theta) * r;
    positions[i3 + 1] = bell(rand) * thickness;
    positions[i3 + 2] = Math.sin(theta) * r;

    const warmChance = Math.max(0, 1 - r / (FIGURE_RADIUS * 0.5));
    pickColor(rand() < warmChance ? GALAXY_CORE : GALAXY_ARMS, rand, colors, i3);
  }

  return { positions, colors };
}

const FIELD_PALETTE: Palette = [
  { hex: "#ffffff", weight: 0.4 },
  { hex: "#fff1dd", weight: 0.22 },
  { hex: "#ffd9a8", weight: 0.16 },
  { hex: "#c9d6ee", weight: 0.22 },
];

/**
 * The dispersed state as a destination, not just a transition: a wide,
 * quiet starfield the section text floats over.
 */
export function buildFieldFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const r = 2.6 + Math.pow(rand(), 0.7) * 5.2;
    const theta = rand() * TAU;
    const cosPhi = rand() * 2 - 1;
    const sinPhi = Math.sqrt(Math.max(0, 1 - cosPhi * cosPhi));

    positions[i3] = sinPhi * Math.cos(theta) * r;
    positions[i3 + 1] = cosPhi * r * 0.52;
    positions[i3 + 2] = sinPhi * Math.sin(theta) * r;

    pickColor(FIELD_PALETTE, rand, colors, i3);
  }

  return { positions, colors };
}

const STAR_CORE: Palette = [
  { hex: "#ffffff", weight: 0.7 },
  { hex: "#fff6e8", weight: 0.3 },
];

const STAR_RAY: Palette = [
  { hex: "#ffe9c9", weight: 0.55 },
  { hex: "#ffd2a0", weight: 0.3 },
  { hex: "#ffffff", weight: 0.15 },
];

/** A lit star: gaussian core plus a cross of tapered rays. */
export function buildStarFigure(count: number, rand: Rand): FigureBuffers {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const V = 2.9;
  const H = 1.55;
  const D = 0.95;

  // sample a tapered ray: dense near the core, thin at the tip
  const ray = (len: number) => {
    const u = rand() * 2 - 1;
    const along = Math.sign(u) * Math.pow(Math.abs(u), 1.7) * len;
    const width = 0.035 + (1 - Math.abs(along) / len) * 0.13;
    return { along, width };
  };

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const roll = rand();

    if (roll < 0.26) {
      positions[i3] = bell(rand) * 0.22;
      positions[i3 + 1] = bell(rand) * 0.22;
      positions[i3 + 2] = bell(rand) * 0.22;
      pickColor(STAR_CORE, rand, colors, i3);
    } else if (roll < 0.56) {
      const { along, width } = ray(V);
      positions[i3] = bell(rand) * width;
      positions[i3 + 1] = along;
      positions[i3 + 2] = bell(rand) * width;
      pickColor(STAR_RAY, rand, colors, i3);
    } else if (roll < 0.76) {
      const { along, width } = ray(H);
      positions[i3] = along;
      positions[i3 + 1] = bell(rand) * width;
      positions[i3 + 2] = bell(rand) * width;
      pickColor(STAR_RAY, rand, colors, i3);
    } else if (roll < 0.88) {
      const { along, width } = ray(D);
      const diagonal = rand() < 0.5 ? 1 : -1;
      positions[i3] = along / Math.SQRT2;
      positions[i3 + 1] = (along * diagonal) / Math.SQRT2;
      positions[i3 + 2] = bell(rand) * width;
      pickColor(STAR_RAY, rand, colors, i3);
    } else {
      // faint halo around the star
      const r = 0.5 + Math.pow(rand(), 0.6) * 1.6;
      const theta = rand() * TAU;
      positions[i3] = Math.cos(theta) * r;
      positions[i3 + 1] = Math.sin(theta) * r * 0.75;
      positions[i3 + 2] = bell(rand) * 0.25;
      pickColor(STAR_RAY, rand, colors, i3);
    }
  }

  return { positions, colors };
}

const GLYPH_PALETTE: Palette = [
  { hex: "#fff4e2", weight: 0.45 },
  { hex: "#ffffff", weight: 0.25 },
  { hex: "#ffd9a8", weight: 0.3 },
];

/** The house mark in the same warm monochrome. */
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
  field: buildFieldFigure,
  star: buildStarFigure,
  glyph: buildGlyphFigure,
};

export function buildFigure(
  key: FigureKey,
  count: number,
  seed: number = ASTRA_SEED,
): FigureBuffers {
  return FIGURE_BUILDERS[key](count, createRand(seed));
}
