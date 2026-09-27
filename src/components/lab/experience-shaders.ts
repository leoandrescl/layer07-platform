const TAU = "6.28318530718";
const PI = "3.141592653589793";

/* ------------------------------------------------------------------ *
 * L07 experience — the coil auto hero plus two scene actions driven
 * by the hero verb buttons:
 *   uEnter  — ENTER: the mark splits into depth layers that fly past
 *             the camera while it pushes in.
 *   uOrbit  — EXPLORE: whatever is on stage disperses into a slow
 *             orbital cloud the labels float over.
 * BUILD reuses uMorph (forced to 1 on a faster clock) — the mark
 * "constructs itself" with the same staggered particle logic.
 * ------------------------------------------------------------------ */

export const COIL_EXPERIENCE_VERT = /* glsl */ `
  const float TAU = ${TAU};
  const float PI = ${PI};

  attribute float aPhase;
  attribute float aSpeed;
  attribute float aArm;
  attribute float aSpread;
  attribute float aHeight;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aZ;
  attribute float aGlyph;
  attribute vec3 aColor;
  attribute vec3 aScatter;

  uniform float uTime;
  uniform float uIntro;
  uniform float uForm;
  uniform float uMorph;
  uniform float uEnter;
  uniform float uOrbit;
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
  uniform float uCoilRadius;
  uniform float uCoilTurns;
  uniform float uCoilSpin;
  uniform float uCoilDepth;
  uniform vec3 uCoreColor;
  uniform vec2 uP0;
  uniform vec2 uC1;
  uniform vec2 uP1;
  uniform vec2 uC2;
  uniform vec2 uP2;
  uniform vec2 uZeroCenter;
  uniform vec2 uZeroR;

  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  vec2 rot2(vec2 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
  }

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

    // ---- centerline of the brush mark ----
    vec2 center;
    vec2 segDir;
    float taper;
    float riverFade;

    if (aGlyph < 0.5) {
      float ang = t * TAU;
      center = uZeroCenter + vec2(cos(ang) * uZeroR.x, sin(ang) * uZeroR.y);
      segDir = normalize(vec2(-sin(ang) * uZeroR.x, cos(ang) * uZeroR.y));
      taper = 0.82 + 0.16 * cos(ang);
      riverFade = 1.0;
    } else {
      if (t < 0.5) {
        float u = t * 2.0;
        center = quadBezier(uP2, uC2, uP1, u);
        segDir = normalize(quadTangent(uP2, uC2, uP1, u));
        taper = mix(0.06, 1.0, smoothstep(0.0, 1.0, u));
      } else {
        float u = (t - 0.5) * 2.0;
        center = quadBezier(uP1, uC1, uP0, u);
        segDir = normalize(quadTangent(uP1, uC1, uP0, u));
        taper = mix(1.0, 0.42, smoothstep(0.0, 1.0, u));
      }
      riverFade = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.9, 1.0, t));
    }

    // ---- coil wrapped around the centerline ----
    float rad = uCoilRadius * taper;
    float hashLoose = fract(aSeed * 13.7);
    float loose = step(0.78, hashLoose);
    rad *= mix(1.0, 0.2 + hashLoose * 0.7, loose);
    rad *= 0.96 + 0.08 * fract(aSeed * 51.3);

    float coil = fract(aSeed * 7.13 + 0.37);
    float phase = coil * TAU + t * uCoilTurns * TAU + uTime * uCoilSpin;
    vec2 perp = vec2(-segDir.y, segDir.x);
    vec2 riverXY = center + perp * (rad * cos(phase));
    riverXY.x += sin(uTime * 1.3 + aSeed * 6.2831) * 0.03;
    riverXY.y += cos(uTime * 1.1 + aSeed * 6.2831) * 0.03;
    vec3 riverPos = vec3(riverXY, aZ + rad * sin(phase) * uCoilDepth);

    // ---- staggered transit between galaxy and mark ----
    float stagger = clamp(t * 0.5 + fract(aSeed * 3.71) * 0.18, 0.0, 0.6);
    float lr = clamp((uMorph - 0.18 - stagger) / 0.22, 0.0, 1.0);
    float backM = 1.0 - lr;
    float backC = 1.3;
    float l = 1.0 - (backC + 1.0) * backM * backM * backM + backC * backM * backM;

    vec3 p = mix(aScatter, galaxyPos, uForm);
    p = mix(p, riverPos, l);

    // mid-flight choreography: vertical arc, corkscrew around the axis
    float arc = sin(lr * PI);
    p.y += arc * (fract(aSeed * 7.77) - 0.5) * 1.7;
    p.xz = rot2(p.xz, arc * (fract(aSeed * 5.31) - 0.5) * 2.2);

    // ---- hero actions ----
    // ENTER: depth separation — particles fly toward/past the camera on a
    // seeded depth lane with a mild lateral drift from the scatter field.
    // EXPLORE: the stage disperses into an orbital cloud (swirl + expansion,
    // per-particle jitter so it reads as matter, not a rigid shell).
    if (uEnter > 0.0) {
      p.z += uEnter * ((fract(aSeed * 7.31) - 0.35) * 7.0);
      p.xy += uEnter * aScatter.xy * 0.12;
    }
    if (uOrbit > 0.0) {
      p.xz = rot2(p.xz, uOrbit * (0.9 + fract(aSeed * 3.77) * 1.6));
      p.xz *= 1.0 + uOrbit * (0.55 + fract(aSeed * 5.13) * 0.9);
      p.y += uOrbit * (fract(aSeed * 9.13) - 0.5) * 1.8;
    }

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      max(aSize, 0.006) * uSizeScale * uFovScale / max(-mv.z, 0.001),
      1.0,
      80.0
    );

    float galaxyFade = smoothstep(0.0, 0.05, t) * (1.0 - smoothstep(0.94, 1.0, t));
    float baseFade = mix(galaxyFade, riverFade, uMorph);
    float fade = mix(1.0, baseFade, uForm);

    float coreMix = 1.0 - smoothstep(uCoreRadius, uOuterRadius * 0.45, r);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 30.0);
    float wave = 0.8 + 0.4 * sin(t * 9.0 - uTime * 2.2);

    vColor = mix(aColor, uCoreColor, coreMix * 0.75 * (1.0 - uMorph));
    vBright = aBright * uIntro * fade * twinkle * mix(1.0, wave, uMorph);

    // particles flare white-warm while in transit or during the actions
    float glow = arc * (0.5 + 0.5 * fract(aSeed * 9.71));
    vColor = mix(vColor, vec3(1.0, 0.93, 0.78), glow * 0.6);
    vBright *= (1.0 + 1.6 * glow) * (1.0 + 0.4 * max(uEnter, uOrbit));

    vSeed = aSeed;
  }
`;
