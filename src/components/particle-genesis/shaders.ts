export const POINT_VERT = `
precision highp float;

attribute vec3 a_pos;
attribute vec3 a_target;
attribute float a_size;
attribute float a_alpha;

uniform mat4 u_viewProj;
uniform vec2 u_resolution;
uniform float u_pixelRatio;

varying float v_size;
varying float v_alpha;

void main() {
  vec4 mv = u_viewProj * vec4(a_pos, 1.0);
  gl_Position = mv;

  float dist = -mv.z;
  float perspectiveScale = 160.0 / max(dist, 0.001);
  float s = a_size * u_pixelRatio * perspectiveScale;
  gl_PointSize = clamp(s, 0.75, 8.0);

  v_size = s;
  v_alpha = a_alpha;
}
`;

export const POINT_FRAG = `
precision highp float;

varying float v_size;
varying float v_alpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float core = smoothstep(0.5, 0.0, d);
  core *= core;
  float glow = smoothstep(0.5, 0.12, d) * 0.18;
  float a = (core + glow) * v_alpha;
  if (a < 0.003) discard;

  vec3 color = vec3(0.88, 0.94, 0.96);
  gl_FragColor = vec4(color, a);
}
`;