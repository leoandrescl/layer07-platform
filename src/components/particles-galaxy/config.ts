export type QualityLevel = "high" | "medium" | "low";

export interface Quality {
  level: QualityLevel;
  count: number;
  pixelRatio: number;
  bloom: boolean;
  bloomLevels: number;
  streakSamples: number;
}

/**
 * Own palette. Cool white / aqua / cyan dominate, warm amber and orange are the
 * accents, magenta is a rare glint. Weights must sum to 1.
 */
export const PALETTE: readonly { hex: string; weight: number }[] = [
  { hex: "#e8fff8", weight: 0.3 },
  { hex: "#7fffd4", weight: 0.26 },
  { hex: "#00f0ff", weight: 0.2 },
  { hex: "#ffaa60", weight: 0.14 },
  { hex: "#ff7a28", weight: 0.07 },
  { hex: "#ff0055", weight: 0.03 },
];

export const BACKGROUND = 0x030b0c;

export const CONFIG = {
  fov: 42,
  cameraZ: 8.2,
  /** golden angle (137.5077...deg), the seed of every fibonacci distribution */
  goldenAngle: Math.PI * (3 - Math.sqrt(5)),

  formations: {
    // uniform shell built with the golden spiral on a sphere
    sphere: { radius: 3.15, shellMin: 0.82 },
    // Vogel phyllotaxis disc: the classic fibonacci sunflower
    disc: { radius: 3.95, dome: 0.07, thickness: 0.05 },
    // logarithmic (golden) coil: radius grows exponentially, height linearly
    spiral: { inner: 0.16, outer: 2.55, turns: 5.2, height: 5.0, jitter: 0.06 },
  },

  particles: {
    // absolute world-space diameters, smallest dust first
    sizeTiers: [0.012, 0.02, 0.032, 0.05, 0.075, 0.11],
    tierWeights: [0.33, 0.26, 0.18, 0.13, 0.07, 0.03],
    brightnessSize: 0.35,
    minSize: 0.008,
  },

  motion: {
    introDelay: 0.55,
    introDuration: 2.4,
    baseSpin: 0.05,
    drift: 0.035,
    twinkleSpeed: 1.7,
    dragSensitivity: 1.7,
    damping: 0.035,
    dragDamping: 0.22,
    maxTilt: 1.05,
  },

  effects: {
    bloomIntensity: 0.95,
    bloomThreshold: 0.12,
    bloomSmoothing: 0.22,
    bloomRadius: 0.8,
    streakStrength: 0.6,
    streakThreshold: 0.5,
    streakTint: "#9fe3ff",
    chromatic: 0.0011,
    grain: 0.035,
    vignette: 0.5,
  },

  // normalized scroll progress keyframes
  scroll: {
    sphereFadeStart: 0.3,
    sphereFadeEnd: 0.48,
    spiralStart: 0.68,
    spiralEnd: 0.86,
    disperseStart: 0.9,
    disperseEnd: 1.0,
  },
} as const;

export function qualityFor(level: QualityLevel): Quality {
  switch (level) {
    case "high":
      return { level, count: 14000, pixelRatio: 2, bloom: true, bloomLevels: 7, streakSamples: 23 };
    case "medium":
      return { level, count: 9000, pixelRatio: 1.5, bloom: true, bloomLevels: 5, streakSamples: 13 };
    case "low":
      return { level, count: 5000, pixelRatio: 1.25, bloom: true, bloomLevels: 4, streakSamples: 9 };
  }
}

export function initialQuality(): QualityLevel {
  if (typeof window === "undefined") return "high";
  const w = window.innerWidth;
  if (w < 640) return "low";
  if (w < 1024) return "medium";
  return "high";
}
