import { SEVEN_PATH, ZERO } from "@/components/hero/glyphs";

/* ------------------------------------------------------------------ *
 * Volumetric nebula — CPU-side buffer builders.
 *
 * The dust lives in a clumped 3D ellipsoid (so it reads as volume, not a
 * flat field). Every particle also carries the data needed for the second
 * act: the river that condenses into the "07".
 * ------------------------------------------------------------------ */

const VOLUME = { x: 7.2, y: 4.4, z: 2.9 } as const;
const BLOBS = 14;
const BLOB_SIGMA = 1.35;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function gaussian() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

type ColorEntry = { r: number; g: number; b: number; cumulative: number };

const PALETTE = [
  { hex: "#6f86ff", weight: 0.2 },
  { hex: "#9a7bff", weight: 0.2 },
  { hex: "#4fd8ff", weight: 0.16 },
  { hex: "#bcd4ff", weight: 0.16 },
  { hex: "#ffd9a0", weight: 0.16 },
  { hex: "#ffb066", weight: 0.08 },
  { hex: "#ff8fb0", weight: 0.04 },
];

const COLOR_TABLE: ColorEntry[] = (() => {
  const table: ColorEntry[] = [];
  let cumulative = 0;
  for (const entry of PALETTE) {
    const hex = entry.hex.replace("#", "");
    table.push({
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      cumulative: (cumulative += entry.weight),
    });
  }
  return table;
})();

function pickColor(out: Float32Array, i3: number) {
  const r = Math.random();
  let entry = COLOR_TABLE[COLOR_TABLE.length - 1];
  for (let i = 0; i < COLOR_TABLE.length; i += 1) {
    if (r <= COLOR_TABLE[i].cumulative) {
      entry = COLOR_TABLE[i];
      break;
    }
  }
  out[i3] = entry.r;
  out[i3 + 1] = entry.g;
  out[i3 + 2] = entry.b;
}

const SIZE_TIERS = [0.012, 0.022, 0.038, 0.062, 0.1, 0.16];
const TIER_WEIGHTS = [0.3, 0.26, 0.2, 0.14, 0.07, 0.03];

function pickSize() {
  let r = Math.random();
  for (let t = 0; t < TIER_WEIGHTS.length; t += 1) {
    if (r < TIER_WEIGHTS[t]) {
      return Math.max(0.008, SIZE_TIERS[t] * rand(0.7, 1.3));
    }
    r -= TIER_WEIGHTS[t];
  }
  return SIZE_TIERS[SIZE_TIERS.length - 1];
}

export type NebulaBuffers = {
  position: Float32Array;
  aSeed: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aPhase: Float32Array;
  aSpeed: Float32Array;
  aLateral: Float32Array;
  aZ: Float32Array;
  aGlyph: Float32Array;
  aColor: Float32Array;
};

/** Clumped ellipsoid of dust: rejection-sampled against a sum of gaussians. */
export function buildNebulaDust(count: number): NebulaBuffers {
  const position = new Float32Array(count * 3);
  const aSeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aLateral = new Float32Array(count);
  const aZ = new Float32Array(count);
  const aGlyph = new Float32Array(count);
  const aColor = new Float32Array(count * 3);

  const blobs = Array.from({ length: BLOBS }, () => ({
    x: gaussian() * VOLUME.x * 0.42,
    y: gaussian() * VOLUME.y * 0.42,
    z: gaussian() * VOLUME.z * 0.42,
    w: rand(0.6, 1.5),
  }));

  const density = (x: number, y: number, z: number) => {
    let d = 0.16;
    for (const b of blobs) {
      const dx = x - b.x;
      const dy = y - b.y;
      const dz = z - b.z;
      d += b.w * Math.exp(-(dx * dx + dy * dy + dz * dz) / (2 * BLOB_SIGMA * BLOB_SIGMA));
    }
    return d;
  };

  let i = 0;
  let guard = 0;
  while (i < count && guard < count * 40) {
    guard += 1;
    const x = rand(-VOLUME.x, VOLUME.x);
    const y = rand(-VOLUME.y, VOLUME.y);
    const z = rand(-VOLUME.z, VOLUME.z);

    const ell = (x / VOLUME.x) ** 2 + (y / VOLUME.y) ** 2 + (z / VOLUME.z) ** 2;
    if (ell > 1) continue;
    if (Math.random() > density(x, y, z) / 1.9) continue;

    const i3 = i * 3;
    position[i3] = x;
    position[i3 + 1] = y;
    position[i3 + 2] = z;

    aSeed[i] = Math.random();
    aPhase[i] = Math.random();
    aSpeed[i] = rand(0.5, 1.5);
    aSize[i] = pickSize();
    aBright[i] = rand(0.25, 0.95) * (1 + (aSize[i] / SIZE_TIERS[5]) * 0.4);

    // river cross-section: mostly tight, a few strays for a soft edge
    const stray = Math.random() < 0.16;
    aLateral[i] = gaussian() * (stray ? 0.36 : 0.12);
    aZ[i] = rand(-0.12, 0.12);
    aGlyph[i] = Math.random() < 0.58 ? 0 : 1;

    pickColor(aColor, i3);
    i += 1;
  }

  // if rejection undershot (rare), fill the remainder deterministically
  while (i < count) {
    const i3 = i * 3;
    position[i3] = gaussian() * VOLUME.x * 0.3;
    position[i3 + 1] = gaussian() * VOLUME.y * 0.3;
    position[i3 + 2] = gaussian() * VOLUME.z * 0.3;
    aSeed[i] = Math.random();
    aPhase[i] = Math.random();
    aSpeed[i] = rand(0.5, 1.5);
    aSize[i] = pickSize();
    aBright[i] = rand(0.25, 0.95);
    aLateral[i] = gaussian() * 0.12;
    aZ[i] = rand(-0.12, 0.12);
    aGlyph[i] = Math.random() < 0.58 ? 0 : 1;
    pickColor(aColor, i3);
    i += 1;
  }

  return {
    position,
    aSeed,
    aSize,
    aBright,
    aPhase,
    aSpeed,
    aLateral,
    aZ,
    aGlyph,
    aColor,
  };
}

/* ------------------------------------------------------------------ *
 * Junction nodes — bright stars at the unions of the "07". They start
 * scattered in the nebula volume and settle onto the path.
 * ------------------------------------------------------------------ */

function quad(p0: number[], c: number[], p1: number[], u: number) {
  const v = 1 - u;
  return [
    v * v * p0[0] + 2 * v * u * c[0] + u * u * p1[0],
    v * v * p0[1] + 2 * v * u * c[1] + u * u * p1[1],
  ];
}

export type NodeBuffers = {
  position: Float32Array;
  aScatter: Float32Array;
  aSeed: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aOrder: Float32Array;
};

export function buildNodes(): NodeBuffers {
  const pts: { x: number; y: number; order: number }[] = [];

  const { p0, c1, p1, c2, p2 } = SEVEN_PATH;
  const a = [p2.x, p2.y];
  const b = [c2.x, c2.y];
  const c = [p1.x, p1.y];
  const d = [c1.x, c1.y];
  const e = [p0.x, p0.y];

  const leg = [0, 0.25, 0.5, 0.75, 1];
  leg.forEach((u) => {
    const [x, y] = quad(a, b, c, u);
    pts.push({ x, y, order: u * 0.5 });
  });
  const bar = [0.25, 0.5, 0.75, 1];
  bar.forEach((u) => {
    const [x, y] = quad(c, d, e, u);
    pts.push({ x, y, order: 0.5 + u * 0.5 });
  });

  const RING = 10;
  for (let k = 0; k < RING; k += 1) {
    const ang = (k / RING) * Math.PI * 2;
    pts.push({
      x: ZERO.center.x + Math.cos(ang) * ZERO.rx,
      y: ZERO.center.y + Math.sin(ang) * ZERO.ry,
      order: k / RING,
    });
  }

  const count = pts.length;
  const position = new Float32Array(count * 3);
  const aScatter = new Float32Array(count * 3);
  const aSeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aOrder = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    position[i3] = pts[i].x;
    position[i3 + 1] = pts[i].y;
    position[i3 + 2] = rand(-0.05, 0.05);

    aScatter[i3] = gaussian() * VOLUME.x * 0.42;
    aScatter[i3 + 1] = gaussian() * VOLUME.y * 0.42;
    aScatter[i3 + 2] = gaussian() * VOLUME.z * 0.42;

    aSeed[i] = Math.random();
    aSize[i] = rand(0.09, 0.2);
    aBright[i] = rand(0.9, 1.6);
    aOrder[i] = pts[i].order;
  }

  return { position, aScatter, aSeed, aSize, aBright, aOrder };
}
