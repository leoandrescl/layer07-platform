import { describe, expect, it } from "vitest";
import {
  buildFigure,
  FIGURE_COUNT,
  FIGURE_KEYS,
  ASTRA_SEED,
} from "./astra-shapes";

const RADIUS_BUDGET = 8.2; // the dispersed field figure is intentionally wide

describe("astra shapes", () => {
  it("exposes the four-figure catalogue", () => {
    expect(FIGURE_KEYS).toEqual(["galaxy", "field", "star", "glyph"]);
    expect(FIGURE_COUNT).toBe(4);
  });

  it("builds every figure with count*3 finite positions and unit colors", () => {
    for (const key of FIGURE_KEYS) {
      const count = 256;
      const { positions, colors } = buildFigure(key, count, ASTRA_SEED);

      expect(positions).toHaveLength(count * 3);
      expect(colors).toHaveLength(count * 3);

      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3;
        for (let c = 0; c < 3; c += 1) {
          expect(Number.isFinite(positions[i3 + c])).toBe(true);
          expect(Number.isFinite(colors[i3 + c])).toBe(true);
          expect(colors[i3 + c]).toBeGreaterThanOrEqual(0);
          expect(colors[i3 + c]).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("keeps the compact figures inside the stage budget", () => {
    for (const key of ["galaxy", "star", "glyph"] as const) {
      const { positions } = buildFigure(key, 512, ASTRA_SEED);
      for (let i = 0; i < 512; i += 1) {
        const i3 = i * 3;
        const radius = Math.hypot(
          positions[i3],
          positions[i3 + 1],
          positions[i3 + 2],
        );
        expect(radius).toBeLessThanOrEqual(RADIUS_BUDGET);
      }
    }
  });

  it("keeps the galaxy disk inside its design radius", () => {
    const { positions } = buildFigure("galaxy", 512, ASTRA_SEED);
    for (let i = 0; i < 512; i += 1) {
      const i3 = i * 3;
      const radius = Math.hypot(positions[i3], positions[i3 + 2]);
      expect(radius).toBeLessThanOrEqual(2.62);
    }
  });

  it("builds a star with a concentrated core and long vertical rays", () => {
    const { positions } = buildFigure("star", 1024, ASTRA_SEED);
    let core = 0;
    let verticalReach = 0;
    for (let i = 0; i < 1024; i += 1) {
      const i3 = i * 3;
      const r = Math.hypot(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      if (r < 0.5) core += 1;
      verticalReach = Math.max(verticalReach, Math.abs(positions[i3 + 1]));
    }
    expect(core).toBeGreaterThan(0);
    // the vertical ray is the longest limb of the flare
    expect(verticalReach).toBeGreaterThan(2);
  });

  it("renders both glyphs of the 07 mark", () => {
    const { positions } = buildFigure("glyph", 512, ASTRA_SEED);
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

  it("is deterministic for a given seed", () => {
    const a = buildFigure("field", 128, 11);
    const b = buildFigure("field", 128, 11);
    expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
    expect(Array.from(a.colors)).toEqual(Array.from(b.colors));
  });
});
