export type FieldTier = 0 | 1 | 2;

export type Capability = {
  tier: FieldTier;
  reduced: boolean;
  dpr: number;
  /** Render resolution multiplier applied on top of dpr. */
  resolutionScale: number;
  maxFps: number;
  quality: number;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function detectCapability(): Capability {
  if (typeof window === "undefined") {
    return {
      tier: 0,
      reduced: true,
      dpr: 1,
      resolutionScale: 0.5,
      maxFps: 30,
      quality: 0,
    };
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const nav = navigator as NavigatorWithMemory;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const dpr = window.devicePixelRatio || 1;
  const webgl = supportsWebGL();

  if (reduced || !webgl) {
    return {
      tier: 0,
      reduced,
      dpr: 1,
      resolutionScale: 0.5,
      maxFps: 30,
      quality: 0,
    };
  }

  const lowPower = coarse || cores <= 4 || memory <= 4;

  if (lowPower) {
    return {
      tier: 1,
      reduced: false,
      dpr: Math.min(dpr, 1.25),
      resolutionScale: 0.6,
      maxFps: 30,
      quality: 0,
    };
  }

  return {
    tier: 2,
    reduced: false,
    dpr: Math.min(dpr, 1.6),
    resolutionScale: 0.85,
    maxFps: 60,
    quality: 1,
  };
}
