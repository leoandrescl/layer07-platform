export type FieldTier = 0 | 1 | 2;

export type Capability = {
  tier: FieldTier;
  reduced: boolean;
  /** true when the browser is rasterising in software (WARP / SwiftShader) */
  software: boolean;
  dpr: number;
  /** Render resolution multiplier applied on top of dpr. */
  resolutionScale: number;
  maxFps: number;
  quality: number;
};

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

const SOFTWARE_RENDERER =
  /swiftshader|basic render|warp|llvmpipe|software|microsoft basic/;

function probeWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return { ok: false, software: false };

    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    const raw = debug
      ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    const renderer = String(raw ?? "").toLowerCase();

    return { ok: true, software: SOFTWARE_RENDERER.test(renderer) };
  } catch {
    return { ok: false, software: false };
  }
}

export function detectCapability(): Capability {
  if (typeof window === "undefined") {
    return {
      tier: 0,
      reduced: true,
      software: false,
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
  const probe = probeWebGL();

  if (reduced || !probe.ok) {
    return {
      tier: 0,
      reduced,
      software: probe.software,
      dpr: 1,
      resolutionScale: 0.5,
      maxFps: 30,
      quality: 0,
    };
  }

  // Software rasteriser (e.g. a broken/absent GPU driver): skip the per-frame
  // WebGL entirely and let the hero draw a single static frame instead.
  if (probe.software) {
    return {
      tier: 0,
      reduced: false,
      software: true,
      dpr: 1,
      resolutionScale: 0.5,
      maxFps: 1,
      quality: 0,
    };
  }

  const lowPower = coarse || cores <= 4 || memory <= 4;

  if (lowPower) {
    return {
      tier: 1,
      reduced: false,
      software: false,
      dpr: Math.min(dpr, 1.25),
      resolutionScale: 0.6,
      maxFps: 30,
      quality: 0,
    };
  }

  return {
    tier: 2,
    reduced: false,
    software: false,
    dpr: Math.min(dpr, 1.6),
    resolutionScale: 0.85,
    maxFps: 60,
    quality: 1,
  };
}
