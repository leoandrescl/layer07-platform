import { ShapeUtils, type Shape, type Vector2 } from "three";
import { buildGlyphShapes, GLYPH } from "./glyphs";

type ColorEntry = { r: number; g: number; b: number; cumulative: number };

/** Star palette: cool white/blue with warm amber and a rare ember. */
const STAR_PALETTE = [
  { hex: "#ffffff", weight: 0.42 },
  { hex: "#dbe7ff", weight: 0.22 },
  { hex: "#9fc4ff", weight: 0.14 },
  { hex: "#ffd9a0", weight: 0.12 },
  { hex: "#ffb066", weight: 0.07 },
  { hex: "#ff7a6b", weight: 0.03 },
];

function colorTable(palette: { hex: string; weight: number }[]): ColorEntry[] {
  const table: ColorEntry[] = [];
  let cumulative = 0;
  for (const entry of palette) {
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

const COLOR_TABLE = colorTable(STAR_PALETTE);

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

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function gaussian() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

function pickSize(tiers: number[], weights: number[], jitter = 0.3) {
  let r = Math.random();
  for (let t = 0; t < weights.length; t += 1) {
    if (r < weights[t]) {
      return tiers[t] * (1 - jitter + Math.random() * jitter * 2);
    }
    r -= weights[t];
  }
  return tiers[tiers.length - 1];
}

type Triangle = { a: Vector2; b: Vector2; c: Vector2; cum: number };

function triangulate(shape: Shape) {
  const extracted = shape.extractPoints(12);
  const faces = ShapeUtils.triangulateShape(extracted.shape, extracted.holes);
  const all = [...extracted.shape, ...extracted.holes.flat()];

  const triangles: Triangle[] = [];
  let total = 0;
  for (const face of faces) {
    const a = all[face[0]];
    const b = all[face[1]];
    const c = all[face[2]];
    const area =
      Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) * 0.5;
    if (area <= 1e-6) continue;
    total += area;
    triangles.push({ a, b, c, cum: total });
  }
  return { triangles, total };
}

function sampleTriangle(triangles: Triangle[], total: number) {
  const r = Math.random() * total;
  let lo = 0;
  let hi = triangles.length - 1;
  let tri = triangles[hi];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (triangles[mid].cum >= r) {
      tri = triangles[mid];
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }

  let u = Math.random();
  let v = Math.random();
  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }

  return {
    x: tri.a.x + u * (tri.b.x - tri.a.x) + v * (tri.c.x - tri.a.x),
    y: tri.a.y + u * (tri.b.y - tri.a.y) + v * (tri.c.y - tri.a.y),
  };
}

/** Particles that fly along a spiral and settle on the L07. */
export type FormationBuffers = {
  position: Float32Array;
  aTarget: Float32Array;
  aPhase: Float32Array;
  aSpeed: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aSeed: Float32Array;
  aColor: Float32Array;
  aRadius0: Float32Array;
  aSpin: Float32Array;
  aDepth: Float32Array;
};

export function buildFormation(count: number): FormationBuffers {
  const glyphs = buildGlyphShapes().map((glyph) => ({
    x: glyph.x,
    ...triangulate(glyph.shape),
  }));
  const grandTotal = glyphs.reduce((sum, glyph) => sum + glyph.total, 0);

  const position = new Float32Array(count * 3);
  const aTarget = new Float32Array(count * 3);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aColor = new Float32Array(count * 3);
  const aRadius0 = new Float32Array(count);
  const aSpin = new Float32Array(count);
  const aDepth = new Float32Array(count);

  const sizeTiers = [0.02, 0.035, 0.055, 0.09];
  const sizeWeights = [0.46, 0.3, 0.16, 0.08];

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;

    let pick = Math.random() * grandTotal;
    let glyph = glyphs[glyphs.length - 1];
    for (const candidate of glyphs) {
      if (pick <= candidate.total) {
        glyph = candidate;
        break;
      }
      pick -= candidate.total;
    }

    const point = sampleTriangle(glyph.triangles, glyph.total);
    aTarget[i3] = glyph.x + point.x;
    aTarget[i3 + 1] = point.y - GLYPH.cap / 2;
    aTarget[i3 + 2] = rand(-0.05, 0.05);

    aPhase[i] = Math.random();
    aSpeed[i] = rand(0.6, 1.4);
    aSeed[i] = Math.random();
    aSize[i] = pickSize(sizeTiers, sizeWeights);
    aBright[i] = rand(0.6, 1.5) * (1 + (aSize[i] / sizeTiers[3]) * 0.5);
    aRadius0[i] = rand(3.6, 8.6);
    aSpin[i] = gaussian() * 0.85;
    aDepth[i] = rand(-0.3, 0.3);

    pickColor(aColor, i3);
  }

  return {
    position,
    aTarget,
    aPhase,
    aSpeed,
    aSize,
    aBright,
    aSeed,
    aColor,
    aRadius0,
    aSpin,
    aDepth,
  };
}

/** Dense, mostly static starfield that fills the whole space. */
export type StarfieldBuffers = {
  position: Float32Array;
  aBase: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aSeed: Float32Array;
  aSpeed: Float32Array;
  aColor: Float32Array;
};

export function buildStarfield(count: number): StarfieldBuffers {
  const position = new Float32Array(count * 3);
  const aBase = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aColor = new Float32Array(count * 3);

  const spreadX = 20;
  const spreadY = 13;
  const spreadZ = 9;

  const sizeTiers = [0.007, 0.013, 0.022, 0.04];
  const sizeWeights = [0.58, 0.26, 0.12, 0.04];

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    aBase[i3] = rand(-spreadX / 2, spreadX / 2);
    aBase[i3 + 1] = rand(-spreadY / 2, spreadY / 2);
    aBase[i3 + 2] = rand(-spreadZ / 2, spreadZ / 2);

    aSize[i] = pickSize(sizeTiers, sizeWeights, 0.4);
    aBright[i] = rand(0.18, 0.95) * (aSize[i] > 0.03 ? 1.5 : 1);
    aSeed[i] = Math.random();
    aSpeed[i] = rand(0.4, 1.6);

    pickColor(aColor, i3);
  }

  return { position, aBase, aSize, aBright, aSeed, aSpeed, aColor };
}
