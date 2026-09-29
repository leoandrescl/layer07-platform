import { describe, expect, it } from "vitest";
import {
  buildAstra6Ambient,
  buildAstraSixParticles,
  GALAXY_RADIUS,
} from "./astra6-shapes";

describe("astra6 shapes", () => {
  it("builds every state with count*3 finite positions and unit colors", () => {
    const count = 512;
    const p = buildAstraSixParticles(count, 3);
    for (const key of ["field", "galaxy", "colors"] as const) {
      expect(p[key]).toHaveLength(count * 3);
      for (let i = 0; i < p[key].length; i += 1) {
        expect(Number.isFinite(p[key][i])).toBe(true);
      }
    }
    for (let i = 0; i < count * 3; i += 1) {
      expect(p.colors[i]).toBeGreaterThanOrEqual(0);
      expect(p.colors[i]).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic for a given seed", () => {
    const a = buildAstraSixParticles(128, 5);
    const b = buildAstraSixParticles(128, 5);
    expect(Array.from(a.galaxy)).toEqual(Array.from(b.galaxy));
    expect(Array.from(a.field)).toEqual(Array.from(b.field));
    const c = buildAstraSixParticles(128, 6);
    expect(Array.from(c.galaxy)).not.toEqual(Array.from(a.galaxy));
  });

  it("opens the sequence on a starfield with a central void", () => {
    const count = 4000;
    const { field } = buildAstraSixParticles(count, 3);
    let minRadius = Infinity;
    let maxRadius = 0;
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const r = Math.hypot(field[i3], field[i3 + 1], field[i3 + 2]);
      minRadius = Math.min(minRadius, r);
      maxRadius = Math.max(maxRadius, r);
    }
    // the void the cluster will condense into
    expect(minRadius).toBeGreaterThanOrEqual(2.1);
    // the field still spans the whole frame
    expect(maxRadius).toBeGreaterThan(6.8);
  });

  it("keeps every star well defined: small, medium and large species", () => {
    const count = 12000;
    const { sizes, brights } = buildAstraSixParticles(count, 3);
    let large = 0;
    let medium = 0;
    for (let i = 0; i < count; i += 1) {
      expect(Number.isFinite(sizes[i])).toBe(true);
      expect(sizes[i]).toBeGreaterThan(0.005);
      // no oversized feathered discs: the largest stars stay compact
      expect(sizes[i]).toBeLessThan(0.08);
      expect(brights[i]).toBeGreaterThan(0);
      if (sizes[i] > 0.04) large += 1;
      if (sizes[i] > 0.019 && sizes[i] <= 0.04) medium += 1;
    }
    expect(medium).toBeGreaterThan(count * 0.12);
    expect(large).toBeGreaterThan(count * 0.03);
    expect(large).toBeLessThan(count * 0.15);
  });

  it("builds the galaxy with a hot core inside the stage budget", () => {
    const count = 8000;
    const { galaxy, brights } = buildAstraSixParticles(count, 3);
    let core = 0;
    let maxRadius = 0;
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const r = Math.hypot(galaxy[i3], galaxy[i3 + 1]);
      if (r < 0.3) core += 1;
      maxRadius = Math.max(maxRadius, r);
      expect(Number.isFinite(brights[i])).toBe(true);
    }
    expect(core).toBeGreaterThan(count * 0.02);
    expect(maxRadius).toBeLessThanOrEqual(GALAXY_RADIUS * 1.15);
  });

  it("reads as a 6: the outer arm avoids the right side", () => {
    const count = 12000;
    const { galaxy } = buildAstraSixParticles(count, 3);
    let outer = 0;
    let inGap = 0;
    let inStroke = 0;
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const x = galaxy[i3];
      const y = galaxy[i3 + 1];
      const r = Math.hypot(x, y);
      if (r <= GALAXY_RADIUS * 0.75) continue;
      outer += 1;
      // standard math angle in [0, 360)
      let deg = (Math.atan2(y, x) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      // the open side of the "6": right of the arm head, above the hook
      if (deg < 55 || deg > 340) inGap += 1;
      // the dominant stroke sweeps 60° → 330° counter-clockwise
      if (deg >= 60 && deg <= 330) inStroke += 1;
    }
    expect(outer).toBeGreaterThan(0);
    expect(inGap / outer).toBeLessThan(0.08);
    expect(inStroke / outer).toBeGreaterThan(0.78);
  });

  it("winds the form stagger from the core outwards", () => {
    const count = 3000;
    const { galaxy, staggerF } = buildAstraSixParticles(count, 3);
    let innerStagger = 0;
    let inner = 0;
    let outerStagger = 0;
    let outer = 0;
    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const r = Math.hypot(galaxy[i3], galaxy[i3 + 1]);
      if (r < GALAXY_RADIUS * 0.3) {
        innerStagger += staggerF[i];
        inner += 1;
      } else if (r > GALAXY_RADIUS * 0.8) {
        outerStagger += staggerF[i];
        outer += 1;
      }
    }
    // core particles must form strictly before the outer arm
    expect(innerStagger / inner).toBeLessThan(outerStagger / outer);
  });

  it("spreads the ambient backdrop across the frame, dimly", () => {
    const count = 2000;
    const a = buildAstra6Ambient(count, 9);
    expect(a.positions).toHaveLength(count * 3);
    let maxBright = 0;
    for (let i = 0; i < count; i += 1) {
      maxBright = Math.max(maxBright, a.brights[i]);
    }
    expect(maxBright).toBeLessThan(0.6);
  });
});
