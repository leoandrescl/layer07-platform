export type ShotHit = {
  x: number;
  y: number;
  t: number;
  power: number;
};

export const HIT_MAX = 8;
export const HIT_LIFE = 1.65;
export const FIRE_GAP_MS = 108;

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

function getAudio() {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function noiseBuffer(ac: AudioContext, seconds: number) {
  const length = Math.max(1, Math.floor(ac.sampleRate * seconds));
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const fall = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fall * fall;
  }
  return buffer;
}

export function playShot() {
  const ac = getAudio();
  if (!ac) return;
  const t0 = ac.currentTime;

  const thump = ac.createOscillator();
  const thumpGain = ac.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(190, t0);
  thump.frequency.exponentialRampToValueAtTime(42, t0 + 0.09);
  thumpGain.gain.setValueAtTime(0.2, t0);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.11);
  thump.connect(thumpGain);
  thumpGain.connect(ac.destination);
  thump.start(t0);
  thump.stop(t0 + 0.12);

  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 0.055);
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1650;
  band.Q.value = 0.85;
  const noiseGain = ac.createGain();
  noiseGain.gain.setValueAtTime(0.32, t0);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
  src.connect(band);
  band.connect(noiseGain);
  noiseGain.connect(ac.destination);
  src.start(t0);

  const click = ac.createOscillator();
  const clickGain = ac.createGain();
  click.type = "square";
  click.frequency.setValueAtTime(2650, t0);
  click.frequency.exponentialRampToValueAtTime(380, t0 + 0.028);
  clickGain.gain.setValueAtTime(0.045, t0);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
  click.connect(clickGain);
  clickGain.connect(ac.destination);
  click.start(t0);
  click.stop(t0 + 0.035);
}
