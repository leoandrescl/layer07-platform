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
  /** true for the sparse, large "giant stars" near the center */
  coreStar: boolean;
  /** spiral arm index (0 for core/halo) */
  armIndex: number;
  /** raw angular spread added perpendicular to the arm (divide by radius) */
  armSpread: number;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

/**
 * Procedural logarithmic-spiral galaxy, tuned so the arms read as a clear
 * Fibonacci-style whirl from above. Each arm follows r = r0 * e^(k*theta)
 * (log spiral) with a narrow gaussian band, so particles cluster along
 * well-separated curving arms rather than smearing into a blob.
 *
 * Galaxy lives in the XZ plane (y = thickness). Viewed from +Y the arms are
 * immediately legible and retain subtle 3D thickness.
 */
export function generateGalaxy(count: number): GalaxyPoint[] {
  const g = CONFIG.galaxy;
  const points: GalaxyPoint[] = new Array(count);

  // arm separation in radians
  const armStep = (Math.PI * 2) / g.arms;

  // how tightly the spiral winds: total turn angle over the radius span
  const totalTurn = g.twist; // radians of winding at the outer edge

  for (let i = 0; i < count; i += 1) {
    const zoneRoll = Math.random();
    let zone: Zone;
    let armIndex: number;
    let coreStar = false;

    if (zoneRoll < 0.01) {
      // a few scattered central stars, bigger than the rest — never a disc
      zone = "core";
      armIndex = 0;
      coreStar = true;
    } else if (zoneRoll < 0.72) {
      zone = "arm";
      armIndex = Math.floor(Math.random() * g.arms);
    } else if (zoneRoll < 0.92) {
      zone = "periphery";
      armIndex = Math.floor(Math.random() * g.arms);
    } else {
      zone = "halo";
      armIndex = 0;
    }

    let radius: number;
    let thickness: number;

    if (zone === "core") {
      // gaussian falloff around the center: dense middle, no hard rim, no
      // fixed-looking disc edge
      radius = Math.abs(randGauss()) * g.coreRadius * 0.55;
      thickness = randGauss() * g.thickness * 0.5;
    } else if (zone === "arm") {
      const t = Math.random();
      // bias toward mid arms so the whirl is dense along its length
      radius = g.coreRadius * 0.6 + Math.pow(t, 0.95) * (g.radius - g.coreRadius);
      thickness = randGauss() * g.thickness * (1 - radius / (g.radius * 1.3));
    } else if (zone === "periphery") {
      radius = g.radius * (0.82 + Math.random() * 0.22);
      thickness = randGauss() * g.thickness * 1.7;
    } else {
      radius = g.radius * (0.3 + Math.random() * 1.1);
      thickness = randGauss() * g.thickness * 3.5;
    }

    // logarithmic spiral angle = arm offset + winding * normalized radius
    const radialNorm = clamp01(radius / g.radius);
    const spiralAngle = radialNorm * totalTurn;

    let angle: number;
    let armSpread = 0;
    if (zone === "core") {
      angle = Math.random() * Math.PI * 2;
    } else if (zone === "arm" || zone === "periphery") {
      angle = armIndex * armStep + spiralAngle;
      // narrow gaussian spread perpendicular to the arm (keeps the arms crisp)
      armSpread = randGauss() * g.armWidth;
      angle += armSpread / Math.max(radius, 0.35);
    } else {
      angle = Math.random() * Math.PI * 2;
    }

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = thickness;

    const radial = clamp01(radius / g.radius);
    let brightness: number;
    if (zone === "core") brightness = 0.9;
    else if (zone === "arm") brightness = clamp01(0.68 - radial * 0.35) * (0.7 + Math.random() * 0.3);
    else if (zone === "periphery") brightness = clamp01(0.42 - radial * 0.18) * (0.5 + Math.random() * 0.4);
    else brightness = clamp01(0.24 - radial * 0.1) * (0.3 + Math.random() * 0.5);

    // tint: mostly cool blue/cyan/white like the reference, with sparse warm
    // amber accents. Core stars skew warm white.
    let tint: number;
    if (coreStar) {
      tint = 0.8 + Math.random() * 0.2; // warm white / orange core stars
    } else if (Math.random() < 0.16) {
      tint = 0.68 + Math.random() * 0.32; // amber accent stars
    } else {
      tint = Math.random() * 0.36; // cool blue -> cyan -> violet
    }

    points[i] = {
      pos: { x, y, z },
      zone,
      radius,
      brightness,
      tint,
      coreStar,
      armIndex,
      armSpread,
    };
  }

  return points;
}