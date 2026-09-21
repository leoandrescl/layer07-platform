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
 * Galaxy particles (log-spiral arms flowing inward) that settle onto the thin
 * "7". Each arm is continuously fed: as a particle locks onto the mark and
 * fades, a freshly recycled one spawns on the outer end of the arm.
 */
export const GALAXY_VERT = /* glsl */ `
  const float TAU = ${TAU};
  const float PI = 3.14159265359;

  attribute vec3 aTarget;
  attribute vec3 aTrail;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aArm;
  attribute float aSpread;
  attribute float aHeight;
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
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
  uniform float uMorph;
  uniform vec3 uCoreColor;

  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  void main() {
    float life = fract(aPhase + uTime * uFlowSpeed * aSpeed);

    // ---- galaxy path (uses the whole life, recycles at the core) ----
    float galaxyT = smoothstep(0.0, 1.0, life);
    float rf = 1.0 - galaxyT;
    float r = uCoreRadius + (uOuterRadius - uCoreRadius) * pow(rf, uRadialCurve);

    vec2 target = aTarget.xy;
    float thetaEnd = atan(target.y, target.x);
    float thetaStart;
    if (aArm >= 0.0) {
      thetaStart = aArm * (TAU / uArms) + aSpread * (0.35 + 0.65 * rf);
    } else {
      thetaStart = aSpread;
    }
    float dTheta = mod(thetaEnd - thetaStart + PI, TAU) - PI;
    float theta = thetaStart + dTheta * galaxyT
      + uTwist * log(max(r, 0.08) / uOuterRadius)
      + uSpin * uTime;

    float thickness = uThickness * (0.18 + 0.82 * rf);
    vec3 galaxyPos = vec3(cos(theta) * r, aHeight * thickness, sin(theta) * r);

    // ---- 7 path: fed from the left, settles and holds ----
    float travel = smoothstep(0.0, 0.45, life);
    vec3 sevenPath = aTarget + aTrail * (1.0 - travel);
    sevenPath.y += sin(uTime * 1.5 + aSeed * 6.2831) * 0.07 * (1.0 - travel);

    vec3 p = mix(galaxyPos, sevenPath, uMorph);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      max(aSize, 0.006) * uSizeScale * uFovScale / max(-mv.z, 0.001),
      1.0,
      76.0
    );

    float fade = smoothstep(0.0, 0.05, life) * (1.0 - smoothstep(0.94, 1.0, life));
    float coreMix = 1.0 - smoothstep(uCoreRadius, uOuterRadius * 0.45, r);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 30.0);

    vColor = mix(aColor, uCoreColor, coreMix * 0.75 * (1.0 - uMorph));
    vBright = aBright * uIntro * fade * twinkle;
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
