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

void main() {
  vec4 mv = u_viewProj * vec4(a_pos, 1.0);
  gl_Position = mv;

  float dist = max(-mv.z, 0.001);
  float s = a_size * u_pixelRatio * (260.0 / dist);
  gl_PointSize = clamp(s, 0.2, 4.5);

  v_alpha = a_alpha;
  v_tint = a_tint;
}
`;

export const POINT_FRAG = `
precision highp float;

varying float v_alpha;
varying float v_tint;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);

  // tenuous star glow: tight bright core + wide soft halo, kept low so it
  // reads as a faint star rather than a bright blob
  float core = exp(-d2 * 110.0);
  float halo = exp(-d2 * 20.0) * 0.12;
  float a = (core + halo) * v_alpha;
  if (a < 0.0012) discard;

  // wide, star-like palette (subdued): blue -> cyan -> violet -> red/magenta
  // -> orange -> white, chosen per particle via v_tint
  vec3 blue    = vec3(0.35, 0.50, 1.0);
  vec3 cyan    = vec3(0.30, 0.78, 0.95);
  vec3 violet  = vec3(0.66, 0.55, 1.0);
  vec3 magenta = vec3(0.95, 0.45, 0.85);
  vec3 red     = vec3(1.0, 0.45, 0.42);
  vec3 orange  = vec3(1.0, 0.70, 0.50);
  vec3 white   = vec3(1.0, 0.97, 0.95);

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

  gl_FragColor = vec4(color, a);
}
`;