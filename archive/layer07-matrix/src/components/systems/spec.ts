/**
 * SYSTEMS — light in the dark.
 *
 * The world is the wordmark "layer07" embossed as a vast, dark relief in the
 * void. The visitor carries the only light: a point light that reveals the
 * raised surfaces (lit faces, specular rims, soft cast shadows). The camera
 * travels along the embossed word at near scale, then rises for the reveal.
 * Wherever the light has been, a dim "ember glow" persists on the surface.
 *
 * This module is pure geometry: it rasters the wordmark and returns a
 * heightfield (luminance 0..255) for the WebGL renderer.
 */

export type HeightField = {
  width: number;
  height: number;
  data: Uint8Array;
};

export function buildHeightField(): HeightField {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas 2d unavailable");

  const F = 340;
  const font = `900 ${F}px "Arial Black", "Arial", "Helvetica Neue", sans-serif`;
  const pad = 90;
  ctx.font = font;
  const textWidth = ctx.measureText("layer07").width;
  const width = Math.ceil(textWidth + pad * 2);
  const height = Math.ceil(F * 1.35 + pad * 2);

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.font = font;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText("layer07", pad, pad + F * 0.95);

  const source = ctx.getImageData(0, 0, width, height).data;
  const data = new Uint8Array(width * height);

  // Box blur 3x3 → crisp letter walls become slight slopes (nicer lighting).
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0;
      let samples = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= width || yy >= height) continue;
          sum += source[(yy * width + xx) * 4 + 3];
          samples += 1;
        }
      }
      data[y * width + x] = sum / Math.max(samples, 1);
    }
  }

  return { width, height, data };
}