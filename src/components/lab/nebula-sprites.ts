import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Uniform,
} from "three";
import type { FieldTier } from "@/lib/webgl/capability";

/* ------------------------------------------------------------------ *
 * Background nebulae for the auto lab hero: soft procedural clouds
 * (domain-warped FBM) in blue and red tones, drifting very slowly.
 * They live at negative z behind the galaxy, render additively so the
 * existing bloom/ACES chain shapes them, and are intentionally scene-
 * level: drag-rotating the hero never moves its backdrop.
 * ------------------------------------------------------------------ */

const NEBULA_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAG = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uSeed;
  uniform float uSpin;
  uniform float uIntensity;
  uniform vec3 uTintA;
  uniform vec3 uTintB;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 4; i++) {
      v += amp * vnoise(p);
      p = p * 2.03 + vec2(17.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;

    // the cloud breathes: its noise domain spins and drifts slowly
    float ang = uSpin * uTime;
    float cs = cos(ang);
    float sn = sin(ang);
    vec2 q = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);
    q += uSeed * 13.17;

    // domain warp turns plain FBM into wispy nebula filaments
    vec2 w = vec2(fbm(q * 1.4 + 4.7), fbm(q * 1.4 - 2.3));
    float n = fbm(q * 1.9 + (w - 0.5) * 1.5);

    // elliptical falloff so the quad edges stay invisible
    float fall = 1.0 - smoothstep(0.1, 1.0, length(p));
    float density = smoothstep(0.28, 0.85, n) * fall;
    density = pow(density, 1.35);

    vec3 col = mix(uTintA, uTintB, smoothstep(0.1, 0.7, density));
    gl_FragColor = vec4(col, density * uIntensity);
  }
`;

type NebulaSpec = {
  /** world position of the sprite centre */
  pos: [number, number, number];
  /** world size of the quad */
  size: [number, number];
  intensity: number;
  /** radians/second of the noise-domain spin; sign flips the direction */
  spin: number;
  seed: number;
  tintA: string;
  tintB: string;
};

const SPECS: NebulaSpec[] = [
  {
    pos: [-3.4, 1.6, -5.0],
    size: [13, 9],
    intensity: 0.5,
    spin: 0.021,
    seed: 0.13,
    tintA: "#0f2f6b",
    tintB: "#8fc6ff",
  },
  {
    pos: [3.2, -1.8, -4.2],
    size: [11, 8],
    intensity: 0.44,
    spin: -0.017,
    seed: 0.61,
    tintA: "#7a1626",
    tintB: "#ff9e8f",
  },
  {
    pos: [3.4, 2.0, -6.8],
    size: [8, 6],
    intensity: 0.32,
    spin: 0.03,
    seed: 0.37,
    tintA: "#123a7a",
    tintB: "#7ec4ff",
  },
  {
    pos: [-3.0, -2.2, -7.5],
    size: [7, 5],
    intensity: 0.24,
    spin: -0.026,
    seed: 0.83,
    tintA: "#6b1030",
    tintB: "#ff7a6b",
  },
];

export type BackgroundNebulae = {
  group: Group;
  dispose: () => void;
};

export function createBackgroundNebulae(
  time: Uniform<number>,
  tier: FieldTier,
): BackgroundNebulae {
  const group = new Group();
  const geometry = new PlaneGeometry(1, 1);
  const materials: ShaderMaterial[] = [];
  // Low tier renders at a much lower dpr, but the FBM quads still cover big
  // screen areas — drop the faintest sprite there to keep fill-rate kind.
  const count = tier === 2 ? SPECS.length : SPECS.length - 1;

  for (const spec of SPECS.slice(0, count)) {
    const material = new ShaderMaterial({
      uniforms: {
        uTime: time,
        uSeed: new Uniform(spec.seed),
        uSpin: new Uniform(spec.spin),
        uIntensity: new Uniform(spec.intensity),
        uTintA: new Uniform(new Color(spec.tintA)),
        uTintB: new Uniform(new Color(spec.tintB)),
      },
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    materials.push(material);

    const mesh = new Mesh(geometry, material);
    mesh.position.set(...spec.pos);
    mesh.scale.set(spec.size[0], spec.size[1], 1);
    group.add(mesh);
  }

  return {
    group,
    dispose: () => {
      geometry.dispose();
      for (const material of materials) material.dispose();
    },
  };
};
