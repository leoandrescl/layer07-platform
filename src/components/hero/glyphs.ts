/**
 * Brush-style "7" (as in the reference): a gently curved top bar, a rounded
 * top-right corner and a leg that sweeps down and tapers to a point.
 *
 * The mark is drawn as a river along two quadratic Béziers:
 *   bar:  P0 -> C1 -> P1
 *   leg:  P1 -> C2 -> P2
 * Particles enter at P2 (bottom tip), travel up the leg, round the corner and
 * flow left along the bar, exiting at P0.
 */
export const SEVEN_SCALE = 2.4;

const S = SEVEN_SCALE;

export const SEVEN_PATH = {
  /** left end of the bar (exit) */
  p0: { x: -0.44 * S, y: 0.58 * S },
  /** bar control point */
  c1: { x: -0.05 * S, y: 0.72 * S },
  /** top-right corner */
  p1: { x: 0.44 * S, y: 0.6 * S },
  /** leg control point */
  c2: { x: 0.28 * S, y: -0.1 * S },
  /** bottom tip of the leg (entry) */
  p2: { x: -0.1 * S, y: -0.74 * S },
} as const;

/** Approximate world bounds of the mark. */
export const SEVEN_BOUNDS = {
  width: 0.88 * S,
  height: 1.32 * S,
} as const;
