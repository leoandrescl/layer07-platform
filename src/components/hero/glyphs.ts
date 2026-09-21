import { Path, Shape } from "three";

/**
 * Refined, light geometric logotype. Thin strokes and an oval counter so the
 * particle formation reads as a delicate mark rather than a heavy block.
 */
export const GLYPH = {
  cap: 1,
  stroke: 0.15,
  spacing: 0.18,
} as const;

const { cap, stroke, spacing } = GLYPH;

const WIDTH = {
  L: 0.46,
  zero: 0.6,
  seven: 0.54,
} as const;

function shapeL() {
  const shape = new Shape();
  shape.moveTo(0, 0);
  shape.lineTo(WIDTH.L, 0);
  shape.lineTo(WIDTH.L, stroke);
  shape.lineTo(stroke, stroke);
  shape.lineTo(stroke, cap);
  shape.lineTo(0, cap);
  shape.lineTo(0, 0);
  return shape;
}

function shapeZero() {
  const cx = WIDTH.zero / 2;
  const rx = WIDTH.zero / 2;
  const ry = cap / 2;

  const shape = new Shape();
  shape.absellipse(cx, ry, rx, ry, 0, Math.PI * 2, false, 0);

  const hole = new Path();
  hole.absellipse(cx, ry, rx - stroke, ry - stroke, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  return shape;
}

function shapeSeven() {
  const shape = new Shape();
  const w = WIDTH.seven;
  const under = cap - stroke;

  shape.moveTo(0, cap);
  shape.lineTo(w, cap);
  shape.lineTo(w, under);
  shape.lineTo(0.4, under);
  shape.lineTo(0.14, 0);
  shape.lineTo(0, 0);
  shape.lineTo(0.26, under);
  shape.lineTo(0, under);
  shape.lineTo(0, cap);
  return shape;
}

export type GlyphShape = {
  shape: Shape;
  x: number;
};

export function buildGlyphShapes(): GlyphShape[] {
  const offsetZero = WIDTH.L + spacing;
  const offsetSeven = offsetZero + WIDTH.zero + spacing;
  const total = offsetSeven + WIDTH.seven;

  return [
    { shape: shapeL(), x: -total / 2 },
    { shape: shapeZero(), x: -total / 2 + offsetZero },
    { shape: shapeSeven(), x: -total / 2 + offsetSeven },
  ];
}

export const WORD_WIDTH =
  WIDTH.L + spacing + WIDTH.zero + spacing + WIDTH.seven;
