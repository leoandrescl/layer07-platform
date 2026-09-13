export const DEBUG = false;

export const CONFIG = {
  particles: {
    countDesktop: 90000,
    countTablet: 45000,
    countMobile: 22000,
    minSize: 1.1,
    maxSize: 2.6,
  },

  galaxy: {
    radius: 6.4,
    arms: 4,
    branchiness: 2.4,
    spin: 1.0,
    twist: 1.6,
    coreRadius: 0.9,
    thickness: 0.55,
    rotationSpeed: 0.06,
    zoneRatio: 0.5, // fraction of particles used to build the galaxy (rest -> halo)
  },

  animation: {
    formationDelay: 0.6, // seconds after load before formation begins
    formationDuration: 5.0, // seconds to build the galaxy
    formationAuto: true,
  },

  scatter: {
    speed: 9.0,
    tangential: 0.6,
    noise: 1.4,
  },

  camera: {
    z: 11.5,
    rotationX: 0.0,
    rotationY: 0.0,
    dragSensitivityX: 2.4,
    dragSensitivityY: 1.5,
    parallax: 0.12,
    damping: 0.055,
  },

  logo: {
    // normalized to a unit box, then multiplied by scale in world units
    scale: 4.6,
    samplingStep: 3.2,
    haloRatio: 0.16,
    breathing: 0.05,
  },

  // normalized scroll progress keyframes (0 -> 1)
  scroll: {
    spaceEnd: 0.08, // galaxy begins to form here
    galaxyFormed: 0.22, // galaxy complete + rotating
    dispersionStart: 0.36,
    scattered: 0.5, // galaxy fully dispersed, content begins
    contentMiddle: 0.64, // ambient / dispersed reading state
    transitionStart: 0.75, // particles begin to react
    regroup: 0.82,
    logoForming: 0.92,
    logoComplete: 1.0,
  },

  interaction: {
    hoverRadius: 1.5,
    hoverForce: 0.4,
  },

  performance: {
    maxPixelRatio: 2,
    maxPixelRatioMobile: 1.5,
    targetFps: 55,
    fpsSampleMs: 900,
    fpsDropThreshold: 0.75,
    bloomEnabled: true,
  },
} as const;

export type QualityLevel = "high" | "medium" | "low";

export interface Quality {
  level: QualityLevel;
  count: number;
  pixelRatio: number;
  bloom: boolean;
}

export function qualityFor(level: QualityLevel): Quality {
  switch (level) {
    case "high":
      return {
        level,
        count: CONFIG.particles.countDesktop,
        pixelRatio: CONFIG.performance.maxPixelRatio,
        bloom: CONFIG.performance.bloomEnabled,
      };
    case "medium":
      return {
        level,
        count: CONFIG.particles.countTablet,
        pixelRatio: 1.5,
        bloom: CONFIG.performance.bloomEnabled,
      };
    case "low":
      return {
        level,
        count: CONFIG.particles.countMobile,
        pixelRatio: 1,
        bloom: false,
      };
  }
}

export function initialQuality(): QualityLevel {
  if (typeof window === "undefined") return "high";
  const w = window.innerWidth;
  if (w < 640) return "low";
  if (w < 1024) return "medium";
  return "high";
}