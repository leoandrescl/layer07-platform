export const RELIEF_VERT = `
precision highp float;

attribute vec2 a_uv;

uniform sampler2D u_height;
uniform float u_len;
uniform float u_wid;
uniform float u_amp;
uniform vec2 u_texel;
uniform mat4 u_viewProj;

varying vec3 v_world;
varying vec2 v_uv;
varying vec3 v_normal;

void main() {
  v_uv = a_uv;

  float h = texture2D(u_height, a_uv).r;
  float hL = texture2D(u_height, a_uv + vec2(u_texel.x, 0.0)).r;
  float hD = texture2D(u_height, a_uv + vec2(0.0, u_texel.y)).r;

  float x = (a_uv.x - 0.5) * u_len;
  float z = (a_uv.y - 0.5) * u_wid;
  float y = h * u_amp;

  vec3 tX = vec3(u_len, (hL - h) * u_amp, 0.0);
  vec3 tZ = vec3(0.0, (hD - h) * u_amp, u_wid);
  v_normal = normalize(cross(tZ, tX));

  v_world = vec3(x, y, z);
  gl_Position = u_viewProj * vec4(v_world, 1.0);
}
`;

export const RELIEF_FRAG = `
precision highp float;

varying vec3 v_world;
varying vec2 v_uv;
varying vec3 v_normal;

uniform sampler2D u_height;
uniform sampler2D u_ember;
uniform vec3 u_light;
uniform vec3 u_eye;
uniform float u_invRadius;
uniform float u_reveal;
uniform float u_amp;
uniform vec2 u_lightUV;

void main() {
  vec3 N = normalize(v_normal);
  vec3 L = normalize(u_light - v_world);
  float d = distance(u_light, v_world);
  float fall = clamp(1.0 - d * u_invRadius, 0.0, 1.0);
  fall *= fall;

  float occlusion = 1.0;
  if (fall > 0.002) {
    float startY = v_world.y;
    for (int i = 1; i <= 8; i += 1) {
      float t = float(i) / 8.0;
      vec2 p = mix(v_uv, u_lightUV, t);
      float h = texture2D(u_height, p).r * u_amp;
      float rayY = mix(startY, u_light.y, t);
      if (h > rayY + 0.015) occlusion *= 0.82;
    }
  }

  vec3 V = normalize(u_eye - v_world);
  float diffuse = max(dot(N, L), 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 42.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);

  vec3 warm = vec3(1.0, 0.66, 0.38);
  float lightAmt = (diffuse * 0.85 + spec * 1.5 + fres * 0.4) * fall * occlusion;

  float ember = texture2D(u_ember, v_uv).r;
  float hgt = texture2D(u_height, v_uv).r;
  float raised = smoothstep(0.02, 0.4, hgt);

  vec3 rd = normalize(vec3(0.45, 1.0, 0.3));
  float top = max(dot(N, rd), 0.0);
  float rev = (top * raised + raised * 0.22 + 0.04) * u_reveal;

  vec3 color = warm * lightAmt;
  color += vec3(0.55, 0.26, 0.08) * ember * (0.4 + 0.6 * raised);
  color += vec3(1.0, 0.86, 0.6) * rev * (0.55 + 0.45 * ember);

  gl_FragColor = vec4(color, 1.0);
}
`;