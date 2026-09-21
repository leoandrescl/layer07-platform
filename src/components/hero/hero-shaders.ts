export const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;

    float falloff = max(1.0 - d, 0.0);
    float nucleus = pow(falloff, 9.0);
    float halo = pow(falloff, 2.2) * 0.26;

    vec3 col = vColor * (nucleus + halo) * vBright;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const L07_VERT = /* glsl */ `
  attribute vec3 aTarget;
  attribute vec3 aScatter;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uIntro;
  uniform float uFlow;
  uniform float uTurb;
  uniform float uShimmer;
  uniform float uFovScale;
  uniform float uPointerStrength;
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vBright;

  void main() {
    // Looping life: spawns far out, flies in, settles on the letter and holds.
    float life = fract(aPhase + uTime * uFlow * aSpeed);
    float settled = smoothstep(0.0, 0.22, life);
    float unsettled = 1.0 - settled;

    vec3 p = mix(aScatter, aTarget, settled);

    p += vec3(
      sin(uTime * 0.7 + aSeed * 6.2831 + p.y * 1.5),
      cos(uTime * 0.6 + aSeed * 6.2831 + p.x * 1.5),
      sin(uTime * 0.5 + aSeed * 6.2831 + p.x * 1.2)
    ) * uTurb * unsettled;

    p += vec3(
      sin(uTime * 1.4 + aSeed * 9.0),
      cos(uTime * 1.2 + aSeed * 7.0),
      sin(uTime * 1.0 + aSeed * 5.0)
    ) * uShimmer * settled;

    vec4 world = modelMatrix * vec4(p, 1.0);

    vec2 toPointer = world.xy - uPointer;
    float dist = length(toPointer) + 0.0001;
    float force = exp(-dist * dist * 0.6) * uPointerStrength;
    world.xy += (toPointer / dist) * force;
    world.z += force * 0.5;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uFovScale / max(-mv.z, 0.001), 1.0, 64.0);

    float alpha = smoothstep(0.0, 0.06, life) * (1.0 - smoothstep(0.92, 1.0, life));
    float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + aSeed * 40.0);

    vColor = aColor;
    vBright = aBright * alpha * twinkle * uIntro;
  }
`;

export const AMBIENT_VERT = /* glsl */ `
  attribute vec3 aBase;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uIntro;
  uniform float uFlow;
  uniform float uFovScale;
  uniform float uPointerStrength;
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec3 p = aBase;
    p.x += sin(uTime * 0.10 * uFlow * aSpeed + aSeed * 6.2831) * 1.9;
    p.y += cos(uTime * 0.085 * uFlow * aSpeed + aSeed * 6.2831) * 1.2;
    p.z += sin(uTime * 0.06 * uFlow * aSpeed + aSeed * 6.2831) * 0.9;

    vec4 world = modelMatrix * vec4(p, 1.0);

    vec2 toPointer = world.xy - uPointer;
    float dist = length(toPointer) + 0.0001;
    float force = exp(-dist * dist * 0.4) * uPointerStrength * 0.6;
    world.xy += (toPointer / dist) * force;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uFovScale / max(-mv.z, 0.001), 1.0, 42.0);

    vColor = aColor;
    vBright = aBright * uIntro * (0.7 + 0.3 * sin(uTime * 1.5 + aSeed * 30.0));
  }
`;

/** Anamorphic streak + vignette + grain, as a single custom post effect. */
export function streakFragment(samples: number): string {
  const half = Math.max(1, Math.floor(samples / 2));
  return /* glsl */ `
    uniform float uStrength;
    uniform float uThreshold;
    uniform vec3 uTint;
    uniform float uVignette;
    uniform float uGrain;

    float luma(vec3 c) {
      return max(max(c.r, c.g), c.b);
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec3 base = inputColor.rgb;

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
      base += streak * mask * uTint * uStrength;

      vec2 q = uv - 0.5;
      base *= 1.0 - uVignette * dot(q, q) * 1.9;

      float n = fract(sin(dot(uv * vec2(1234.5, 7654.3) + time, vec2(12.9898, 78.233))) * 43758.5453);
      base += (n - 0.5) * uGrain;

      outputColor = vec4(base, inputColor.a);
    }
  `;
}
