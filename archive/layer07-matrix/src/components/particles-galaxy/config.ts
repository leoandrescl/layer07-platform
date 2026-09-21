export type QualityLevel = "high" | "medium" | "low";

export interface Quality {
  level: QualityLevel;
  count: number;
  pixelRatio: number;
  bloomLevels: number;
  streakSamples: number;
}

/**
 * Own palette. Cool blues / aqua / cyan dominate the arms, warm amber and
 * orange mark the core, magenta is a rare glint. Weights must sum to 1.
 */
export const PALETTE: readonly { hex: string; weight: number }[] = [
  { hex: "#e8fff8", weight: 0.22 },
  { hex: "#7fffd4", weight: 0.18 },
  { hex: "#00f0ff", weight: 0.18 },
  { hex: "#5b8cff", weight: 0.17 },
  { hex: "#ffaa60", weight: 0.14 },
  { hex: "#ff7a28", weight: 0.08 },
  { hex: "#ff0055", weight: 0.03 },
];

export const BACKGROUND = 0x000000;

export const CONFIG = {
  fov: 42,
  cameraZ: 9,
  /** disc inclination: 0 = top-down, larger = seen more edge-on */
  tilt: 1.02,

  galaxy: {
    arms: 3,
    outerRadius: 3.6,
    coreRadius: 0.2,
    /** radial concentration: >1 packs more matter toward the core */
    radialCurve: 2.3,
    /** log-spiral winding (radians across the disc) */
    twist: 3.15,
    /** negative spin = counter-clockwise (right to left) like Astra */
    spin: -0.2,
    /** base life per second; a particle drifts outward->core over ~1/speed s */
    flowSpeed: 0.055,
    /** disc half-thickness relative to the outer radius */
    thickness: 0.14,
    /** angular arm half-width (radians) */
    armWidth: 0.3,
    /** fraction of particles forming the diffuse halo between arms */
    halo: 0.22,
  },

  particles: {
    sizeTiers: [0.012, 0.02, 0.032, 0.05, 0.078, 0.12],
    tierWeights: [0.33, 0.26, 0.18, 0.13, 0.07, 0.03],
    brightnessSize: 0.35,
    minSize: 0.006,
  },

  motion: {
    introDuration: 1.8,
    dragSensitivity: 1.6,
    damping: 0.05,
    dragDamping: 0.24,
    maxTiltOffset: 0.85,
  },

  effects: {
    bloomIntensity: 1.0,
    bloomThreshold: 0.1,
    bloomSmoothing: 0.24,
    bloomRadius: 0.82,
    streakStrength: 0.6,
    streakThreshold: 0.5,
    streakTint: "#9fe3ff",
    chromatic: 0.0011,
    grain: 0.03,
    vignette: 0.55,
    /** warm tint the core converges toward */
    coreColor: "#ffd7a8",
  },
} as const;

export function qualityFor(level: QualityLevel): Quality {
  switch (level) {
    case "high":
      return { level, count: 14000, pixelRatio: 2, bloomLevels: 7, streakSamples: 23 };
    case "medium":
      return { level, count: 9000, pixelRatio: 1.5, bloomLevels: 5, streakSamples: 13 };
    case "low":
      return { level, count: 5000, pixelRatio: 1.25, bloomLevels: 4, streakSamples: 9 };
  }
}

export function initialQuality(): QualityLevel {
  if (typeof window === "undefined") return "high";
  const w = window.innerWidth;
  if (w < 640) return "low";
  if (w < 1024) return "medium";
  return "high";
}
