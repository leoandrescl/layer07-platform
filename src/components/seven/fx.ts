export type ShotHit = {
  x: number;
  y: number;
  t: number;
  power: number;
};

export const HIT_MAX = 4;
export const HIT_LIFE = 1.15;
export const FIRE_GAP_MS = 140;

const UI_SHOT_BLOCK =
  "a, button, input, textarea, label, select, [data-no-shot], [role='button']";

export function isUiTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(UI_SHOT_BLOCK));
}

export function pruneHits(hits: ShotHit[], now: number) {
  const oldest = now - HIT_LIFE * 1000;
  while (hits.length > 0 && hits[0]!.t < oldest) hits.shift();
  if (hits.length > HIT_MAX) hits.splice(0, hits.length - HIT_MAX);
}

let audioCtx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let shotBusyUntil = 0;

function getAudio() {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  return audioCtx;
}

function getNoise(ac: AudioContext) {
  if (noise) return noise;
  const length = Math.max(1, Math.floor(ac.sampleRate * 0.04));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const fall = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fall * fall;
  }
  noise = buffer;
  return noise;
}

function disconnect(...nodes: AudioNode[]) {
  for (let i = 0; i < nodes.length; i += 1) {
    try {
      nodes[i]!.disconnect();
    } catch {
      // already disconnected
    }
  }
}

export function playShot() {
  const now = performance.now();
  if (now < shotBusyUntil) return;
  shotBusyUntil = now + 90;

  try {
    const ac = getAudio();
    if (!ac) return;
    if (ac.state === "suspended") void ac.resume();
    const t0 = ac.currentTime;

    const thump = ac.createOscillator();
    const thumpGain = ac.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(170, t0);
    thump.frequency.exponentialRampToValueAtTime(48, t0 + 0.07);
    thumpGain.gain.setValueAtTime(0.16, t0);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
    thump.connect(thumpGain);
    thumpGain.connect(ac.destination);
    thump.onended = () => disconnect(thump, thumpGain);
    thump.start(t0);
    thump.stop(t0 + 0.09);

    const src = ac.createBufferSource();
    src.buffer = getNoise(ac);
    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.22, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.045);
    src.connect(noiseGain);
    noiseGain.connect(ac.destination);
    src.onended = () => disconnect(src, noiseGain);
    src.start(t0);
  } catch {
    // Audio must never stall the render loop.
  }
}
