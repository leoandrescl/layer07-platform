export const RAIN_VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const RAIN_FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_progress;
uniform sampler2D u_atlas;
uniform vec2 u_atlas_grid;
uniform float u_glyph_count;
uniform vec2 u_grid;

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float hash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 mouse = vec2(u_mouse.x, 1.0 - u_mouse.y);

  vec2 delta = uv - mouse;
  float md = length(delta);
  float warp = 0.11 * (0.35 + u_progress) * exp(-md * 7.5);
  uv += delta * warp;
  uv = fract(uv);

  float densify = mix(1.0, 1.9, u_progress);
  float cols = max(u_grid.x, 8.0) * densify;
  float rows = max(u_grid.y, 8.0) * densify;
  vec2 grid = vec2(cols, rows);
  vec2 cell = floor(uv * grid);
  vec2 local = fract(uv * grid);
  local.y = 1.0 - local.y;

  float rnd = hash(cell.x + 13.0);
  float speed = mix(0.35, 1.65, hash(cell.x + 41.0)) * mix(1.0, 2.6, u_progress);
  float headY = 1.0 - fract(u_time * speed * 0.22 + rnd * 2.0);
  float raw = fract(headY - uv.y);
  float trail = exp(-raw * 7.2);
  float head = exp(-raw * 36.0);

  float tick = floor(u_time * mix(6.0, 16.0, hash2(cell)));
  float g = floor(hash2(cell + tick) * u_glyph_count);
  vec2 atlasCell = vec2(mod(g, u_atlas_grid.x), floor(g / u_atlas_grid.x));
  vec2 atlasUV = (atlasCell + local) / u_atlas_grid;
  float glyph = texture2D(u_atlas, atlasUV).r;

  float signal = glyph * trail;

  vec3 phosphor = vec3(0.02, 1.0, 0.38);
  vec3 cyan = vec3(0.0, 0.94, 1.0);
  vec3 mag = vec3(1.0, 0.05, 0.34);
  vec3 tone = mix(phosphor, cyan, rnd * 0.22);
  tone = mix(tone, vec3(0.86, 1.0, 0.92), head);

  float band = step(0.997, hash(floor(uv.y * 90.0) + floor(u_time * 4.0)));
  tone = mix(tone, mag, band * 0.85);

  vec2 centered = gl_FragCoord.xy / u_res - 0.5;
  float vig = smoothstep(1.2, 0.18, length(centered * vec2(1.08, 1.0)) * mix(1.0, 1.55, u_progress));
  float scan = 0.88 + 0.12 * sin(gl_FragCoord.y * 1.8 + u_time * 6.0);

  vec3 color = tone * signal * vig * scan;
  color += head * glyph * vec3(0.55, 1.0, 0.7) * 0.45;

  float fog = u_progress * 0.08;
  color = mix(color, phosphor * 0.06, fog);

  gl_FragColor = vec4(color, 1.0);
}
`;
