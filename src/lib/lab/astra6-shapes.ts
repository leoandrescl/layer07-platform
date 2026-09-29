/**
 * "Astra G6" lab — a from-scratch study of the GPT-6 Astra intro sequence.
 * Two timed states, no scrolling: a dispersed starfield with a central
 * void, and a face-on spiral galaxy whose dominant outer arm reads as a
 * "6". All code and copy here is original; nothing is lifted from OpenAI's
 * site.
 *
 * Both states are prebuilt per particle (field / galaxy) so the vertex
 * shader only interpolates between the two buffers, driven by one eased
 * uniform clock (uForm) — not on scroll.
 */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** Deterministic seed for the shipped build. */
export const ASTRA6_SEED = 11;

/** Galaxy design radius (world units) every camera fit is based on. */
export const GALAXY_RADIUS = 2.6;

export type Rand = () => number;

/** mulberry32 — small deterministic PRNG so builds are reproducible. */
export function createRandom(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type AstraSixParticles = {
  /** state 1 — dispersed starfield with a central void */
  field: Float32Array;
  /** state 2 — the face-on "6" galaxy */
  galaxy: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
  sizes: Float32Array;
  brights: Float32Array;
  /** form stagger (radial: core first, arms wind outwards) */
  staggerF: Float32Array;
};

export type Astra6Ambient = {
  positions: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
  sizes: Float32Array;
  brights: Float32Array;
};

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

type Palette = { hex: string; weight: number }[];

function pickColor(palette: Palette, rand: Rand, out: Float32Array, i3: number) {
  let roll = rand();
  let chosen = palette[palette.length - 1];
  for (const entry of palette) {
    if (roll < entry.weight) {
      chosen = entry;
      break;
    }
    roll -= entry.weight;
  }
  const [r, g, b] = hexToRgb(chosen.hex);
  out[i3] = r;
  out[i3 + 1] = g;
  out[i3 + 2] = b;
}

/** Cheap bell-ish noise in [-1.5, 1.5]. */
function bell(rand: Rand) {
  return rand() + rand() + rand() - 1.5;
}

// ---------------------------------------------------------------- palettes

// Saturated star colors like a long-exposure galaxy photo: icy blues and
// red corals living together, with white for the hottest points.
const FIELD_PALETTE: Palette = [
  { hex: "#ffffff", weight: 0.22 },
  { hex: "#9cc4ff", weight: 0.24 },
  { hex: "#5d9bff", weight: 0.14 },
  { hex: "#ffb277", weight: 0.2 },
  { hex: "#ff8a52", weight: 0.13 },
  { hex: "#ff6f43", weight: 0.07 },
];

const CORE_PALETTE: Palette = [
  { hex: "#ffffff", weight: 0.8 },
  { hex: "#fff4e0", weight: 0.2 },
];

const ARM_PALETTE: Palette = [
  { hex: "#ffffff", weight: 0.15 },
  { hex: "#cfe4ff", weight: 0.19 },
  { hex: "#8fbcff", weight: 0.24 },
  { hex: "#5d9bff", weight: 0.14 },
  { hex: "#ffb277", weight: 0.13 },
  { hex: "#ff8a52", weight: 0.1 },
  { hex: "#ff6f43", weight: 0.05 },
];

const DUST_PALETTE: Palette = [
  { hex: "#8fa8d8", weight: 0.6 },
  { hex: "#c4d4f2", weight: 0.4 },
];

// ------------------------------------------------------------ state 1: field

/**
 * The opening starfield: a wide flattened shell with an empty void in the
 * middle of the frame — the stage the cluster will condense onto. The void
 * is enforced on the camera-facing plane (x/y), so nothing ever projects
 * into the center of the screen.
 */
function buildField(
  out: Float32Array,
  count: number,
  rand: Rand,
  colors: Float32Array,
): void {
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const rho = 2.2 + 4.7 * Math.pow(rand(), 0.55);
    const theta = rand() * TAU;

    out[i3] = Math.cos(theta) * rho;
    out[i3 + 1] = Math.sin(theta) * rho;
    out[i3 + 2] = (rand() * 2 - 1) * 2;

    pickColor(FIELD_PALETTE, rand, colors, i3);
  }
}

// ------------------------------------------------------------ state 2: galaxy

type Strand = {
  /** angle (radians) of the strand tip, its outermost end */
  tipTheta: number;
  /** winding from tip towards the core, radians, counter-clockwise */
  wind: number;
  /** radius at the tip / where the strand dies, world units */
  r1: number;
  r0: number;
  /** how the radius tapers: >1 stays fat and hooks in at the end */
  hook: number;
  /** bead count along the strand */
  beads: number;
  /** stroke half-width at the tip / at the end */
  w0: number;
  w1: number;
  phase: number;
};

// The "6": strand A is the dominant outer stroke — its tip sits at ~60°
// (1 o'clock) and it sweeps counter-clockwise ~272° over the top, down the
// left side and across the bottom, staying near full radius until the tail
// hooks inward. The right side stays open, which reads as the "6".
// Strands B/C are the tight inner arms wrapping the core.
const STRANDS: Strand[] = [
  {
    tipTheta: 60 * DEG,
    wind: 272 * DEG,
    r1: GALAXY_RADIUS,
    r0: 0.56 * GALAXY_RADIUS,
    hook: 3,
    beads: 13,
    w0: 0.04 * GALAXY_RADIUS,
    w1: 0.075 * GALAXY_RADIUS,
    phase: 0,
  },
  {
    tipTheta: 240 * DEG,
    wind: 540 * DEG,
    r1: 0.6 * GALAXY_RADIUS,
    r0: 0.045 * GALAXY_RADIUS,
    hook: 0.94,
    beads: 10,
    w0: 0.026 * GALAXY_RADIUS,
    w1: 0.05 * GALAXY_RADIUS,
    phase: 2.1,
  },
  {
    tipTheta: 120 * DEG,
    wind: 480 * DEG,
    r1: 0.48 * GALAXY_RADIUS,
    r0: 0.04 * GALAXY_RADIUS,
    hook: 0.94,
    beads: 9,
    w0: 0.024 * GALAXY_RADIUS,
    w1: 0.042 * GALAXY_RADIUS,
    phase: 4.2,
  },
];

function strandPoint(
  strand: Strand,
  u: number,
): { r: number; theta: number; w: number } {
  const r = strand.r1 - (strand.r1 - strand.r0) * Math.pow(u, strand.hook);
  const theta = strand.tipTheta + strand.wind * u;
  const w = strand.w0 + (strand.w1 - strand.w0) * u;
  return { r, theta, w };
}

/**
 * The face-on spiral. Roles: hot core (7%), three clumpy strands (66%),
 * inter-arm dust (15%), faint outer halo (12%). The bead look comes from
 * rejection-sampling along each strand with a periodic wave.
 */
function buildGalaxy(
  out: Float32Array,
  count: number,
  rand: Rand,
  colors: Float32Array,
  brights: Float32Array,
  staggerF: Float32Array,
): void {
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const roll = rand();
    let x: number;
    let y: number;
    let z: number;
    let bright = 0.45 + rand() * 0.55;
    let radius = 0;

    if (roll < 0.1) {
      // scorching core: dense enough to blaze under bloom
      x = bell(rand) * 0.15;
      y = bell(rand) * 0.15;
      z = bell(rand) * 0.09;
      radius = Math.hypot(x, y);
      bright = 1 + rand() * 0.5;
      pickColor(CORE_PALETTE, rand, colors, i3);
    } else if (roll < 0.76) {
      // one of the three strands, beads via rejection
      const pick = rand();
      const strand =
        pick < 0.5 ? STRANDS[0] : pick < 0.79 ? STRANDS[1] : STRANDS[2];
      let u = rand();
      let wave = 0.5 + 0.5 * Math.sin(u * strand.beads * TAU + strand.phase);
      for (let tries = 0; tries < 8; tries += 1) {
        if (rand() < 0.3 + 0.7 * wave * wave) break;
        u = rand();
        wave = 0.5 + 0.5 * Math.sin(u * strand.beads * TAU + strand.phase);
      }
      const point = strandPoint(strand, u);
      const jr = bell(rand) * point.w;
      const jt = (bell(rand) * point.w * 1.5) / Math.max(point.r, 0.12);
      const r = Math.max(0.02, point.r + jr);
      const theta = point.theta + jt;
      x = Math.cos(theta) * r;
      y = Math.sin(theta) * r;
      z = bell(rand) * 0.07;
      radius = r;
      bright *= 0.6 + 0.8 * wave * wave;
      pickColor(ARM_PALETTE, rand, colors, i3);
    } else if (roll < 0.88) {
      // inter-arm dust, dim — kept inside the outer arm's reach so the
      // open side of the "6" stays empty
      const r = GALAXY_RADIUS * (0.12 + 0.6 * Math.pow(rand(), 0.85));
      const theta = rand() * TAU;
      x = Math.cos(theta) * r;
      y = Math.sin(theta) * r;
      z = bell(rand) * 0.1;
      radius = r;
      bright *= 0.32;
      pickColor(DUST_PALETTE, rand, colors, i3);
    } else {
      // faint halo scatter
      const r = GALAXY_RADIUS * (0.35 + 0.39 * Math.pow(rand(), 1.2));
      const theta = rand() * TAU;
      x = Math.cos(theta) * r;
      y = Math.sin(theta) * r;
      z = bell(rand) * 0.16;
      radius = r;
      bright *= 0.4;
      pickColor(DUST_PALETTE, rand, colors, i3);
    }

    out[i3] = x;
    out[i3 + 1] = y;
    out[i3 + 2] = z;
    brights[i] = bright;
    // the core condenses first; the arms wind outwards after it
    staggerF[i] = Math.min(1, radius / GALAXY_RADIUS) * 0.55 + rand() * 0.2;
  }
}

// ------------------------------------------------------------- per-particle

/** Static look attributes shared by the two states. */
function buildLook(
  count: number,
  rand: Rand,
  galaxy: Float32Array,
  sizes: Float32Array,
  brights: Float32Array,
  seeds: Float32Array,
  colors: Float32Array,
): void {
  for (let i = 0; i < count; i += 1) {
    seeds[i] = rand();

    const i3 = i * 3;
    const coreDistance = Math.hypot(galaxy[i3], galaxy[i3 + 1]);
    const roll = rand();
    // three well-defined species: mostly small crisp stars, some medium
    // glows, and a few large bright points on the arm knots
    if (roll < 0.08) {
      sizes[i] = 0.042 + rand() * 0.028;
      brights[i] *= 0.9 + rand() * 0.45;
    } else if (roll < 0.3) {
      sizes[i] = 0.02 + rand() * 0.02;
      brights[i] *= 0.7 + rand() * 0.45;
    } else {
      sizes[i] = 0.008 + Math.pow(rand(), 2) * 0.016;
      brights[i] *= 0.66 + rand() * 0.5;
    }

    // core particles run hot and slightly larger so the center blazes
    if (coreDistance < 0.3) {
      sizes[i] = Math.max(sizes[i], 0.012 + rand() * 0.026);
      brights[i] = Math.max(brights[i], 0.9 + rand() * 0.5);
      pickColor(CORE_PALETTE, rand, colors, i3);
    }
  }
}

/** Build every state and look attribute for the whole swarm. */
export function buildAstraSixParticles(
  count: number,
  seed: number = ASTRA6_SEED,
): AstraSixParticles {
  const rand = createRandom(seed);
  const field = new Float32Array(count * 3);
  const galaxy = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const brights = new Float32Array(count);
  const staggerF = new Float32Array(count);

  buildField(field, count, rand, colors);
  buildGalaxy(galaxy, count, rand, colors, brights, staggerF);
  buildLook(count, rand, galaxy, sizes, brights, seeds, colors);

  return {
    field,
    galaxy,
    colors,
    seeds,
    sizes,
    brights,
    staggerF,
  };
}

/** Far static backdrop stars that never move between states. */
export function buildAstra6Ambient(
  count: number,
  seed: number = ASTRA6_SEED + 1,
): Astra6Ambient {
  const rand = createRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const brights = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    positions[i3] = (rand() * 2 - 1) * 10;
    positions[i3 + 1] = (rand() * 2 - 1) * 6.2;
    positions[i3 + 2] = (rand() * 2 - 1) * 3.5;
    pickColor(FIELD_PALETTE, rand, colors, i3);
    seeds[i] = rand();
    sizes[i] = 0.006 + Math.pow(rand(), 3) * 0.018;
    brights[i] = 0.14 + rand() * 0.42;
  }

  return { positions, colors, seeds, sizes, brights };
}
