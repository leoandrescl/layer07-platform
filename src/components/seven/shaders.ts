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
  vec2 uv0 = gl_FragCoord.xy / u_res;
  vec2 mouse = vec2(u_mouse.x, 1.0 - u_mouse.y);

  vec2 uv = uv0;

  vec2 mdelta = uv - mouse;
  float md = length(mdelta);
  float warp = 0.038 * exp(-md * 7.5);
  uv += mdelta * warp;
  uv = fract(uv);

  float cols = max(u_grid.x, 8.0);
  float rows = max(u_grid.y, 8.0);
  vec2 grid = vec2(cols, rows);
  vec2 cell = floor(uv * grid);
  vec2 local = fract(uv * grid);
  local.y = 1.0 - local.y;

  float rnd = hash(cell.x + 13.0);
  float speed = mix(0.16, 0.62, hash(cell.x + 41.0));
  float headY = 1.0 - fract(u_time * speed * 0.16 + rnd * 2.0);
  float raw = fract(headY - uv.y);
  float trail = exp(-raw * 5.4);
  float head = exp(-raw * 28.0);

  float tick = floor(u_time * mix(3.5, 9.0, hash2(cell)));
  float g = floor(hash2(cell + tick) * u_glyph_count);
  vec2 atlasCell = vec2(mod(g, u_atlas_grid.x), floor(g / u_atlas_grid.x));
  vec2 atlasUV = (atlasCell + local) / u_atlas_grid;
  float glyph = texture2D(u_atlas, atlasUV).r;

  float signal = glyph * trail;

  vec3 phosphor = vec3(0.42, 1.0, 0.82);
  vec3 cyan = vec3(0.12, 0.9, 0.88);
  vec3 tear = vec3(0.7, 1.0, 0.92);
  vec3 tone = mix(phosphor, cyan, rnd * 0.35);
  tone = mix(tone, vec3(0.9, 1.0, 0.96), head);

  float band = step(0.992, hash(floor(uv.y * 70.0) + floor(u_time * 2.4)));
  tone = mix(tone, tear, band * 0.7);

  vec2 centered = uv0 - 0.5;
  float vig = smoothstep(1.15, 0.16, length(centered * vec2(1.08, 1.0)));
  float scan = 0.78 + 0.22 * sin(gl_FragCoord.y * 2.4 + u_time * 3.2);
  float grain = (hash2(gl_FragCoord.xy * 0.7 + u_time * 8.0) - 0.5) * 0.06;

  vec3 bg = vec3(0.012, 0.035, 0.038);
  vec3 color = bg + tone * signal * vig * scan;
  color += head * glyph * vec3(0.55, 1.0, 0.88) * 0.4;
  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
`;
