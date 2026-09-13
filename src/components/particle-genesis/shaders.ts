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
  float s = a_size * u_pixelRatio * (300.0 / dist);
  gl_PointSize = clamp(s, 0.5, 5.5);

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
  float core = exp(-d2 * 38.0);
  float halo = exp(-d2 * 7.0) * 0.22;
  float a = (core + halo) * v_alpha;
  if (a < 0.002) discard;

  // subtle palette: cool blue-violet -> warm white
  vec3 cool = vec3(0.62, 0.68, 0.92);
  vec3 warm = vec3(0.98, 0.97, 1.0);
  vec3 color = mix(cool, warm, v_tint);
  color = mix(vec3(0.85, 0.9, 1.0), color, 0.6);

  gl_FragColor = vec4(color, a);
}
`;