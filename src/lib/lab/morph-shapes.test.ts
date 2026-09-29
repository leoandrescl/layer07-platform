import { describe, expect, it } from "vitest";
import {
  buildFigure,
  createRand,
  FIGURE_COUNT,
  FIGURE_KEYS,
  MORPH_SEED,
} from "./morph-shapes";

const RADIUS_BUDGET = 3.1;

describe("morph shapes", () => {
  it("exposes the five-figure catalogue", () => {
    expect(FIGURE_KEYS).toEqual(["galaxy", "ring", "sphere", "helix", "glyph"]);
    expect(FIGURE_COUNT).toBe(5);
  });

  it("builds every figure with count*3 finite positions and unit colors", () => {
    for (const key of FIGURE_KEYS) {
      const count = 256;
      const { positions, colors } = buildFigure(key, count, MORPH_SEED);

      expect(positions).toHaveLength(count * 3);
      expect(colors).toHaveLength(count * 3);

      let maxRadius = 0;
      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        const p = [positions[i3], positions[i3 + 1], positions[i3 + 2]];
        for (const value of p) {
          expect(Number.isFinite(value)).toBe(true);
        }
        const radius = Math.hypot(p[0], p[1], p[2]);
        expect(radius).toBeGreaterThan(0);
        maxRadius = Math.max(maxRadius, radius);

        for (let c = 0; c < 3; c += 1) {
          const color = colors[i3 + c];
          expect(Number.isFinite(color)).toBe(true);
          expect(color).toBeGreaterThanOrEqual(0);
          expect(color).toBeLessThanOrEqual(1);
        }
      }
      // every figure fits the shared stage budget
      expect(maxRadius).toBeLessThanOrEqual(RADIUS_BUDGET);
    }
  });

  it("is deterministic for a given seed and sensitive to it", () => {
    const a = buildFigure("helix", 128, 11);
    const b = buildFigure("helix", 128, 11);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.colors)).toEqual(Array.from(b.colors));

    const c = buildFigure("helix", 128, 12);
    expect(Array.from(c.positions)).not.toEqual(Array.from(a.positions));
  });

  it("keeps the seeded PRNG in [0, 1)", () => {
    const rand = createRand(123);
    for (let i = 0; i < 1000; i += 1) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("renders both glyphs of the 07 mark", () => {
    const { positions } = buildFigure("glyph", 512, MORPH_SEED);
    let left = 0;
    let right = 0;
    for (let i = 0; i < 512; i += 1) {
      const x = positions[i * 3];
      if (x < -1) left += 1;
      if (x > 0.8) right += 1;
    }
    expect(left).toBeGreaterThan(0);
    expect(right).toBeGreaterThan(0);
  });

  it("keeps the helix inside its vertical budget", () => {
    const { positions } = buildFigure("helix", 256, MORPH_SEED);
    for (let i = 0; i < 256; i += 1) {
      const y = positions[i * 3 + 1];
      expect(Math.abs(y)).toBeLessThanOrEqual(2.3);
    }
  });

  it("keeps sphere particles at or under the shell radius", () => {
    const { positions } = buildFigure("sphere", 256, MORPH_SEED);
    for (let i = 0; i < 256; i += 1) {
      const i3 = i * 3;
      const radius = Math.hypot(
        positions[i3],
        positions[i3 + 1],
        positions[i3 + 2],
      );
      expect(radius).toBeLessThanOrEqual(2.45);
    }
  });
});
