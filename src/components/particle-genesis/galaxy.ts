import { CONFIG } from "./config";
import type { V3 } from "./math";
import { rand, randGauss } from "./math";

export type Zone = "core" | "arm" | "periphery" | "halo";

export interface GalaxyPoint {
  pos: V3;
  zone: Zone;
  orbitSpeed: number;
  armIndex: number;
  radius: number;
}

/**
 * Procedural spiral galaxy. Each particle gets a zone assignment and an
 * orbital position. Irregularity is introduced with gaussian jitter so the
 * structure never reads as a perfect mathematical spiral.
 */
export function generateGalaxy(count: number): GalaxyPoint[] {
  const g = CONFIG.galaxy;
  const points: GalaxyPoint[] = new Array(count);

  for (let i = 0; i < count; i += 1) {
    const zoneRoll = Math.random();
    let zone: Zone;
    if (zoneRoll < 0.16) zone = "core";
    else if (zoneRoll < 0.78) zone = "arm";
    else if (zoneRoll < 0.92) zone = "periphery";
    else zone = "halo";

    const armIndex = Math.floor(Math.random() * g.arms);
    const armBias = (armIndex / g.arms) * Math.PI * 2;

    let radius: number;
    let angle: number;
    let thickness: number;

    if (zone === "core") {
      radius = Math.pow(Math.random(), 1.6) * g.coreRadius;
      angle = Math.random() * Math.PI * 2;
      thickness = (Math.random() - 0.5) * g.thickness * 0.7;
    } else if (zone === "arm") {
      const t = Math.random();
      radius = g.coreRadius + Math.pow(t, 0.85) * (g.radius - g.coreRadius);
      angle = armBias + radius * g.twist;
      angle += randGauss() * (g.branchiness * (0.25 + radius / g.radius));
      thickness = randGauss() * g.thickness * (1 - radius / (g.radius * 1.4));
    } else if (zone === "periphery") {
      radius = g.radius * (0.82 + Math.random() * 0.28);
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 1.6;
    } else {
      radius = g.radius * (0.4 + Math.random() * 1.1);
      angle = Math.random() * Math.PI * 2;
      thickness = randGauss() * g.thickness * 3.2;
    }

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = thickness + randGauss() * (g.thickness * 0.2);

    const orbitSpeed =
      g.rotationSpeed *
      (1 - Math.min(1, radius / (g.radius * 1.2))) *
      rand(0.6, 1.6);

    points[i] = {
      pos: { x, y, z },
      zone,
      orbitSpeed,
      armIndex,
      radius,
    };
  }

  return points;
}