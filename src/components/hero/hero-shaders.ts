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

const TAU = "6.28318530718";

/**
 * uMorph = 0 -> Astra-style spiral galaxy.
 * uMorph = 1 -> the "7" as a river: particles enter at the bottom of the leg,
 * travel up it, turn at the top-right corner and flow left along the bar,
 * exiting at the left end. The loop never stops.
 */
export const GALAXY_VERT = /* glsl */ `
  const float TAU = ${TAU};

  attribute float aPhase;
  attribute float aSpeed;
  attribute float aArm;
  attribute float aSpread;
  attribute float aHeight;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aLateral;
  attribute float aZ;
  attribute vec3 aColor;
  attribute vec3 aScatter;

  uniform float uTime;
  uniform float uIntro;
  uniform float uForm;
  uniform float uMorph;
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
  uniform vec2 uP0;
  uniform vec2 uC1;
  uniform vec2 uP1;
  uniform vec2 uC2;
  uniform vec2 uP2;

  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  vec2 quadBezier(vec2 p0, vec2 c, vec2 p1, float u) {
    float v = 1.0 - u;
    return v * v * p0 + 2.0 * v * u * c + u * u * p1;
  }

  vec2 quadTangent(vec2 p0, vec2 c, vec2 p1, float u) {
    return 2.0 * (1.0 - u) * (c - p0) + 2.0 * u * (p1 - c);
  }

  void main() {
    float t = fract(aPhase + uTime * uFlowSpeed * aSpeed);

    // ---- galaxy ----
    float rf = 1.0 - t;
    float r = uCoreRadius + (uOuterRadius - uCoreRadius) * pow(rf, uRadialCurve);

    float thetaStart;
    if (aArm >= 0.0) {
      thetaStart = aArm * (TAU / uArms) + aSpread * (0.35 + 0.65 * rf);
    } else {
      thetaStart = aSpread;
    }
    float theta = thetaStart
      + uTwist * log(max(r, 0.08) / uOuterRadius)
      + uSpin * uTime;
    float thickness = uThickness * (0.18 + 0.82 * rf);
    vec3 galaxyPos = vec3(cos(theta) * r, aHeight * thickness, sin(theta) * r);

    // ---- river along the brush 7 ----
    vec2 center;
    vec2 segDir;
    float taper;
    if (t < 0.5) {
      float u = t * 2.0;
      center = quadBezier(uP0, uC1, uP1, u);
      segDir = normalize(quadTangent(uP0, uC1, uP1, u));
      taper = mix(0.42, 1.0, smoothstep(0.0, 1.0, u));
    } else {
      float u = (t - 0.5) * 2.0;
      center = quadBezier(uP1, uC2, uP2, u);
      segDir = normalize(quadTangent(uP1, uC2, uP2, u));
      taper = mix(1.0, 0.06, smoothstep(0.0, 1.0, u));
    }

    vec2 perp = vec2(-segDir.y, segDir.x);
    vec2 riverXY = center + perp * aLateral * taper;
    riverXY.x += sin(uTime * 1.3 + aSeed * 6.2831) * 0.03;
    riverXY.y += cos(uTime * 1.1 + aSeed * 6.2831) * 0.03;
    vec3 riverPos = vec3(riverXY, aZ);

    // dispersed field -> galaxy -> 7
    vec3 p = mix(aScatter, galaxyPos, uForm);
    p = mix(p, riverPos, uMorph);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      max(aSize, 0.006) * uSizeScale * uFovScale / max(-mv.z, 0.001),
      1.0,
      76.0
    );

    float galaxyFade = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.94, 1.0, t));
    float riverFade = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.9, 1.0, t));
    float baseFade = mix(galaxyFade, riverFade, uMorph);
    // while dispersed, every particle is visible
    float fade = mix(1.0, baseFade, uForm);

    float coreMix = 1.0 - smoothstep(uCoreRadius, uOuterRadius * 0.45, r);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 30.0);
    // travelling brightness wave so the flow along the 7 reads clearly
    float wave = 0.8 + 0.4 * sin(t * 9.0 - uTime * 2.2);

    vColor = mix(aColor, uCoreColor, coreMix * 0.75 * (1.0 - uMorph));
    vBright = aBright * uIntro * fade * twinkle * mix(1.0, wave, uMorph);
    vSeed = aSeed;
  }
`;

/** Ambient starfield: sparse, mostly static, subtle twinkle. */
export const STARFIELD_VERT = /* glsl */ `
  attribute vec3 aBase;
  attribute float aSize;
  attribute float aBright;
  attribute float aSeed;
  attribute float aSpeed;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uReveal;
  uniform float uFovScale;

  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  void main() {
    vec3 p = aBase;
    p.x += sin(uTime * 0.02 * aSpeed + aSeed * 6.2831) * 0.5;
    p.y += cos(uTime * 0.017 * aSpeed + aSeed * 6.2831) * 0.35;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uFovScale / max(-mv.z, 0.001), 1.0, 26.0);

    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSpeed) + aSeed * 50.0);

    vColor = aColor;
    vBright = aBright * twinkle * uReveal;
    vSeed = aSeed;
  }
`;

/** Anamorphic streak + vignette + grain in a single custom post effect. */
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

      vec2 q = uv - 0.5;
      base *= 1.0 - uVignette * dot(q, q) * 1.9;

      float n = fract(sin(dot(uv * vec2(1234.5, 7654.3) + time, vec2(12.9898, 78.233))) * 43758.5453);
      base += (n - 0.5) * uGrain;

      outputColor = vec4(base, inputColor.a);
    }
  `;
}
