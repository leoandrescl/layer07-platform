import { Shape } from "three";

/**
 * Thin, elegant "7". Only the 7 for now — L and 0 are omitted on purpose while
 * the particle formation is tuned.
 */
export const SEVEN = {
  half: 0.45,
  top: 0.7,
  bottom: -0.7,
  stroke: 0.14,
  /** scale applied when sampling so the mark fills the galaxy */
  scale: 2.4,
} as const;

export function buildSevenShape(): Shape {
  const { half, top, bottom, stroke } = SEVEN;

  const shape = new Shape();
  // top bar
  shape.moveTo(-half, top);
  shape.lineTo(half, top);
  shape.lineTo(half, top - stroke);
  // leg right edge
  shape.lineTo(half * 0.66, top - stroke);
  shape.lineTo(-half * 0.62, bottom);
  // leg bottom edge
  shape.lineTo(-half * 0.94, bottom);
  // leg left edge
  shape.lineTo(half * 0.36, top - stroke);
  // bar underside, back to start
  shape.lineTo(-half, top - stroke);
  shape.lineTo(-half, top);

  return shape;
}

export const WORD_WIDTH = SEVEN.half * 2 * SEVEN.scale;
