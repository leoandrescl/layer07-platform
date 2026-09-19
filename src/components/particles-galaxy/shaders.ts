export const POINT_VERT = /* glsl */ `
attribute vec3 aStart;
attribute vec3 aDisc;
attribute vec3 aSpiral;
attribute vec3 aDir;
attribute vec3 aColor;
attribute float aSeed;
attribute float aSize;
attribute float aBright;

uniform float uTime;
uniform float uIntro;
uniform float uDisperse;
uniform float uMotion;
uniform float uFovScale;
uniform float uSizeScale;
uniform float uTwinkle;
uniform vec3 uWeights;

varying vec3 vColor;
varying float vBright;
varying float vSeed;

void main() {
  // morph between the three fibonacci targets
  vec3 p = position * uWeights.x + aDisc * uWeights.y + aSpiral * uWeights.z;

  float t = uTime;
  float s = aSeed * 6.2831853;

  // idle drift: each particle sways on its own tiny orbit so the field breathes
  p += sin(t * 0.55 + s) * aDir * 0.035 * uMotion;
  p += cos(t * 0.42 + s * 1.7) * vec3(aDir.z, aDir.x, aDir.y) * 0.028 * uMotion;

  // convergence from the scattered intro field
  p = mix(aStart, p, uIntro);

  // soft outward dispersion for the outro
  p += aDir * uDisperse * (0.4 + aSeed * 1.1);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = max(aSize, 0.006) * uSizeScale;
  gl_PointSize = clamp(size * uFovScale / max(-mv.z, 0.001), 1.0, 76.0);

  float twinkle = 0.72 + 0.28 * sin(t * uTwinkle + s * 30.0);
  vColor = aColor;
  vBright = aBright * mix(0.35, 1.0, uIntro) * mix(1.0, twinkle, uMotion);
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
