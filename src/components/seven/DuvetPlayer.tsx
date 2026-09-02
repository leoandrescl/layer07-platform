"use client";

import { useEffect, useRef, useState } from "react";

const SRC = "/seven/duvet.mp3";

function fmt(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DuvetPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.62;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  return (
    <div
      data-no-shot
      data-shot-ui
      className="w-[220px] border border-dashed border-[#00ff66]/40 bg-black/75 px-3 py-2 font-mono text-[#00ff66] backdrop-blur-[2px] sm:w-[240px]"
    >
      <audio ref={audioRef} src={SRC} preload="metadata" playsInline />
      <div className="flex items-center gap-2">
        <button
          type="button"
          data-no-shot
          onClick={toggle}
          aria-label={playing ? "Pausar Duvet" : "Reproducir Duvet"}
          className="grid size-7 shrink-0 place-items-center border border-[#00ff66]/50 text-[11px] leading-none hover:bg-[#00ff66]/10"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] tracking-[0.22em] uppercase">
            Duvet
            <span className="ml-1.5 text-[#94a3b8] normal-case tracking-normal">
              bôa
            </span>
          </p>
          <p className="mt-0.5 text-[9px] tracking-widest text-[#64748b]">
            {fmt(current)} / {fmt(duration)}
          </p>
        </div>
      </div>
      <label className="mt-2 block">
        <span className="sr-only">Posición de Duvet</span>
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
    </div>
  );
}
