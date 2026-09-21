export const MATERIAL_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const MATERIAL_FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uScroll;
  uniform float uVelocity;
  uniform float uMood;
  uniform float uTheme;
  uniform float uQuality;
  uniform float uIntensity;
  uniform vec3 uColBase;
  uniform vec3 uColInk;
  uniform vec3 uColAccent;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 6; i++) {
      value += amp * noise(p);
      p = p * 2.03 + vec2(11.3, 7.7);
      amp *= 0.5;
      if (i == 3 && uQuality < 0.5) break;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    float t = uTime * 0.035;
    float zoom = mix(1.15, 2.35, uMood) * mix(1.0, 1.28, uVelocity);
    p *= zoom;

    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0) * zoom;
    vec2 delta = p - m;
    float md = length(delta) + 1e-4;
    float lens = exp(-md * 2.1) * (0.3 + uMouseStrength * 0.9);
    p += (delta / md) * lens * 0.22;

    vec2 q = vec2(
      fbm(p + t + uScroll * 0.6),
      fbm(p + vec2(5.2, 1.3) - t)
    );
    vec2 r = vec2(
      fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.2),
      fbm(p + 3.0 * q + vec2(8.3, 2.8) - t)
    );
    float f = fbm(p + 2.6 * r);

    float e = 0.004;
    float fx = fbm(p + 2.6 * r + vec2(e, 0.0)) - f;
    float fy = fbm(p + 2.6 * r + vec2(0.0, e)) - f;
    vec3 n = normalize(vec3(-fx / e * 0.02, -fy / e * 0.02, 1.0));

    vec3 lightDir = normalize(vec3(
      mix(-0.55, 0.6, uMouse.x),
      mix(0.65, -0.5, uMouse.y),
      0.75
    ));
    float diff = clamp(dot(n, lightDir), 0.0, 1.0);
    float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 3.0);
    float spec = pow(max(dot(reflect(-lightDir, n), vec3(0.0, 0.0, 1.0)), 0.0), 26.0);

    float shade = smoothstep(0.12, 0.96, f);
    float inkMix = shade * mix(0.42, 0.82, uTheme);

    vec3 col = mix(uColBase, uColInk, inkMix);
    col += uColAccent * (rim * 0.55 + spec * 0.7) * mix(0.55, 1.0, uTheme);
    col += vec3(1.0) * spec * mix(0.04, 0.14, uTheme);
    col = mix(col, col * (0.86 + diff * 0.28), 0.6);

    float vig = smoothstep(1.3, 0.22, length((uv - 0.5) * vec2(1.08, 1.0)));
    col = mix(uColBase, col, clamp(vig * 0.94 + 0.06, 0.0, 1.0));

    float grain = hash(uv * uResolution + fract(uTime) * 13.0) - 0.5;
    col += grain * 0.018;

    col = mix(uColBase, col, uIntensity);
    gl_FragColor = vec4(col, 1.0);
  }
`;
