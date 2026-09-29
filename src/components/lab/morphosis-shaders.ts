/**
 * 07-morfosis — the whole scene is driven by one buffer pair (aFrom → aTo).
 * Scroll advances uMorph and every particle swings out along its seeded
 * aScatter direction mid-flight (the dispersal burst) before the next
 * figure pulls it back in. uPointer bends the formed figure in view space,
 * same living-field treatment as the experience hero.
 */

const TAU = "6.28318530718";
const PI = "3.141592653589793";

export const MORPH_VERT = /* glsl */ `
  const float TAU = ${TAU};
  const float PI = ${PI};

  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aFromColor;
  attribute vec3 aToColor;
  attribute vec3 aScatter;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aStagger;

  uniform float uTime;
  uniform float uIntro;
  uniform float uMorph;
  uniform float uScatter;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uFovScale;
  uniform float uSizeScale;

  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  vec2 rot2(vec2 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
  }

  void main() {
    // per-particle delay so the swarm never moves as one rigid block
    float lr = clamp((uMorph - aStagger * 0.3) / 0.7, 0.0, 1.0);
    float e = lr * lr * (3.0 - 2.0 * lr);
    vec3 p = mix(aFrom, aTo, e);

    // dispersal: mid-flight each particle leaves the straight chord, swings
    // out along its seeded direction and corkscrews before the new figure
    // reels it back in
    float bump = sin(lr * PI);
    float mag = (0.5 + fract(aSeed * 7.7) * 1.1) * uScatter;
    p += normalize(aScatter + vec3(0.0001)) * bump * mag;
    p.xz = rot2(p.xz, bump * (fract(aSeed * 5.3) - 0.5) * 1.4);
    p.y += bump * (fract(aSeed * 9.1) - 0.5) * 0.7;

    // idle breathing: formed figures never sit perfectly still
    p += 0.03 * vec3(
      sin(uTime * 0.7 + aSeed * 13.0),
      cos(uTime * 0.6 + aSeed * 17.0),
      sin(uTime * 0.8 + aSeed * 11.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // living field: the cursor bends the formed figure in view space
    float glow = 0.0;
    if (uPointerActive > 0.001) {
      vec4 probe = projectionMatrix * mv;
      vec2 ndc = probe.xy / max(probe.w, 0.0001);
      vec2 toP = ndc - uPointer;
      float d2 = dot(toP, toP);
      float field = uPointerActive * exp(-d2 * 5.0);
      vec2 dir = toP / max(sqrt(d2), 0.0001);
      float jitter = 0.7 + fract(aSeed * 3.3) * 0.6;
      // radial push away from the cursor plus a tangential swirl
      mv.x += (dir.x * 0.45 - dir.y * 0.35) * field * jitter;
      mv.y += (dir.y * 0.45 + dir.x * 0.35) * field * jitter;
      glow = field;
    }

    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      max(aSize, 0.006) * uSizeScale * uFovScale / max(-mv.z, 0.001),
      1.0,
      72.0
    );

    float twinkle = 0.72 + 0.28 * sin(uTime * 1.7 + aSeed * 30.0);
    vColor = mix(aFromColor, aToColor, e);
    // particles flare warm while in transit
    vColor = mix(vColor, vec3(1.0, 0.93, 0.78), bump * 0.5);
    vBright = aBright * uIntro * twinkle * (1.0 + 1.4 * bump + 1.2 * glow);
    vSeed = aSeed;
  }
`;
