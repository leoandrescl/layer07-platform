export const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;

    // sharp luminous nucleus + a tight halo: crisp stars, no fuzzy blobs
    float falloff = max(1.0 - d, 0.0);
    float nucleus = pow(falloff, 16.0);
    float halo = pow(falloff, 3.0) * 0.16;

    vec3 col = vColor * (nucleus + halo) * vBright;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const TAU = "6.28318530718";

/**
 * Formation particles: spawn on one of the arms far out, wind inward along a
 * log-spiral toward their point on the L07, settle and hold, then recycle.
 * The in-transit stream is the visible "tail", continuously fed by recycling.
 */
export const FORMATION_VERT = /* glsl */ `
  const float TAU = ${TAU};
  const float PI = 3.14159265359;

  attribute vec3 aTarget;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aSeed;
  attribute vec3 aColor;
  attribute float aRadius0;
  attribute float aArm;
  attribute float aSpread;
  attribute float aDepth;

  uniform float uTime;
  uniform float uIntro;
  uniform float uFlow;
  uniform float uTwist;
  uniform float uSpin;
  uniform float uArms;
  uniform float uTurb;
  uniform float uFovScale;
  uniform float uPointerStrength;
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vBright;

  void main() {
    float life = fract(aPhase + uTime * uFlow * aSpeed);
    float travel = smoothstep(0.0, 0.46, life) * uIntro;

    vec2 target = aTarget.xy;
    float rEnd = length(target);
    float thetaEnd = atan(target.y, target.x);

    float r = mix(aRadius0, rEnd, travel);

    float thetaStart = aArm * (TAU / uArms) + aSpread;
    float dTheta = mod(thetaEnd - thetaStart + PI, TAU) - PI;
    float theta =
      thetaStart +
      dTheta * travel +
      uTwist * log(max(r, 0.06) / max(aRadius0, 0.06)) +
      uSpin * uTime;

    vec3 spiral = vec3(cos(theta) * r, sin(theta) * r, aDepth * (1.0 - travel));
    vec3 p = mix(spiral, aTarget, travel);

    p += vec3(
      sin(uTime * 0.8 + aSeed * 6.2831 + p.y * 1.2),
      cos(uTime * 0.7 + aSeed * 6.2831 + p.x * 1.2),
      sin(uTime * 0.6 + aSeed * 6.2831 + p.x)
    ) * uTurb * (1.0 - travel);

    vec4 world = modelMatrix * vec4(p, 1.0);

    vec2 toPointer = world.xy - uPointer;
    float dist = length(toPointer) + 0.0001;
    float force = exp(-dist * dist * 0.6) * uPointerStrength;
    world.xy += (toPointer / dist) * force;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uFovScale / max(-mv.z, 0.001), 1.5, 60.0);

    float alpha = smoothstep(0.0, 0.04, life) * (1.0 - smoothstep(0.95, 1.0, life));
    float twinkle = 0.82 + 0.18 * sin(uTime * 2.2 + aSeed * 40.0);

    vColor = aColor;
    vBright = aBright * alpha * twinkle * mix(0.4, 1.0, travel);
  }
`;

/** Ambient starfield: dense, mostly static, subtle drift and twinkle. */
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
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec3 p = aBase;
    p.x += sin(uTime * 0.02 * aSpeed + aSeed * 6.2831) * 0.5;
    p.y += cos(uTime * 0.017 * aSpeed + aSeed * 6.2831) * 0.35;

    vec4 world = modelMatrix * vec4(p, 1.0);
    world.xy += uPointer * 0.05 * (aSeed - 0.5);

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uFovScale / max(-mv.z, 0.001), 1.0, 26.0);

    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSpeed) + aSeed * 50.0);

    vColor = aColor;
    vBright = aBright * twinkle * uReveal;
  }
`;
