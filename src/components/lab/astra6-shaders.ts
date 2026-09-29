/**
 * "Astra G6" shaders. The vertex stage interpolates each particle between
 * two prebuilt states (dispersed field → face-on "6" galaxy) driven by one
 * eased uniform clock — the sequence plays on its own, no scrolling. The
 * galaxy target rotates slowly in the shader, so the arms appear to wind
 * as they form. The fragment stage renders well-defined stars: a sharp
 * nucleus with a tight halo, in saturated icy blues and red corals.
 */

export const ASTRA6_VERT = /* glsl */ `
  attribute vec3 aField;
  attribute vec3 aGalaxy;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aStaggerF;

  uniform float uTime;
  uniform float uIntro;
  uniform float uForm;
  uniform float uFovScale;
  uniform float uSizeScale;

  varying vec3 vColor;
  varying float vBright;

  vec2 rot2(vec2 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
  }

  void main() {
    // the swarm condenses straight into the spiral: core first, arms wind
    // outwards — the radial stagger encodes that order
    float f = clamp((uForm - aStaggerF * 0.45) / 0.55, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);

    // the galaxy target rotates slowly: the arms visibly wind into place,
    // and once formed the disk keeps turning forever
    vec3 gp = aGalaxy;
    gp.xy = rot2(gp.xy, uTime * 0.028);

    vec3 p = mix(aField, gp, f);

    // mid-flight the stars swing along a converging swirl before the
    // spiral reels them in
    float swirl = f * (1.0 - f) * (0.55 + fract(aSeed * 7.31) * 0.55);
    p.xy = rot2(p.xy, swirl);

    // breathing so nothing ever sits perfectly still
    p += 0.02 * vec3(
      sin(uTime * 0.6 + aSeed * 13.0),
      cos(uTime * 0.5 + aSeed * 17.0),
      sin(uTime * 0.7 + aSeed * 11.0));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      aSize * uSizeScale * uFovScale / max(-mv.z, 0.001),
      1.0,
      190.0
    );

    float twinkle = 0.75 + 0.25 * sin(uTime * 1.8 + aSeed * 40.0);
    vColor = aColor;
    vBright = aBright * uIntro * twinkle;
  }
`;

export const ASTRA6_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    float d = sqrt(r2);
    float falloff = max(1.0 - d, 0.0);

    // a well-defined star: sharp nucleus + tight halo, never a fuzzy blob
    float intensity = pow(falloff, 7.0) + pow(falloff, 2.6) * 0.28;

    gl_FragColor = vec4(vColor * intensity * vBright, 1.0);
  }
`;

/** Ambient backdrop: static far stars with a whisper of twinkle. */
export const ASTRA6_AMBIENT_VERT = /* glsl */ `
  attribute vec3 aPosition;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;

  uniform float uTime;
  uniform float uIntro;
  uniform float uFovScale;

  varying vec3 vColor;
  varying float vBright;

  void main() {
    vec4 mv = modelViewMatrix * vec4(aPosition, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      aSize * uFovScale / max(-mv.z, 0.001),
      1.0,
      8.0
    );

    float twinkle = 0.7 + 0.3 * sin(uTime * 0.9 + aSeed * 50.0);
    vColor = aColor;
    vBright = aBright * uIntro * twinkle;
  }
`;
