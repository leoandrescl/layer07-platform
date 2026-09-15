export const POINT_VERT = `
precision highp float;

attribute vec3 a_pos;
attribute float a_size;
attribute float a_alpha;
attribute float a_tint;

uniform mat4 u_viewProj;
uniform float u_pixelRatio;

varying float v_alpha;
varying float v_tint;
varying float v_px;

void main() {
  vec4 mv = u_viewProj * vec4(a_pos, 1.0);
  gl_Position = mv;

  float dist = max(-mv.z, 0.001);
  // ~7 px per world unit at the camera distance (was ~16 — that is why
  // particles read as big circles). Sub-pixel minimum so even the finest
  // dust renders as a small crisp point instead of a flat identical dot.
  float s = a_size * u_pixelRatio * (110.0 / dist);
  float px = clamp(s, 1.0, 32.0);
  gl_PointSize = px;

  v_alpha = a_alpha;
  v_tint = a_tint;
  v_px = px;
}
`;

export const POINT_FRAG = `
precision highp float;

varying float v_alpha;
varying float v_tint;
varying float v_px;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  float r = sqrt(d2) * 2.0; // 0 at center -> 1 at sprite edge
  if (r > 1.0) discard;

  // star sprite: a gaussian glow — bright hot center falling off smoothly.
  // Every star reads as a luminous point on darkness, never a solid disc.
  // Because blending is additive, the soft glow gathers into bright nebulae
  // where stars are dense, exactly like a galaxy.
  float d = sqrt(d2) * 2.0; // 0 center -> 1 edge
  float gauss = exp(-d * d * 4.5);
  float core = exp(-d * d * 60.0);
  float profile = core + gauss * 0.4;
  if (profile < 0.03) discard;
  float a = profile * v_alpha;

  // star palette, saturated but not neon: blue -> cyan -> violet ->
  // magenta -> red -> orange -> white, chosen per particle via v_tint
  vec3 blue    = vec3(0.25, 0.45, 1.0);
  vec3 cyan    = vec3(0.15, 0.80, 1.0);
  vec3 violet  = vec3(0.62, 0.50, 1.0);
  vec3 magenta = vec3(1.0, 0.35, 0.80);
  vec3 red     = vec3(1.0, 0.30, 0.32);
  vec3 orange  = vec3(1.0, 0.60, 0.20);
  vec3 white   = vec3(1.0, 0.97, 0.94);

  vec3 color;
  float t = v_tint;
  if (t < 0.166) {
    color = mix(blue, cyan, t / 0.166);
  } else if (t < 0.333) {
    color = mix(cyan, violet, (t - 0.166) / 0.166);
  } else if (t < 0.5) {
    color = mix(violet, magenta, (t - 0.333) / 0.166);
  } else if (t < 0.666) {
    color = mix(magenta, red, (t - 0.5) / 0.166);
  } else if (t < 0.833) {
    color = mix(red, orange, (t - 0.666) / 0.166);
  } else {
    color = mix(orange, white, (t - 0.833) / 0.166);
  }

  // white-hot heart only at the very center of truly big stars; small
  // dust keeps its pure tint so the arms stay colorful instead of washing
  // to white under additive blending.
  vec3 hot = (v_px >= 12.0 && d < 0.25)
    ? mix(color, vec3(1.0, 0.98, 0.96), 0.7)
    : color;

  gl_FragColor = vec4(hot, a);
}
`;