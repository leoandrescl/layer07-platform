import { ShapeUtils, type Shape, type Vector2 } from "three";
import { buildGlyphShapes, GLYPH } from "./glyphs";

type ColorEntry = { r: number; g: number; b: number; cumulative: number };

const L07_PALETTE = [
  { hex: "#f4f1ec", weight: 0.48 },
  { hex: "#7a88ff", weight: 0.3 },
  { hex: "#b9c6ff", weight: 0.14 },
  { hex: "#ffd7a8", weight: 0.08 },
];

const AMBIENT_PALETTE = [
  { hex: "#f4f1ec", weight: 0.32 },
  { hex: "#7a88ff", weight: 0.36 },
  { hex: "#5b6bff", weight: 0.2 },
  { hex: "#b9c6ff", weight: 0.12 },
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

const L07_TABLE = colorTable(L07_PALETTE);
const AMBIENT_TABLE = colorTable(AMBIENT_PALETTE);

function pickColor(table: ColorEntry[], out: Float32Array, i3: number) {
  const r = Math.random();
  let entry = table[table.length - 1];
  for (let i = 0; i < table.length; i += 1) {
    if (r <= table[i].cumulative) {
      entry = table[i];
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
    const area = Math.abs(
      (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y),
    ) * 0.5;
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

export type L07Buffers = {
  position: Float32Array;
  aTarget: Float32Array;
  aScatter: Float32Array;
  aPhase: Float32Array;
  aSpeed: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aSeed: Float32Array;
  aColor: Float32Array;
};

export function buildL07(count: number): L07Buffers {
  const glyphs = buildGlyphShapes().map((glyph) => ({
    x: glyph.x,
    ...triangulate(glyph.shape),
  }));
  const grandTotal = glyphs.reduce((sum, glyph) => sum + glyph.total, 0);

  const position = new Float32Array(count * 3);
  const aTarget = new Float32Array(count * 3);
  const aScatter = new Float32Array(count * 3);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aColor = new Float32Array(count * 3);

  const sizeTiers = [0.018, 0.03, 0.05, 0.082];
  const sizeWeights = [0.5, 0.28, 0.15, 0.07];

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
    const x = glyph.x + point.x;
    const y = point.y - GLYPH.cap / 2;

    aTarget[i3] = x;
    aTarget[i3 + 1] = y;
    aTarget[i3 + 2] = rand(-0.05, 0.05);

    const dirX = x + rand(-0.5, 0.5);
    const dirY = y + rand(-0.5, 0.5);
    const dirZ = rand(-0.4, 0.4);
    const length = Math.hypot(dirX, dirY, dirZ) || 1;
    const distance = rand(3.4, 7.6);
    aScatter[i3] = (dirX / length) * distance;
    aScatter[i3 + 1] = (dirY / length) * distance;
    aScatter[i3 + 2] = (dirZ / length) * distance;

    aPhase[i] = Math.random();
    aSpeed[i] = rand(0.6, 1.4);
    aSeed[i] = Math.random();

    let r = Math.random();
    let size = sizeTiers[sizeTiers.length - 1];
    for (let t = 0; t < sizeWeights.length; t += 1) {
      if (r < sizeWeights[t]) {
        size = sizeTiers[t] * rand(0.75, 1.25);
        break;
      }
      r -= sizeWeights[t];
    }
    aSize[i] = size;
    aBright[i] = rand(0.5, 1.35) * (1 + (size / sizeTiers[3]) * 0.4);

    pickColor(L07_TABLE, aColor, i3);
  }

  return {
    position,
    aTarget,
    aScatter,
    aPhase,
    aSpeed,
    aSize,
    aBright,
    aSeed,
    aColor,
  };
}

export type AmbientBuffers = {
  position: Float32Array;
  aBase: Float32Array;
  aPhase: Float32Array;
  aSpeed: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aSeed: Float32Array;
  aColor: Float32Array;
};

export function buildAmbient(count: number): AmbientBuffers {
  const position = new Float32Array(count * 3);
  const aBase = new Float32Array(count * 3);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aColor = new Float32Array(count * 3);

  const spreadX = 15;
  const spreadY = 9;
  const spreadZ = 4.5;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    aBase[i3] = rand(-spreadX / 2, spreadX / 2);
    aBase[i3 + 1] = rand(-spreadY / 2, spreadY / 2);
    aBase[i3 + 2] = rand(-spreadZ / 2, spreadZ / 2);

    aPhase[i] = Math.random();
    aSpeed[i] = rand(0.5, 1.5);
    aSeed[i] = Math.random();
    aSize[i] = rand(0.008, 0.028) * (Math.random() < 0.12 ? 1.9 : 1);
    aBright[i] = rand(0.14, 0.5);

    pickColor(AMBIENT_TABLE, aColor, i3);
  }

  return {
    position,
    aBase,
    aPhase,
    aSpeed,
    aSize,
    aBright,
    aSeed,
    aColor,
  };
}
