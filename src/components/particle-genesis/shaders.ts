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
  float s = a_size * u_pixelRatio * (260.0 / dist);
  // min 2px: 1px dots are always dim gray mush; 2px reads as a star
  float px = clamp(s, 2.0, 126.0);
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

  // sharpness by size: tiny dust (most of the arms) is a solid flat dot
  // with no gradient at all; big stars keep a tight falloff so huge
  // sprites don't stack into solid white blobs under additive blending.
  float profile;
  if (v_px < 7.0) {
    if (r > 0.85) discard;
    profile = 1.0;
  } else {
    float core = exp(-d2 * 700.0);
    float glow = exp(-d2 * 180.0) * 0.06;
    profile = core + glow;
    if (profile < 0.03) discard;
  }
  float a = profile * v_alpha;

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

  // hard white-hot center via step (no gradient): inner disk white,
  // outer ring keeps the tint
  vec3 hot = (r < 0.4) ? mix(color, vec3(1.0, 0.98, 0.96), 0.85) : color;

  gl_FragColor = vec4(hot, a);
}
`;