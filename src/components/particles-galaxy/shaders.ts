export const POINT_VERT = /* glsl */ `
const float TAU = 6.28318530718;

attribute float aPhase;
attribute float aSpeed;
attribute float aArm;
attribute float aSpread;
attribute float aHeight;
attribute vec3 aColor;
attribute float aSeed;
attribute float aSize;
attribute float aBright;

uniform float uTime;
uniform float uIntro;
uniform float uArms;
uniform float uCoreRadius;
uniform float uOuterRadius;
uniform float uTwist;
uniform float uRadialCurve;
uniform float uThickness;
uniform float uSpin;
uniform float uFlowSpeed;
uniform float uFovScale;
uniform float uSizeScale;
uniform vec3 uCoreColor;

varying vec3 vColor;
varying float vBright;
varying float vSeed;

void main() {
  // looping life 0..1: spawns at the outer tail, drifts to the core, recycles
  float life = fract(aPhase + uTime * uFlowSpeed * aSpeed);
  float rf = 1.0 - life; // 1 at the tail, 0 at the core

  float r = uCoreRadius + (uOuterRadius - uCoreRadius) * pow(rf, uRadialCurve);

  // The angle is a function of the radius, so as r shrinks the particle travels
  // inward *along* the log-spiral: the arm keeps its shape while its tail is
  // continuously fed by newly recycled matter.
  float theta;
  if (aArm >= 0.0) {
    theta = aArm * (TAU / uArms)
      + uTwist * log(max(r, 0.08) / uOuterRadius)
      + uSpin * uTime
      + aSpread * (0.35 + 0.65 * rf);
  } else {
    theta = uSpin * uTime * 0.6 + aSpread;
  }

  float discThickness = uThickness * (0.18 + 0.82 * rf);
  vec3 p = vec3(cos(theta) * r, aHeight * discThickness, sin(theta) * r);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = max(aSize, 0.006) * uSizeScale;
  gl_PointSize = clamp(size * uFovScale / max(-mv.z, 0.001), 1.0, 76.0);

  float fade = smoothstep(0.0, 0.06, life) * (1.0 - smoothstep(0.88, 1.0, life));
  float coreMix = 1.0 - smoothstep(uCoreRadius, uOuterRadius * 0.45, r);
  float twinkle = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 30.0);

  vColor = mix(aColor, uCoreColor, coreMix * 0.75);
  vBright = aBright * uIntro * fade * twinkle * (1.0 + coreMix * 1.8);
  vSeed = aSeed;
}
`;

export const POINT_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vBright;
varying float vSeed;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;

  float falloff = max(1.0 - d, 0.0);
  // sharp luminous nucleus + a soft halo: crisp stars, never fuzzy blobs
  float nucleus = pow(falloff, 9.0);
  float halo = pow(falloff, 2.2) * 0.24;
  float intensity = nucleus + halo;

  vec3 col = vColor * intensity * vBright;
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Anamorphic streak + vignette + grain in a single custom post effect. Sampling
 * the input buffer horizontally around bright pixels is what gives the scene its
 * cinematic lens-flare bloom.
 */
export function streakFragment(samples: number): string {
  const half = Math.max(1, Math.floor(samples / 2));
  return /* glsl */ `
uniform float uStrength;
uniform float uThreshold;
uniform float uTintR;
uniform float uTintG;
uniform float uTintB;
uniform float uVignette;
uniform float uGrain;

float luma(vec3 c) {
  return max(max(c.r, c.g), c.b);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec3 base = inputColor.rgb;
  vec3 tint = vec3(uTintR, uTintG, uTintB);

  // anamorphic streak: average the horizontal neighbourhood of bright pixels
  vec3 streak = vec3(0.0);
  float total = 0.0;
  for (int i = -${half}; i <= ${half}; i++) {
    float o = float(i) / float(${half});
    float w = pow(1.0 - abs(o), 2.0);
    vec2 suv = vec2(uv.x + o * 0.18, uv.y);
    float sl = luma(texture2D(inputBuffer, suv).rgb);
    streak += vec3(smoothstep(uThreshold, 1.0, sl)) * w;
    total += w;
  }
  streak /= max(total, 0.0001);

  float mask = smoothstep(uThreshold, 1.0, luma(base));
  base += streak * mask * tint * uStrength;

  // vignette
  vec2 q = uv - 0.5;
  base *= 1.0 - uVignette * dot(q, q) * 1.9;

  // film grain
  float n = fract(sin(dot(uv * vec2(1234.5, 7654.3) + time, vec2(12.9898, 78.233))) * 43758.5453);
  base += (n - 0.5) * uGrain;

  outputColor = vec4(base, inputColor.a);
}
`;
}
