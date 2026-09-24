const TAU = "6.28318530718";

/* ------------------------------------------------------------------ *
 * Constellation 07 — stars on the mark's vertices and self-drawing
 * lines. Cursor attracts stars and lights up their connections.
 * ------------------------------------------------------------------ */

export const CONST_STAR_VERT = /* glsl */ `
  const float TAU = ${TAU};

  attribute vec3 aScatter;
  attribute float aSeed;
  attribute float aSize;
  attribute float aBright;

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
    p.x += sin(uTime * 0.5 + aSeed * TAU) * (1.0 - uResolve) * 1.1;
    p.y += cos(uTime * 0.45 + aSeed * TAU) * (1.0 - uResolve) * 1.1;

    vec2 toM = p.xy - uMouse.xy;
    float md = length(toM);
    float infl = exp(-(md * md) / (uMouseRadius * uMouseRadius)) * uMouseStrength;
    p.xy -= (toM / max(md, 0.0001)) * infl * 0.55;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(
      aSize * uSizeScale * uFovScale / max(-mv.z, 0.001),
      2.0,
      130.0
    );

    float twinkle = 0.7 + 0.4 * sin(uTime * (1.2 + aSeed * 1.6) + aSeed * 40.0);
    vColor = mix(uTintA, uTintB, aSeed);
    vBright = aBright * uResolve * twinkle * (1.0 + infl * 2.6);
    vSeed = aSeed;
  }
`;

export const CONST_LINE_VERT = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aOrder;
  attribute float aSeed;

  uniform float uDraw;
  uniform float uMouseStrength;
  uniform vec3 uMouse;
  uniform float uMouseRadius;
  uniform vec3 uTint;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float p = clamp((uDraw - aOrder * 0.55) / 0.45, 0.0, 1.0);
    vec3 pos = mix(aFrom, aTo, p);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    float md = distance(pos.xy, uMouse.xy);
    float infl = exp(-(md * md) / (uMouseRadius * uMouseRadius)) * uMouseStrength;

    float grow = smoothstep(0.0, 0.18, p);
    vAlpha = uDraw * grow * (0.32 + infl * 2.4);
    vColor = uTint;
    vSeed = aSeed;
  }
`;

export const CONST_LINE_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    float flick = 0.8 + 0.2 * sin(uTime * 1.6 + vSeed * 50.0);
    gl_FragColor = vec4(vColor * flick, vAlpha);
  }
`;
