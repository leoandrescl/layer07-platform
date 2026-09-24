const TAU = "6.28318530718";

/* ------------------------------------------------------------------ *
 * L07 coil — a faithful clone of the current home hero, but the "07"
 * settles as a helical coil wrapped around each stroke. Seen from the
 * front the helix reads as two dense lines with loose matter inside,
 * and the galaxy feeds it exactly like the single-line mark does.
 * ------------------------------------------------------------------ */

export const COIL_VERT = /* glsl */ `
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
  attribute float aGlyph;
  attribute float aCoil;
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
    // radius runs along perp, depth runs along z, so the front projection
    // of the helix concentrates its density on two edges: the "2 lines".
    float rad = uCoilRadius * taper;
    float loose = step(0.78, aSeed);
    rad *= mix(1.0, 0.2 + fract(aSeed * 13.7) * 0.7, loose);
    rad *= 0.92 + 0.16 * fract(aSeed * 51.3);

    float phase = aCoil * TAU + t * uCoilTurns * TAU + uTime * uCoilSpin;
    vec2 perp = vec2(-segDir.y, segDir.x);
    vec2 riverXY = center + perp * (rad * cos(phase));
    riverXY.x += sin(uTime * 1.3 + aSeed * 6.2831) * 0.03;
    riverXY.y += cos(uTime * 1.1 + aSeed * 6.2831) * 0.03;
    vec3 riverPos = vec3(riverXY, aZ + rad * sin(phase) * uCoilDepth);

    // dispersed field -> galaxy -> coiled 07
    vec3 p = mix(aScatter, galaxyPos, uForm);
    p = mix(p, riverPos, uMorph);

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
    vSeed = aSeed;
  }
`;

/** Soft luminous nucleus glowing inside the "0". */
export const CORE_VERT = /* glsl */ `
  uniform float uFovScale;
  uniform float uSize;
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vColor = uColor;
    vOpacity = uOpacity;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * uFovScale / max(-mv.z, 0.001), 1.0, 520.0);
  }
`;

export const CORE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;

    float fall = max(1.0 - d, 0.0);
    float nucleus = pow(fall, 7.0);
    float halo = pow(fall, 1.8) * 0.4;
    vec3 col = vColor * (nucleus + halo) * vOpacity;
    gl_FragColor = vec4(col, 1.0);
  }
`;
