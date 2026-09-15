export const DEBUG = false;

export const CONFIG = {
  particles: {
    countDesktop: 1600,
    countTablet: 1000,
    countMobile: 600,
    // 8 absolute size tiers (world units, smallest first): from fine dust to
    // giant glowing stars. Wide geometric gaps so the size variety reads
    // clearly; upper tiers are common enough to dot the arms with big stars.
    tiers: [0.06, 0.1, 0.15, 0.23, 0.35, 0.55, 0.85, 1.2],
    tierWeights: [0.24, 0.2, 0.16, 0.13, 0.12, 0.08, 0.045, 0.025],
    // the single dominant star at the exact center: biggest of them all
    centerStarSize: 2.0,
    // a handful of giant stars near the center: clearly larger than the
    // rest, but bounded — huge sprites read as blurry blobs, not stars
    giantCount: 6,
    giantSize: 1.7,
    // brightness scales size mildly so bright stars read slightly larger
    brightnessSize: 0.3,
  },

  galaxy: {
    radius: 7.2,
    arms: 6,
    branchiness: 0.0,
    twist: 4.6,
    coreRadius: 1.15,
    thickness: 0.2,
    // inward radial flow speed (units/s) — particles drift toward the core
    // instead of the whole galaxy rigidly rotating
    flowSpeed: 0.5,
    // very slow global counter-clockwise drift (rad/s), same sense as the
    // inward flow — just enough to feel alive without winding the arms
    driftSpeed: 0.025,
    // central stars orbit slightly faster than the global drift
    coreOrbitSpeed: 0.08,
    armWidth: 0.32,
  },

  animation: {
    formationDelay: 2.0,
    formationDuration: 1.9,
    formationAuto: true,
    // exponential position smoothing rate (1/s) — lower = gentler, lazier
    // motion for scroll-driven dispersion/regroup
    positionSmoothing: 2.6,
  },

  scatter: {
    speed: 5.0,
  },

  // camera: yaw rotates around the vertical axis, pitch is the elevation
  // above the galaxy plane. A high pitch (~1.35 rad) reads as top-down.
  camera: {
    distance: 16.5,
    yaw: 0.0,
    pitch: 1.35,
    minPitch: -0.35,
    maxPitch: 1.45,
    dragSensitivityYaw: 2.6,
    dragSensitivityPitch: 2.0,
    parallax: 0.06,
    damping: 0.06,
    // stiffer damping while the user is actively dragging, so the camera
    // feels responsive instead of heavy
    dragDamping: 0.28,
  },

  // normalized scroll progress keyframes (0 -> 1)
  scroll: {
    galaxyEnd: 0.14, // galaxy fully settled
    dispersionStart: 0.16,
    scattered: 0.42, // center cleared; content readable
    contentHold: 0.55, // dispersed/ambient while reading
    regroupStart: 0.62,
    regrouped: 0.88, // galaxy re-formed
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