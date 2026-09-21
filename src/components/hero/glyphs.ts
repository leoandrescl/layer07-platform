/**
 * Thin, Japanese-style "7": the top bar does NOT overhang to the right — the
 * leg starts exactly at the bar's right end.
 *
 * The mark is drawn as a river: particles enter at the bottom of the leg,
 * travel up it, turn at the top-right corner and flow left along the bar,
 * exiting at the left end.
 */
export const SEVEN = {
  half: 0.45,
  top: 0.7,
  bottom: -0.7,
  stroke: 0.14,
  legWidth: 0.16,
  /** scale applied to the river path */
  scale: 2.4,
} as const;

const { half, top, bottom, stroke, legWidth, scale } = SEVEN;

/** River centerline, scaled to world units. a -> b -> c. */
export const SEVEN_PATH = {
  a: { x: -0.29 * scale, y: bottom * scale },
  b: { x: half * scale, y: (top - stroke / 2) * scale },
  c: { x: -half * scale, y: (top - stroke / 2) * scale },
} as const;

/** Approximate world bounds of the mark (used for framing). */
export const SEVEN_BOUNDS = {
  width: half * 2 * scale,
  height: (top - bottom) * scale,
  legWidth: legWidth * scale,
} as const;
