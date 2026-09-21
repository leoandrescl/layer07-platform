/**
 * Brush-style "07". Each glyph is drawn as a river of particles.
 *
 * 0: a closed ellipse loop — the river travels around it forever (no seam).
 * 7: leg + bar, drawn with two quadratic Béziers. Particles enter at the bottom
 *    tip (p2), travel up the leg, round the corner (p1) and flow left along the
 *    bar, exiting at p0.
 */
export const MARK_SCALE = 2.4;

const S = MARK_SCALE;
const SEVEN_OFFSET_X = 1.45;

export const SEVEN_PATH = {
  /** left end of the bar (exit) */
  p0: { x: -0.44 * S + SEVEN_OFFSET_X, y: 0.58 * S },
  /** bar control point */
  c1: { x: -0.05 * S + SEVEN_OFFSET_X, y: 0.72 * S },
  /** top-right corner */
  p1: { x: 0.44 * S + SEVEN_OFFSET_X, y: 0.6 * S },
  /** leg control point */
  c2: { x: 0.28 * S + SEVEN_OFFSET_X, y: -0.1 * S },
  /** bottom tip of the leg (entry) */
  p2: { x: -0.1 * S + SEVEN_OFFSET_X, y: -0.74 * S },
} as const;

/** The "0": a brush oval ring. */
export const ZERO = {
  center: { x: -1.45, y: 0 },
  rx: 0.95,
  ry: 1.7,
} as const;
