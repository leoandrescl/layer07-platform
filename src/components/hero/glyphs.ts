import { ExtrudeGeometry, Path, Shape } from "three";

export const GLYPH = {
  cap: 1,
  stroke: 0.22,
  depth: 0.34,
  bevel: 0.026,
  spacing: 0.14,
} as const;

const { cap, stroke, depth, bevel, spacing } = GLYPH;

const WIDTH = {
  L: 0.62,
  zero: 0.66,
  seven: 0.62,
} as const;

function roundedRect(
  path: Path,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  clockwise: boolean,
) {
  const r = Math.min(radius, width / 2, height / 2);

  if (clockwise) {
    path.moveTo(x + r, y);
    path.lineTo(x + width - r, y);
    path.quadraticCurveTo(x + width, y, x + width, y + r);
    path.lineTo(x + width, y + height - r);
    path.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    path.lineTo(x + r, y + height);
    path.quadraticCurveTo(x, y + height, x, y + height - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);
  } else {
    path.moveTo(x + r, y);
    path.quadraticCurveTo(x, y, x, y + r);
    path.lineTo(x, y + height - r);
    path.quadraticCurveTo(x, y + height, x + r, y + height);
    path.lineTo(x + width - r, y + height);
    path.quadraticCurveTo(x + width, y + height, x + width, y + height - r);
    path.lineTo(x + width, y + r);
    path.quadraticCurveTo(x + width, y, x + width - r, y);
    path.lineTo(x + r, y);
  }
}

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
  const shape = new Shape();
  roundedRect(shape, 0, 0, WIDTH.zero, cap, WIDTH.zero / 2, true);

  const hole = new Path();
  roundedRect(
    hole,
    stroke,
    stroke,
    WIDTH.zero - stroke * 2,
    cap - stroke * 2,
    (WIDTH.zero - stroke * 2) / 2,
    false,
  );
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
  shape.lineTo(0.58, under);
  shape.lineTo(0.29, 0);
  shape.lineTo(0.07, 0);
  shape.lineTo(0.36, under);
  shape.lineTo(0, under);
  shape.lineTo(0, cap);
  return shape;
}

export type Glyph = {
  geometry: ExtrudeGeometry;
  x: number;
};

export function buildWord(): Glyph[] {
  const extrude = {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 18,
    steps: 1,
  };

  const offsetZero = WIDTH.L + spacing;
  const offsetSeven = offsetZero + WIDTH.zero + spacing;
  const total = offsetSeven + WIDTH.seven;

  return [
    { geometry: new ExtrudeGeometry(shapeL(), extrude), x: -total / 2 },
    {
      geometry: new ExtrudeGeometry(shapeZero(), extrude),
      x: -total / 2 + offsetZero,
    },
    {
      geometry: new ExtrudeGeometry(shapeSeven(), extrude),
      x: -total / 2 + offsetSeven,
    },
  ];
}
