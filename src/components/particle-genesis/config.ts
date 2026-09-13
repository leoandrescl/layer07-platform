export const DEBUG = false;

export const CONFIG = {
  particles: {
    countDesktop: 60000,
    countTablet: 35000,
    countMobile: 18000,
    minSize: 0.14,
    maxSize: 1.1,
  },

  galaxy: {
    radius: 8.0,
    arms: 3,
    branchiness: 0.0,
    twist: 4.2,
    coreRadius: 1.3,
    thickness: 0.22,
    rotationSpeed: 0.045,
    armWidth: 0.22,
  },

  animation: {
    formationDuration: 2.2,
    formationAuto: true,
  },

  scatter: {
    speed: 12.0,
  },

  // camera: yaw rotates around the vertical axis, pitch is the elevation
  // above the galaxy plane. A high pitch (~1.35 rad) reads as top-down.
  camera: {
    distance: 12.5,
    yaw: 0.0,
    pitch: 1.35,
    minPitch: -0.35,
    maxPitch: 1.45,
    dragSensitivityYaw: 2.6,
    dragSensitivityPitch: 2.0,
    parallax: 0.06,
    damping: 0.06,
  },

  // normalized scroll progress keyframes (0 -> 1)
  scroll: {
    galaxyEnd: 0.14, // galaxy fully settled, rotating
    dispersionStart: 0.2,
    scattered: 0.4, // center cleared; content readable
    contentHold: 0.55, // dispersed/ambient while reading
    regroupStart: 0.62,
    regrouped: 0.85, // galaxy re-formed
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