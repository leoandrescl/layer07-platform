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

/**
 * Procedural spiral galaxy. Produces a clear central nucleus and well-defined
 * spiral arms while keeping natural irregularity via gaussian jitter.
 */
export function generateGalaxy(count: number): GalaxyPoint[] {
  const g = CONFIG.galaxy;
  const points: GalaxyPoint[] = new Array(count);

  for (let i = 0; i < count; i += 1) {
    const zoneRoll = Math.random();
    let zone: Zone;
    if (zoneRoll < 0.24) zone = "core";
    else if (zoneRoll < 0.82) zone = "arm";
    else if (zoneRoll < 0.93) zone = "periphery";
    else zone = "halo";

    const armIndex = Math.floor(Math.random() * g.arms);
    const armBias = (armIndex / g.arms) * Math.PI * 2;

    let radius: number;
    let angle: number;
    let thickness: number;

    if (zone === "core") {
      radius = Math.pow(Math.random(), 1.5) * g.coreRadius;
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 0.55;
    } else if (zone === "arm") {
      const t = Math.random();
      radius = g.coreRadius + Math.pow(t, 0.92) * (g.radius - g.coreRadius);
      angle = armBias + radius * g.twist;
      angle += randGauss() * (g.branchiness * (0.22 + (radius / g.radius) * 0.55));
      thickness = randGauss() * g.thickness * (1 - radius / (g.radius * 1.35));
    } else if (zone === "periphery") {
      radius = g.radius * (0.8 + Math.random() * 0.3);
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 2.0;
    } else {
      radius = g.radius * (0.35 + Math.random() * 1.3);
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 4.0;
    }

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = thickness;

    // brightness falls off with radius; core glows
    const radial = Math.min(1, radius / g.radius);
    let brightness = clamp01(1 - radial * 0.55);
    if (zone === "core") brightness = clamp01(0.9 + Math.random() * 0.1);
    if (zone === "halo") brightness *= 0.45 + Math.random() * 0.35;

    // subtle tint: cool blue-violet in arms, warmer white near core
    const tint = clamp01(
      0.5 + randGauss() * 0.22 + (zone === "core" ? 0.2 : 0),
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

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}