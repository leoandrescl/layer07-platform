/** Galaxy look copied from the archived particles-galaxy (closest to Astra). */
export const GALAXY = {
  arms: 3,
  outerRadius: 3.8,
  coreRadius: 0.18,
  radialCurve: 2.3,
  twist: 3.15,
  /** slow spin (was -0.2): a full turn takes several minutes */
  spin: -0.04,
  flowSpeed: 0.06,
  thickness: 0.14,
  armWidth: 0.3,
  halo: 0.22,
} as const;

const SIZE_TIERS = [0.012, 0.02, 0.032, 0.05, 0.078, 0.12];
const TIER_WEIGHTS = [0.33, 0.26, 0.18, 0.13, 0.07, 0.03];

/** White / blue-white stars with amber and orange embers. */
const PALETTE = [
  { hex: "#ffffff", weight: 0.3 },
  { hex: "#eaf2ff", weight: 0.22 },
  { hex: "#bcd4ff", weight: 0.18 },
  { hex: "#8fb8ff", weight: 0.12 },
  { hex: "#ffd9a0", weight: 0.1 },
  { hex: "#ffb066", weight: 0.06 },
  { hex: "#ff7a6b", weight: 0.02 },
];

type ColorEntry = { r: number; g: number; b: number; cumulative: number };

function colorTable(palette: { hex: string; weight: number }[]): ColorEntry[] {
  const table: ColorEntry[] = [];
  let cumulative = 0;
  for (const entry of palette) {
    const hex = entry.hex.replace("#", "");
    table.push({
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      cumulative: (cumulative += entry.weight),
    });
  }
  return table;
}

const COLOR_TABLE = colorTable(PALETTE);

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

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function gaussian() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

function pickSize() {
  let r = Math.random();
  for (let t = 0; t < TIER_WEIGHTS.length; t += 1) {
    if (r < TIER_WEIGHTS[t]) {
      return Math.max(0.006, SIZE_TIERS[t] * rand(0.72, 1.28));
    }
    r -= TIER_WEIGHTS[t];
  }
  return SIZE_TIERS[SIZE_TIERS.length - 1];
}

export type GalaxyBuffers = {
  position: Float32Array;
  /** wide random position used for the "dispersed" intro */
  aScatter: Float32Array;
  aPhase: Float32Array;
  aSpeed: Float32Array;
  aArm: Float32Array;
  aSpread: Float32Array;
  aHeight: Float32Array;
  aSeed: Float32Array;
  aSize: Float32Array;
  aColor: Float32Array;
  aBright: Float32Array;
  /** lateral offset across the stroke of the 7 */
  aLateral: Float32Array;
  /** depth offset for the river */
  aZ: Float32Array;
};

export function buildGalaxySeven(count: number): GalaxyBuffers {
  const position = new Float32Array(count * 3);
  const aScatter = new Float32Array(count * 3);
  const aPhase = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aArm = new Float32Array(count);
  const aSpread = new Float32Array(count);
  const aHeight = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aSize = new Float32Array(count);
  const aColor = new Float32Array(count * 3);
  const aBright = new Float32Array(count);
  const aLateral = new Float32Array(count);
  const aZ = new Float32Array(count);

  const { arms, armWidth, halo } = GALAXY;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;

    // dispersed field across the whole viewport for the opening beat
    aScatter[i3] = rand(-9, 9);
    aScatter[i3 + 1] = rand(-5.5, 5.5);
    aScatter[i3 + 2] = rand(-4, 4);

    aPhase[i] = Math.random();
    aSpeed[i] = rand(0.65, 1.35);
    aSeed[i] = Math.random();

    const isHalo = Math.random() < halo;
    if (isHalo) {
      aArm[i] = -1;
      aSpread[i] = rand(-Math.PI, Math.PI);
      aHeight[i] = gaussian() * 1.4;
      aSize[i] = pickSize() * 0.7;
      aBright[i] = rand(0.12, 0.38);
    } else {
      aArm[i] = Math.floor(Math.random() * arms);
      aSpread[i] = gaussian() * armWidth;
      aHeight[i] = gaussian() * (Math.random() < 0.12 ? 1.8 : 1);
      aSize[i] = pickSize();
      aBright[i] = rand(0.5, 1.45) * (1 + (aSize[i] / SIZE_TIERS[5]) * 0.35);
    }

    // river: mostly a tight stroke, a few stray particles for a soft edge
    const stray = Math.random() < 0.15;
    aLateral[i] = gaussian() * (stray ? 0.34 : 0.11);
    aZ[i] = rand(-0.12, 0.12);

    pickColor(aColor, i3);
  }

  return {
    position,
    aScatter,
    aPhase,
    aSpeed,
    aArm,
    aSpread,
    aHeight,
    aSeed,
    aSize,
    aColor,
    aBright,
    aLateral,
    aZ,
  };
}

/** Sparse, faint background stars so the void still has depth. */
export type StarfieldBuffers = {
  position: Float32Array;
  aBase: Float32Array;
  aSize: Float32Array;
  aBright: Float32Array;
  aSeed: Float32Array;
  aSpeed: Float32Array;
  aColor: Float32Array;
};

export function buildStarfield(count: number): StarfieldBuffers {
  const position = new Float32Array(count * 3);
  const aBase = new Float32Array(count * 3);
  const aSize = new Float32Array(count);
  const aBright = new Float32Array(count);
  const aSeed = new Float32Array(count);
  const aSpeed = new Float32Array(count);
  const aColor = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    aBase[i3] = rand(-14, 14);
    aBase[i3 + 1] = rand(-9, 9);
    aBase[i3 + 2] = rand(-7, 7);

    aSize[i] = rand(0.006, 0.02) * (Math.random() < 0.1 ? 1.8 : 1);
    aBright[i] = rand(0.12, 0.5);
    aSeed[i] = Math.random();
    aSpeed[i] = rand(0.4, 1.6);

    pickColor(aColor, i3);
  }

  return { position, aBase, aSize, aBright, aSeed, aSpeed, aColor };
}
