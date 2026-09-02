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

let shotAudio = false;

export function setShotAudio(on: boolean) {
  shotAudio = on;
}

export function playShot() {
  if (!shotAudio) return;
  const now = performance.now();
  if (now < shotBusyUntil) return;
  shotBusyUntil = now + 90;

  try {
    const ac = getAudio();
    if (!ac) return;
    if (ac.state === "suspended") void ac.resume();
    const t0 = ac.currentTime;

    const chirp = ac.createOscillator();
    const chirpGain = ac.createGain();
    chirp.type = "sine";
    chirp.frequency.setValueAtTime(1240, t0);
    chirp.frequency.exponentialRampToValueAtTime(420, t0 + 0.14);
    chirpGain.gain.setValueAtTime(0.05, t0);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    chirp.connect(chirpGain);
    chirpGain.connect(ac.destination);
    chirp.onended = () => disconnect(chirp, chirpGain);
    chirp.start(t0);
    chirp.stop(t0 + 0.17);

    const over = ac.createOscillator();
    const overGain = ac.createGain();
    over.type = "triangle";
    over.frequency.setValueAtTime(2480, t0);
    over.frequency.exponentialRampToValueAtTime(880, t0 + 0.09);
    overGain.gain.setValueAtTime(0.018, t0);
    overGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
    over.connect(overGain);
    overGain.connect(ac.destination);
    over.onended = () => disconnect(over, overGain);
    over.start(t0);
    over.stop(t0 + 0.11);

    const src = ac.createBufferSource();
    src.buffer = getNoise(ac);
    const noiseGain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1800, t0);
    noiseGain.gain.setValueAtTime(0.04, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    src.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ac.destination);
    src.onended = () => disconnect(src, filter, noiseGain);
    src.start(t0);
  } catch {
    // Audio must never stall the render loop.
  }
}
