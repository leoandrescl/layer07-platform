/**
 * 07-tinta-viva — a two-pass "living ink" field. Pass one advects a dye
 * buffer along a slow curl-noise flow and lets the cursor drag it around;
 * pass two paints that dye *inside* the headline glyphs, using a canvas
 * texture of the live DOM text as the alpha mask. No fluid solver, no
 * particles: it stays cheap enough to run beside the editorial layer.
 */

export const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const INK_SIM_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uPrev;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uPointerVel;
  uniform float uHover;

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  vec2 curl(vec2 p) {
    float e = 0.085;
    float n1 = noise(p + vec2(0.0, e));
    float n2 = noise(p - vec2(0.0, e));
    float n3 = noise(p + vec2(e, 0.0));
    float n4 = noise(p - vec2(e, 0.0));
    return vec2(n1 - n2, n4 - n3) / (2.0 * e);
  }

  void main() {
    vec2 p = vUv * vec2(uAspect, 1.0) * 2.4;
    vec2 flow = curl(p + vec2(uTime * 0.05, uTime * 0.04)) * 0.22;

    vec2 d = vUv - uPointer;
    d.x *= uAspect;
    float dist = length(d);
    float speed = length(uPointerVel);

    // the cursor drags the ink along its own direction of travel
    flow += uPointerVel * 9.0 * exp(-dist * dist * 26.0);

    vec2 uv = vUv - flow * uTexel * 1.6;
    vec3 dye = texture2D(uPrev, uv).rgb * 0.978;

    // two slow emitters keep the ink alive without any input
    float e1 = exp(-pow(length(vUv - vec2(
      0.30 + 0.07 * sin(uTime * 0.21),
      0.40 + 0.06 * cos(uTime * 0.17)
    )) * 3.1, 2.0));
    float e2 = exp(-pow(length(vUv - vec2(
      0.66 + 0.06 * cos(uTime * 0.15),
      0.60 + 0.07 * sin(uTime * 0.24)
    )) * 3.1, 2.0));

    float brush = exp(-dist * dist * 34.0) * (0.18 + speed * 6.0) * uHover;

    dye += vec3(e1 * 0.004 + e2 * 0.004 + brush * 0.5);

    gl_FragColor = vec4(dye, 1.0);
  }
`;

export const INK_DISPLAY_FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uDye;
  uniform sampler2D uMask;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    // mask.a = glyph coverage, mask.r = 1 on the accent line
    vec4 m = texture2D(uMask, vUv);
    float cov = m.a;
    vec3 dye = texture2D(uDye, vUv).rgb;
    float d = clamp(dye.r, 0.0, 2.0);

    float accent = clamp(max(m.r, d * 0.75), 0.0, 1.0);
    vec3 col = mix(uInk, uAccent, accent);
    col += uAccent * smoothstep(1.2, 2.0, d) * 0.5;

    // ink fills the glyphs; a faint halo leaks past their edges
    float fill = cov * (0.9 + 0.1 * clamp(d, 0.0, 1.0));
    float halo = (1.0 - cov) * smoothstep(0.8, 1.8, d) * 0.14;

    gl_FragColor = vec4(col, max(fill, halo) * uOpacity);
  }
`;
