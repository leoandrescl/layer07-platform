export const TRACKS = [
  {
    id: "duvet",
    title: "Duvet",
    artist: "bôa",
    src: "/seven/duvet.mp3",
    lockFace: false,
  },
  {
    id: "track-44",
    title: "Track 44",
    artist: "cyberia",
    src: "/seven/track-44.mp3",
    lockFace: true,
  },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];

type DeckState = {
  trackId: TrackId;
  playing: boolean;
  open: boolean;
};

type Listener = (state: DeckState) => void;

let trackId: TrackId = "duvet";
let playing = false;
let open = false;
const listeners = new Set<Listener>();

export function getDeck(): DeckState {
  return { trackId, playing, open };
}

export function subscribeDeck(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  const state = getDeck();
  listeners.forEach((listener) => listener(state));
}

export function setDeckTrack(id: TrackId) {
  if (trackId === id) return;
  trackId = id;
  emit();
}

export function setDeckPlaying(on: boolean) {
  if (playing === on) return;
  playing = on;
  emit();
}

export function setDeckOpen(on: boolean) {
  if (open === on) return;
  open = on;
  emit();
}

export function isFaceLocked(state: DeckState = getDeck()) {
  const track = TRACKS.find((item) => item.id === state.trackId);
  return Boolean(state.playing && track?.lockFace);
}
