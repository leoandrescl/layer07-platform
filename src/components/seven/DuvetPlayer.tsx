"use client";

import { useEffect, useRef, useState } from "react";
import {
  TRACKS,
  getDeck,
  setDeckOpen,
  setDeckPlaying,
  setDeckTrack,
  subscribeDeck,
  type TrackId,
} from "./deck";

function fmt(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DuvetPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(() => getDeck().open);
  const [trackId, setTrackId] = useState<TrackId>(getDeck().trackId);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const active = TRACKS.find((track) => track.id === trackId) ?? TRACKS[0];

  useEffect(() => {
    return subscribeDeck((state) => setOpen(state.open));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.62;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setDeckPlaying(false);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => {
      setPlaying(true);
      setDeckPlaying(true);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.pause();
      setDeckPlaying(false);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  function load(id: TrackId, autoplay: boolean) {
    const audio = audioRef.current;
    const track = TRACKS.find((item) => item.id === id);
    if (!audio || !track) return;
    setTrackId(id);
    setDeckTrack(id);
    setCurrent(0);
    setDuration(0);
    audio.src = track.src;
    audio.load();
    if (autoplay) void audio.play();
    else {
      audio.pause();
      setDeckPlaying(false);
    }
  }

  function select(id: TrackId) {
    if (id === trackId) return;
    load(id, playing);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      return;
    }
    audio.pause();
    setDeckPlaying(false);
  }

  return (
    <div data-no-shot data-shot-ui>
      <audio ref={audioRef} src={active.src} preload="metadata" playsInline />
      {!open ? (
        <button
          type="button"
          data-no-shot
          onClick={() => setDeckOpen(true)}
          aria-expanded={false}
          aria-label="Mostrar deck"
          className="border border-dashed border-[#00ff66]/40 bg-black/75 px-2.5 py-1.5 font-mono text-[9px] tracking-[0.28em] text-[#00ff66] uppercase backdrop-blur-[2px] hover:bg-[#00ff66]/10"
        >
          {playing ? "> DECK" : "DECK"}
        </button>
      ) : (
        <div className="w-[228px] border border-dashed border-[#00ff66]/40 bg-black/75 px-3 py-2 font-mono text-[#00ff66] backdrop-blur-[2px] sm:w-[248px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-no-shot
              onClick={toggle}
              aria-label={playing ? "Pausar" : "Reproducir"}
              className="grid size-7 shrink-0 place-items-center border border-[#00ff66]/50 text-[11px] leading-none hover:bg-[#00ff66]/10"
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <p className="min-w-0 flex-1 truncate text-[9px] tracking-[0.28em] text-[#94a3b8] uppercase">
              NAVI // DECK
            </p>
            <button
              type="button"
              data-no-shot
              onClick={() => setDeckOpen(false)}
              aria-expanded={true}
              aria-label="Ocultar deck"
              className="grid size-7 shrink-0 place-items-center border border-[#00ff66]/50 text-[14px] leading-none hover:bg-[#00ff66]/10"
            >
              <span className="-mt-px">×</span>
            </button>
          </div>
          <ul className="mt-2 space-y-0.5">
            {TRACKS.map((track, index) => {
              const selected = track.id === trackId;
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    data-no-shot
                    onClick={() => select(track.id)}
                    className={`flex w-full items-baseline gap-2 text-left text-[10px] tracking-[0.14em] uppercase ${
                      selected
                        ? "text-[#00ff66]"
                        : "text-[#64748b] hover:text-[#94a3b8]"
                    }`}
                  >
                    <span className="w-3 shrink-0 text-[9px]">
                      {selected && playing
                        ? ">"
                        : String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{track.title}</span>
                    <span className="shrink-0 text-[9px] font-normal normal-case tracking-normal text-[#64748b]">
                      {track.artist}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <label className="mt-2 block">
            <span className="sr-only">Posición del tema</span>
            <input
              type="range"
              data-no-shot
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              disabled={duration <= 0}
              onChange={(event) => {
                const audio = audioRef.current;
                if (!audio) return;
                const next = Number(event.target.value);
                audio.currentTime = next;
                setCurrent(next);
              }}
              className="h-1 w-full cursor-pointer appearance-none bg-[#00ff66]/20 accent-[#00ff66] disabled:cursor-default"
            />
          </label>
          <p className="mt-1 text-[9px] tracking-widest text-[#64748b]">
            {fmt(current)} / {fmt(duration)}
          </p>
        </div>
      )}
    </div>
  );
}
