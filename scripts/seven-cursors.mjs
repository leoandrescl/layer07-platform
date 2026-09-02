import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../public/seven");

const C = {
  ".": [0, 0, 0, 0],
  o: [232, 255, 248, 255],
  X: [18, 18, 18, 255],
};

const ARROW = [
  "o...............",
  "oXo.............",
  "oXXo............",
  "oXXXo...........",
  "oXXXXo..........",
  "oXXXXXo.........",
  "oXXXXXXo........",
  "oXXXXXXXo.......",
  "oXXo............",
  ".oXXo...........",
  "..oXXo..........",
  "...oXXo.........",
  "....oXXo........",
  ".....oXXo.......",
  "......oXo.......",
  ".......o........",
];

const HAND = [
  "......oo........",
  ".....oXXo.......",
  ".....oXXo.oo....",
  ".....oXXo.XXo...",
  "..oo.oXXo.XXo...",
  ".oXXoXXXXXXXXo..",
  ".oXXXXXXXXXXXo..",
  "..oXXXXXXXXXXo..",
  "...oXXXXXXXXo...",
  "...oXXXXXXXXo...",
  "....oXXXXXXo....",
  "....oXXXXXXo....",
  ".....oXXXXo.....",
  ".....oXXXXo.....",
  "......oooo......",
  "................",
];

const IBEAM = [
  ".oooo..oooo.....",
  "oXXXX..XXXXo....",
  ".ooooooooo......",
  "....oXXo........",
  "....oXXo........",
  "....oXXo........",
  "....oXXo........",
  "....oXXo........",
  "....oXXo........",
  "....oXXo........",
  "....oXXo........",
  ".ooooooooo......",
  "oXXXX..XXXXo....",
  ".oooo..oooo.....",
  "................",
  "................",
];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i] ?? 0;
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function scale2(map) {
  const out = [];
  for (const row of map) {
    let a = "";
    for (const ch of row) a += ch + ch;
    out.push(a, a);
  }
  return out;
}

function pngFromMap(map) {
  const rows = scale2(map);
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  let i = 0;
  for (const row of rows) {
    raw[i] = 0;
    i += 1;
    for (const ch of row) {
      const px = C[ch] ?? C["."];
      raw[i] = px[0] ?? 0;
      raw[i + 1] = px[1] ?? 0;
      raw[i + 2] = px[2] ?? 0;
      raw[i + 3] = px[3] ?? 0;
      i += 4;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync(join(OUT, "cursor-arrow.png"), pngFromMap(ARROW));
writeFileSync(join(OUT, "cursor-hand.png"), pngFromMap(HAND));
writeFileSync(join(OUT, "cursor-ibeam.png"), pngFromMap(IBEAM));
