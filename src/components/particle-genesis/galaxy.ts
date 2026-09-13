import { CONFIG } from "./config";
import type { V3 } from "./math";
import { randGauss } from "./math";

export type Zone = "core" | "arm" | "periphery" | "halo";

export interface GalaxyPoint {
  pos: V3;
  zone: Zone;
  radius: number;
  /** 0..1 brightness factor (core = 1, halo = dim) */
  brightness: number;
  /** 0..1 color tint index (0 = cool blue, 1 = warm white/violet) */
  tint: number;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Procedural logarithmic-spiral galaxy. Arms follow `angle = a + b*log(r)`
 * so they read as a curving whirl from above, with gaussian jitter and
 * zone-based density so the structure stays organic rather than geometric.
 *
 * Galaxy lives in the XZ plane (y = thickness). Viewed from +Y (top-down)
 * the arms are immediately legible.
 */
export function generateGalaxy(count: number): GalaxyPoint[] {
  const g = CONFIG.galaxy;
  const points: GalaxyPoint[] = new Array(count);

  // how much the arms wind: angle offset per unit of log-radius
  const wind = g.twist;

  for (let i = 0; i < count; i += 1) {
    const zoneRoll = Math.random();
    let zone: Zone;
    if (zoneRoll < 0.26) zone = "core";
    else if (zoneRoll < 0.82) zone = "arm";
    else if (zoneRoll < 0.94) zone = "periphery";
    else zone = "halo";

    const armIndex = Math.floor(Math.random() * g.arms);
    const armBias = (armIndex / g.arms) * Math.PI * 2;

    let radius: number;
    let angle: number;
    let thickness: number;

    if (zone === "core") {
      radius = Math.pow(Math.random(), 1.4) * g.coreRadius;
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 0.5;
    } else if (zone === "arm") {
      // distribution biased toward mid/outer arms
      const t = Math.pow(Math.random(), 0.85);
      radius = g.coreRadius * 1.1 + t * (g.radius - g.coreRadius);
      // logarithmic spiral: angle grows with log of radius
      angle = armBias + wind * Math.log(1 + radius / g.radius * 3.2);
      // gaussian spread perpendicular to the arm -> natural width
      const spread = randGauss() * g.armWidth * (0.6 + (radius / g.radius) * 0.9);
      angle += spread / Math.max(radius, 0.4);
      thickness = randGauss() * g.thickness * (1.1 - radius / (g.radius * 1.4));
    } else if (zone === "periphery") {
      radius = g.radius * (0.78 + Math.random() * 0.34);
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 1.8;
    } else {
      radius = g.radius * (0.35 + Math.random() * 1.2);
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 3.2;
    }

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = thickness;

    // brightness: strong core, arm glow, faint periphery/halo
    const radial = clamp01(radius / g.radius);
    let brightness: number;
    if (zone === "core") brightness = clamp01(0.85 + Math.random() * 0.15);
    else if (zone === "arm") brightness = clamp01(0.8 - radial * 0.45) * (0.85 + Math.random() * 0.15);
    else if (zone === "periphery") brightness = clamp01(0.55 - radial * 0.2) * (0.6 + Math.random() * 0.4);
    else brightness = clamp01(0.3 - radial * 0.15) * (0.4 + Math.random() * 0.5);

    // tint drives the shader palette: low = blue/cyan (outer arms),
    // high = warm white (core). Spread across the full range for richness.
    const tint = clamp01(
      0.12 + radial * 0.85 + randGauss() * 0.14 + (zone === "core" ? 0.1 : 0),
    );

    points[i] = {
      pos: { x, y, z },
      zone,
      radius,
      brightness,
      tint,
    };
  }

  return points;
}