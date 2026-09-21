import { Euler, Quaternion, Vector3 } from "three";

export const MATTER = {
  /** Total height of the strata block in world units. */
  height: 2.2,
  width: 2.1,
  depth: 2.1,
  layersHigh: 64,
  layersLow: 30,
  /** Thickness as a fraction of the per-layer step. */
  thicknessRatio: 0.68,
};

/** Scroll keyframes for the sculpture states. */
export const ACT_KEYS = [0, 0.15, 0.35, 0.55, 0.75, 0.92, 1];

/** Narrative act bounds used by the progress indicator (5 acts). */
export const ACT_BOUNDS = [0, 0.15, 0.35, 0.55, 0.75, 1];

export type Layer = {
  widthScale: number;
  depthScale: number;
  yJitter: number;
  rotY: number;
  phase: number;
};

type State = {
  x: number;
  y: number;
  z: number;
  rx: number;
  rz: number;
  sx: number;
  sz: number;
  sy: number;
};

const CAMERA_KEYS = [
  { pos: [0, 0.1, 6.4], target: [-1.45, -0.05, 0] },
  { pos: [-0.5, 0.25, 5.2], target: [-1.35, 0, 0] },
  { pos: [3.3, 0.95, 4.8], target: [0, 0.05, 0] },
  { pos: [0.3, 1.7, 6.8], target: [0, 0.15, 0] },
  { pos: [0, 0.25, 6.0], target: [0, 0, 0] },
  { pos: [0, 0.05, 5.3], target: [0, 0, 0] },
  { pos: [0, 0.05, 5.3], target: [0, 0, 0] },
] as const;

function fract(value: number) {
  return value - Math.floor(value);
}

function rand(seed: number) {
  return fract(Math.sin(seed * 127.1 + 311.7) * 43758.5453);
}

export function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smooth01(value: number, from: number, to: number) {
  const t = clamp01((value - from) / (to - from || 1));
  return t * t * (3 - 2 * t);
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function createLayers(count: number): Layer[] {
  return Array.from({ length: count }, (_, i) => ({
    widthScale: 0.93 + rand(i * 1.7) * 0.14,
    depthScale: 0.93 + rand(i * 2.3 + 5) * 0.14,
    yJitter: (rand(i * 3.1 + 9) - 0.5) * 0.016,
    rotY: (rand(i * 4.7 + 13) - 0.5) * 0.07,
    phase: rand(i * 5.3 + 21) * Math.PI * 2,
  }));
}

function stateFor(act: number, t: number, height: number): State {
  const half = t - 0.5;

  switch (act) {
    case 0:
    case 1:
      return { x: 0, y: half * height, z: 0, rx: 0, rz: 0, sx: 1, sz: 1, sy: 1 };
    case 2: {
      const sign = t >= 0.5 ? 1 : -1;
      return {
        x: 0,
        y: half * height * 1.85 + sign * 0.16,
        z: 0,
        rx: 0,
        rz: half * 0.24,
        sx: 1.05,
        sz: 1.05,
        sy: 1,
      };
    }
    case 3: {
      const theta = half * 1.6;
      const radius = 2.15;
      return {
        x: 0,
        y: radius * Math.sin(theta),
        z: radius * (1 - Math.cos(theta)) - 0.55,
        rx: -theta,
        rz: 0,
        sx: 1,
        sz: 1,
        sy: 1,
      };
    }
    case 4:
      return {
        x: 0,
        y: half * 0.07,
        z: 0,
        rx: 0,
        rz: 0,
        sx: 1.55,
        sz: 1.55,
        sy: 1,
      };
    default:
      return {
        x: 0,
        y: half * 0.035,
        z: 0,
        rx: 0,
        rz: 0,
        sx: 3.6,
        sz: 0.5,
        sy: 1,
      };
  }
}

function mixState(a: State, b: State, t: number): State {
  return {
    x: mix(a.x, b.x, t),
    y: mix(a.y, b.y, t),
    z: mix(a.z, b.z, t),
    rx: mix(a.rx, b.rx, t),
    rz: mix(a.rz, b.rz, t),
    sx: mix(a.sx, b.sx, t),
    sz: mix(a.sz, b.sz, t),
    sy: mix(a.sy, b.sy, t),
  };
}

function segment(progress: number) {
  for (let i = 0; i < ACT_KEYS.length - 1; i += 1) {
    const start = ACT_KEYS[i];
    const end = ACT_KEYS[i + 1];
    if (progress <= end || i === ACT_KEYS.length - 2) {
      const raw = clamp01((progress - start) / (end - start || 1));
      return { index: i, t: raw * raw * (3 - 2 * raw) };
    }
  }
  return { index: ACT_KEYS.length - 2, t: 1 };
}

export function computeTransform(
  layer: Layer,
  layerT: number,
  progress: number,
  height: number,
  cursor: { x: number; z: number },
  time: number,
  pulse: number,
  pulsePhase: number,
  outPosition: Vector3,
  outQuaternion: Quaternion,
  outScale: Vector3,
  euler: Euler,
) {
  const { index, t } = segment(progress);
  const blended = mixState(
    stateFor(index, layerT, height),
    stateFor(index + 1, layerT, height),
    t,
  );

  const x = blended.x;
  let y = blended.y + layer.yJitter;
  let z = blended.z;
  let rx = blended.rx;
  let rz = blended.rz;

  const idleAmp = 0.012 * (1 - clamp01(progress / 0.5));
  y += Math.sin(time * 0.6 + layer.phase) * idleAmp;

  const dx = x - cursor.x;
  const dz = z - cursor.z;
  const distance = Math.hypot(dx, dz);
  const radius = 1.4;
  const influence = Math.exp(-(distance * distance) / (radius * radius));
  const rippleAmp = 0.42 * (1 - clamp01(progress / 0.8));

  y += influence * rippleAmp;
  z += influence * 0.18;
  rz += dx * influence * 0.24;
  rx += dz * influence * 0.12;

  if (pulse > 0.001) {
    const wave = Math.sin(distance * 6 - pulsePhase) * pulse;
    y += wave * influence * 0.5;
  }

  outPosition.set(x, y, z);
  euler.set(rx, layer.rotY, rz, "XYZ");
  outQuaternion.setFromEuler(euler);
  outScale.set(
    blended.sx * layer.widthScale,
    blended.sy,
    blended.sz * layer.depthScale,
  );
}

export function cameraAt(
  progress: number,
  outPosition: Vector3,
  outTarget: Vector3,
) {
  const { index, t } = segment(progress);
  const a = CAMERA_KEYS[index];
  const b = CAMERA_KEYS[index + 1];

  outPosition.set(
    mix(a.pos[0], b.pos[0], t),
    mix(a.pos[1], b.pos[1], t),
    mix(a.pos[2], b.pos[2], t),
  );
  outTarget.set(
    mix(a.target[0], b.target[0], t),
    mix(a.target[1], b.target[1], t),
    mix(a.target[2], b.target[2], t),
  );
}

export function actIndex(progress: number) {
  for (let i = 0; i < ACT_BOUNDS.length - 1; i += 1) {
    if (progress < ACT_BOUNDS[i + 1]) return i;
  }
  return ACT_BOUNDS.length - 2;
}

export function actOpacities(progress: number) {
  return {
    cue: 1 - smooth01(progress, 0.05, 0.14),
    hero: 1 - smooth01(progress, 0.28, 0.44),
    capabilities:
      smooth01(progress, 0.32, 0.42) * (1 - smooth01(progress, 0.5, 0.6)),
    manifesto:
      smooth01(progress, 0.54, 0.64) * (1 - smooth01(progress, 0.72, 0.8)),
    wipe: smooth01(progress, 0.9, 1),
  };
}
