export const DEBUG = false;

export const CONFIG = {
  particles: {
    countDesktop: 120000,
    countTablet: 60000,
    countMobile: 28000,
    minSize: 0.5,
    maxSize: 2.0,
  },

  galaxy: {
    radius: 7.2,
    arms: 4,
    branchiness: 2.2,
    spin: 1.0,
    twist: 1.9,
    coreRadius: 1.1,
    thickness: 0.4,
    rotationSpeed: 0.09,
    zoneRatio: 0.5, // fraction of particles used to build the galaxy (rest -> halo)
  },

  animation: {
    formationDelay: 0.2, // seconds after load before a subtle settle
    formationDuration: 2.2, // seconds for the initial galaxy settle-in
    formationAuto: true,
  },

  scatter: {
    speed: 11.0,
    noise: 1.2,
  },

  camera: {
    z: 12.0,
    rotationX: -0.35,
    rotationY: 0.0,
    dragSensitivityX: 2.4,
    dragSensitivityY: 1.5,
    parallax: 0.08,
    damping: 0.055,
  },

  // normalized scroll progress keyframes (0 -> 1)
  scroll: {
    galaxyEnd: 0.18, // galaxy fully formed + rotating
    dispersionStart: 0.28,
    scattered: 0.48, // galaxy fully dispersed, content visible
    contentHold: 0.62, // dispersed/ambient while reading
    regroupStart: 0.72,
    regrouped: 0.9, // galaxy re-formed
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