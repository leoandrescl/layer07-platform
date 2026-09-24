const TAU = "6.28318530718";

/* ------------------------------------------------------------------ *
 * Volumetric nebula dust.
 *
 * uMorph = 0 -> clumped 3D dust with god-ray stars embedded in it.
 * uMorph = 1 -> the "07" as a river of incandescent matter.
 *
 * The pointer is a lens: it swirls the dust and pulls it out of the
 * volume, and its light is fed to the screen-space god-ray pass.
 * ------------------------------------------------------------------ */

export const DUST_VERT = /* glsl */ `
  const float TAU = ${TAU};

  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aLateral;
  attribute float aZ;
  attribute float aGlyph;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uIntro;
  uniform float uMorph;
  uniform float uDrift;
  uniform float uFovScale;
  uniform float uSizeScale;
  uniform vec3 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;
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
    float t = fract(aPhase + uTime * 0.06 * aSpeed);
    float ph = aSeed * TAU;

    // ---- volumetric dust ----
    vec3 np = position;
    float rot = uTime * 0.012;
    float cs = cos(rot);
    float sn = sin(rot);
    np.xz = mat2(cs, -sn, sn, cs) * np.xz;
    np.x += sin(uTime * 0.05 + np.y * 0.28 + ph) * uDrift * aSpeed;
    np.y += sin(uTime * 0.043 + np.z * 0.28 + ph * 1.3) * uDrift * aSpeed;
    np.z += cos(uTime * 0.047 + np.x * 0.28 + ph * 0.7) * uDrift * aSpeed;

    // ---- pointer lens (world space, z ~ 0 plane) ----
    vec2 toM = np.xy - uMouse.xy;
    float md = length(toM);
    float infl = exp(-(md * md) / (uMouseRadius * uMouseRadius)) * uMouseStrength;
    if (infl > 0.001) {
      float ca = cos(infl * 3.0);
      float sa = sin(infl * 3.0);
      vec2 sw = vec2(toM.x * ca - toM.y * sa, toM.x * sa + toM.y * ca);
      np.xy = uMouse.xy + sw + (toM / max(md, 0.0001)) * infl * 0.35;
    }

    // ---- river along the brush mark ----
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

    vec2 perp = vec2(-segDir.y, segDir.x);
    vec2 riverXY = center + perp * aLateral * taper;
    riverXY += vec2(
      sin(uTime * 1.3 + ph) * 0.035,
      cos(uTime * 1.1 + ph) * 0.035
    );
    vec3 riverPos = vec3(riverXY, aZ);

    // ---- staggered condensation: particles stream in at different beats ----
    float m = smoothstep(0.0, 1.0, clamp((uMorph - aSeed * 0.4) / 0.6, 0.0, 1.0));
    vec3 p = mix(np, riverPos, m);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = mix(aSize * 1.75, aSize * 0.85, m);
    gl_PointSize = clamp(
      max(size, 0.008) * uSizeScale * uFovScale / max(-mv.z, 0.001),
      1.0,
      110.0
    );

    // depth fog on the volume so the clumps read as depth, not paint
    float depthFade = smoothstep(-9.5, -2.2, mv.z);

    float twinkle = 0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 40.0);
    float pulse = 0.7 + 0.4 * sin(t * 9.0 - uTime * 2.4);
    float coreMix = 1.0 - smoothstep(0.0, 0.26, abs(aLateral));

    vColor = mix(aColor, mix(aColor, uCoreColor, coreMix * 0.7), m);
    float nebBright = aBright * (0.45 + 0.55 * twinkle) * depthFade;
    float rivBright = aBright * (0.72 + 0.45 * pulse) * riverFade;
    vBright = uIntro * mix(nebBright * (1.0 - m * 0.3), rivBright, m);
    vBright *= 1.0 + infl * 2.2;
    vSeed = aSeed;
  }
`;

export const DUST_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;

    float fall = max(1.0 - d, 0.0);
    float core = pow(fall, 6.0);
    float halo = pow(fall, 1.6) * 0.34;
    float grain = 0.85 + 0.3 * fract(sin(vSeed * 91.7) * 43758.5453);

    vec3 col = vColor * (core + halo) * vBright * grain;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ *
 * Junction nodes: bright stars at the unions of the "07".
 * ------------------------------------------------------------------ */

export const NODE_VERT = /* glsl */ `
  const float TAU = ${TAU};

  attribute vec3 aScatter;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;
  attribute float aOrder;

  uniform float uTime;
  uniform float uResolve;
  uniform float uFovScale;
  uniform float uSizeScale;
  uniform vec3 uMouse;
  uniform float uMouseRadius;
  uniform float uMouseStrength;
  uniform vec3 uTintA;
  uniform vec3 uTintB;

  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  void main() {
    vec3 p = mix(aScatter, position, uResolve);
    p.x += sin(uTime * 0.6 + aSeed * TAU) * (1.0 - uResolve) * 0.45;
    p.y += cos(uTime * 0.5 + aSeed * TAU) * (1.0 - uResolve) * 0.45;

    vec2 toM = p.xy - uMouse.xy;
    float md = length(toM);
    float infl = exp(-(md * md) / (uMouseRadius * uMouseRadius)) * uMouseStrength;
    p.xy -= (toM / max(md, 0.0001)) * infl * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      aSize * uSizeScale * uFovScale / max(-mv.z, 0.001),
      2.0,
      128.0
    );

    float pulse = 0.7 + 0.5 * sin(uTime * 2.2 - aOrder * TAU);
    vColor = mix(uTintA, uTintB, aSeed);
    vBright = aBright * uResolve * (0.55 + 0.6 * pulse) * (1.0 + infl * 2.6);
    vSeed = aSeed;
  }
`;

export const NODE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vBright;
  varying float vSeed;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;

    float fall = max(1.0 - d, 0.0);
    float core = pow(fall, 8.0);
    float halo = pow(fall, 2.0) * 0.3;
    float flareX = pow(max(1.0 - abs(c.x) * 9.0, 0.0), 2.0) * pow(fall, 1.6);
    float flareY = pow(max(1.0 - abs(c.y) * 13.0, 0.0), 2.0) * pow(fall, 1.6);

    float intensity = core + halo + (flareX + flareY) * 0.45;
    gl_FragColor = vec4(vColor * intensity * vBright, 1.0);
  }
`;

/* ------------------------------------------------------------------ *
 * Screen-space god rays: two light sources (an embedded star and the
 * pointer) scattering through the bright matter.
 * ------------------------------------------------------------------ */

export function lightShaftsFragment(samples: number): string {
  return /* glsl */ `
    uniform vec2 uLightA;
    uniform vec2 uLightB;
    uniform float uIntensity;
    uniform float uDecay;
    uniform float uDensity;
    uniform float uWeight;
    uniform float uExposure;
    uniform float uGate;
    uniform float uVignette;
    uniform float uGrain;
    uniform vec3 uTint;

    float luma(vec3 c) {
      return dot(c, vec3(0.2126, 0.7152, 0.0722));
    }

    vec3 march(vec2 uv, vec2 light) {
      vec3 src = texture2D(inputBuffer, clamp(light, 0.0, 1.0)).rgb;
      float gate = smoothstep(uGate, 1.0, luma(src));
      vec2 delta = (light - uv) * (uDensity / float(${samples}));
      vec2 coord = uv;
      float illum = 1.0;
      vec3 acc = vec3(0.0);
      for (int i = 0; i < ${samples}; i++) {
        coord += delta;
        acc += texture2D(inputBuffer, clamp(coord, 0.0, 1.0)).rgb * illum;
        illum *= uDecay;
      }
      return acc * uWeight * gate;
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
      vec3 base = inputColor.rgb;
      vec3 shafts = march(uv, uLightA) + march(uv, uLightB) * 0.7;
      base += shafts * uIntensity * uTint * uExposure;

      vec2 q = uv - 0.5;
      base *= 1.0 - uVignette * dot(q, q) * 1.8;

      float n = fract(sin(dot(uv * vec2(1234.5, 7654.3) + time, vec2(12.9898, 78.233))) * 43758.5453);
      base += (n - 0.5) * uGrain;

      outputColor = vec4(base, inputColor.a);
    }
  `;
}
