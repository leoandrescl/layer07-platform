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
  float s = a_size * u_pixelRatio * (320.0 / dist);
  gl_PointSize = clamp(s, 0.3, 4.0);

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

  // soft, delicate dust: sharp tiny core + wide faint halo
  float core = exp(-d2 * 90.0);
  float halo = exp(-d2 * 16.0) * 0.16;
  float a = (core + halo) * v_alpha;
  if (a < 0.0015) discard;

  // palette: cool blue-violet (outer) -> warm white (core)
  vec3 blue = vec3(0.55, 0.62, 0.95);
  vec3 violet = vec3(0.78, 0.68, 1.0);
  vec3 white = vec3(0.98, 0.98, 1.0);
  vec3 color = mix(blue, violet, smoothstep(0.0, 0.5, v_tint));
  color = mix(color, white, smoothstep(0.5, 1.0, v_tint));

  gl_FragColor = vec4(color, a);
}
`;