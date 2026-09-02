"use client";

import Link from "next/link";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  bootLines,
  completeToken,
  runCommand,
  type SevenProcess,
  type ShellLine,
} from "./commands";
import { cn } from "@/lib/cn";

export type SevenShellHandle = {
  focus: () => void;
};

type Props = {
  processes: SevenProcess[];
  onFocusChange?: (focused: boolean) => void;
};

export const SevenShell = forwardRef<SevenShellHandle, Props>(
  function SevenShell({ processes, onFocusChange }, ref) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const idRef = useRef(2);
    const [value, setValue] = useState("");
    const [lines, setLines] = useState<ShellLine[]>(() => bootLines(0));
    const [history, setHistory] = useState<string[]>([]);
    const [histIndex, setHistIndex] = useState(-1);
    const [attached, setAttached] = useState<SevenProcess | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    useEffect(() => {
      const node = logRef.current;
      if (!node) return;
      node.scrollTop = node.scrollHeight;
    }, [lines]);

    const suggestion = completeToken(value, processes);
    const showHint =
      suggestion.length > 0 && suggestion !== value.trimStart();

    function submit(raw: string) {
      const result = runCommand(raw, processes, idRef.current);
      if (result.exit) {
        router.push("/labs");
        return;
      }
      if (result.clear) {
        idRef.current = 2;
        setLines(bootLines(0));
        setAttached(null);
      } else if (result.lines.length > 0) {
        idRef.current += result.lines.length;
        setLines((prev) => [...prev, ...result.lines]);
      }
      if (result.attached) setAttached(result.attached);
      if (raw.trim()) {
        setHistory((prev) =>
          prev[prev.length - 1] === raw.trim() ? prev : [...prev, raw.trim()],
        );
      }
      setHistIndex(-1);
      setValue("");
      if (inputRef.current) inputRef.current.value = "";
    }

    function attach(proc: SevenProcess) {
      submit(`open ${proc.slug}`);
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === "Tab") {
        event.preventDefault();
        if (showHint) setValue(suggestion);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (history.length === 0) return;
        const next =
          histIndex < 0 ? history.length - 1 : Math.max(0, histIndex - 1);
        setHistIndex(next);
        setValue(history[next] ?? "");
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (histIndex < 0) return;
        const next = histIndex + 1;
        if (next >= history.length) {
          setHistIndex(-1);
          setValue("");
          return;
        }
        setHistIndex(next);
        setValue(history[next] ?? "");
      }
    }

    return (
      <div className="pointer-events-none flex h-full min-h-0 flex-col px-4 pt-16 pb-3 sm:px-6">
        <p className="font-mono text-[10px] tracking-[0.32em] text-[#00f0ff] uppercase">
          APPLICATION // TTY0
        </p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-[#94a3b8] uppercase">
          {processes.length} processes · click to attach · or type
        </p>

        <div className="mt-4 grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(16rem,20rem)_1fr]">
          <ul data-shot-ui className="max-h-44 space-y-1 overflow-y-auto md:max-h-none">
            {processes.map((proc) => {
              const active = attached?.pid === proc.pid;
              return (
                <li key={proc.pid}>
                  <button
                    type="button"
                    onClick={() => attach(proc)}
                    className={cn(
                      "flex w-full items-baseline gap-3 border px-3 py-2 text-left font-mono transition-colors",
                      active
                        ? "border-[#00ff66]/50 bg-[#00ff66]/10"
                        : "border-white/10 bg-black/25 hover:border-[#00f0ff]/40 hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "w-10 shrink-0 text-[10px] tracking-widest",
                        proc.status === "LIVE"
                          ? "text-[#00ff66]"
                          : "text-[#64748b]",
                      )}
                    >
                      {proc.status}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] text-white">
                        {proc.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-[#64748b]">
                        {proc.pid} · {proc.slug}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div data-shot-ui className="flex min-h-0 flex-col border border-white/10 bg-black/30">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {attached ? (
                <ProcessInspector process={attached} />
              ) : (
                <p className="font-mono text-[12px] leading-relaxed text-[#64748b]">
                  Selecciona un proceso a la izquierda, o escribe{" "}
                  <span className="text-[#00ff66]">open chanchi</span>.
                </p>
              )}
            </div>
            <div
              ref={logRef}
              className="max-h-28 overflow-y-auto border-t border-white/10 px-4 py-2 font-mono text-[11px] leading-relaxed sm:max-h-32"
              aria-live="polite"
            >
              {lines.map((line) => (
                <LogLine key={line.id} line={line} />
              ))}
            </div>
          </div>
        </div>

        <form
          className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 font-mono text-[12px] sm:text-[13px]"
          data-shot-ui
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            submit(String(data.get("command") ?? value));
          }}
        >
          <label htmlFor="seven-tty" className="shrink-0 text-[#00ff66]">
            guest@layer07:~/seven$
          </label>
          <div className="relative min-w-0 flex-1">
            {showHint ? (
              <span
                className="pointer-events-none absolute inset-y-0 left-0 truncate text-[#334155]"
                aria-hidden
              >
                {suggestion}
              </span>
            ) : null}
            <input
              ref={inputRef}
              id="seven-tty"
              name="command"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setHistIndex(-1);
              }}
              onKeyDown={onKeyDown}
              onFocus={() => onFocusChange?.(true)}
              onBlur={() => onFocusChange?.(false)}
              className="relative w-full bg-transparent text-[#e2e8f0] caret-[#00ff66] outline-none cursor-text"
              aria-label="Comando SEVEN"
              placeholder="help"
            />
          </div>
        </form>
      </div>
    );
  },
);

function ProcessInspector({ process }: { process: SevenProcess }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
        pid {process.pid} · {process.status}
      </p>
      <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {process.title}
      </h2>
      <p className="mt-1 font-mono text-[11px] text-[#94a3b8]">
        {process.client} · {process.year} · {process.category}
      </p>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#cbd5e1]">
        {process.excerpt}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {process.stack.map((tech) => (
          <span
            key={tech}
            className="border border-[#00ff66]/25 px-2 py-1 font-mono text-[10px] tracking-wider text-[#00ff66] uppercase"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 font-mono text-[11px] tracking-widest uppercase">
        {process.liveUrl ? (
          <Link
            href={process.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#00f0ff] hover:text-white"
          >
            Live →
          </Link>
        ) : null}
        {process.repoUrl ? (
          <Link
            href={process.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[#94a3b8] hover:text-white"
          >
            Repo →
          </Link>
        ) : null}
        <Link
          href={`/portafolio/${process.slug}`}
          className="text-[#94a3b8] hover:text-white"
        >
          Case →
        </Link>
      </div>
    </div>
  );
}

function LogLine({ line }: { line: ShellLine }) {
  const color =
    line.tone === "in"
      ? "text-[#00ff66]"
      : line.tone === "err"
        ? "text-[#ff0055]"
        : line.tone === "ok"
          ? "text-[#00f0ff]"
          : line.tone === "dim"
            ? "text-[#64748b]"
            : "text-[#94a3b8]";

  if (line.href) {
    const external = line.href.startsWith("http");
    return (
      <p className={`${color} whitespace-pre-wrap`}>
        <Link
          href={line.href}
          className="underline decoration-[#00ff66]/30 underline-offset-2 hover:text-white"
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {line.text}
        </Link>
      </p>
    );
  }

  return <p className={`${color} whitespace-pre-wrap`}>{line.text}</p>;
}
