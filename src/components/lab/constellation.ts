import { SEVEN_PATH, ZERO } from "@/components/hero/glyphs";

/* ------------------------------------------------------------------ *
 * "07" as a constellation: bright stars on the vertices/unions of the
 * mark, joined by faint lines that trace themselves on scroll.
 * ------------------------------------------------------------------ */

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function gaussian() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

type Pt = { x: number; y: number };

function quad(p0: number[], c: number[], p1: number[], u: number): Pt {
  const v = 1 - u;
  return {
    x: v * v * p0[0] + 2 * v * u * c[0] + u * u * p1[0],
    y: v * v * p0[1] + 2 * v * u * c[1] + u * u * p1[1],
  };
}

export type ConstellationBuffers = {
  nodeCount: number;
  nodePosition: Float32Array;
  nodeScatter: Float32Array;
  nodeSeed: Float32Array;
  nodeSize: Float32Array;
  nodeBright: Float32Array;
  segFrom: Float32Array;
  segTo: Float32Array;
  segOrder: Float32Array;
  segSeed: Float32Array;
};

export function buildConstellation(): ConstellationBuffers {
  const { p0, c1, p1, c2, p2 } = SEVEN_PATH;
  const a = [p2.x, p2.y];
  const b = [c2.x, c2.y];
  const c = [p1.x, p1.y];
  const d = [c1.x, c1.y];
  const e = [p0.x, p0.y];

  const seven: Pt[] = [];
  const LEG = 7;
  const BAR = 6;
  for (let i = 0; i <= LEG; i += 1) seven.push(quad(a, b, c, i / LEG));
  for (let i = 1; i <= BAR; i += 1) seven.push(quad(c, d, e, i / BAR));

  const ring: Pt[] = [];
  const RING = 16;
  for (let k = 0; k < RING; k += 1) {
    const ang = (k / RING) * Math.PI * 2;
    ring.push({
      x: ZERO.center.x + Math.cos(ang) * ZERO.rx,
      y: ZERO.center.y + Math.sin(ang) * ZERO.ry,
    });
  }

  const nodes: Pt[] = [...seven, ...ring];
  const ringStart = seven.length;

  const segments: [number, number][] = [];
  for (let i = 0; i < seven.length - 1; i += 1) segments.push([i, i + 1]);
  for (let i = 0; i < ring.length; i += 1) {
    segments.push([ringStart + i, ringStart + ((i + 1) % ring.length)]);
  }

  const nodeCount = nodes.length;
  const nodePosition = new Float32Array(nodeCount * 3);
  const nodeScatter = new Float32Array(nodeCount * 3);
  const nodeSeed = new Float32Array(nodeCount);
  const nodeSize = new Float32Array(nodeCount);
  const nodeBright = new Float32Array(nodeCount);

  for (let i = 0; i < nodeCount; i += 1) {
    const i3 = i * 3;
    nodePosition[i3] = nodes[i].x;
    nodePosition[i3 + 1] = nodes[i].y;
    nodePosition[i3 + 2] = rand(-0.06, 0.06);

    nodeScatter[i3] = gaussian() * 7;
    nodeScatter[i3 + 1] = gaussian() * 4.4;
    nodeScatter[i3 + 2] = gaussian() * 1.6;

    nodeSeed[i] = Math.random();
    nodeSize[i] = rand(0.05, 0.13);
    nodeBright[i] = rand(0.85, 1.7);
  }

  const segCount = segments.length;
  const segFrom = new Float32Array(segCount * 2 * 3);
  const segTo = new Float32Array(segCount * 2 * 3);
  const segOrder = new Float32Array(segCount * 2);
  const segSeed = new Float32Array(segCount * 2);

  segments.forEach(([fromIdx, toIdx], s) => {
    const from = nodes[fromIdx];
    const to = nodes[toIdx];
    const order = fromIdx / Math.max(1, nodeCount - 1);
    const base = s * 6;

    // vertex 0: stays anchored on "from"
    segFrom[base] = from.x;
    segFrom[base + 1] = from.y;
    segFrom[base + 2] = 0;
    segTo[base] = from.x;
    segTo[base + 1] = from.y;
    segTo[base + 2] = 0;

    // vertex 1: grows from "from" to "to"
    segFrom[base + 3] = from.x;
    segFrom[base + 4] = from.y;
    segFrom[base + 5] = 0;
    segTo[base + 3] = to.x;
    segTo[base + 4] = to.y;
    segTo[base + 5] = 0;

    segOrder[s * 2] = order;
    segOrder[s * 2 + 1] = order;
    segSeed[s * 2] = Math.random();
    segSeed[s * 2 + 1] = Math.random();
  });

  return {
    nodeCount,
    nodePosition,
    nodeScatter,
    nodeSeed,
    nodeSize,
    nodeBright,
    segFrom,
    segTo,
    segOrder,
    segSeed,
  };
}
