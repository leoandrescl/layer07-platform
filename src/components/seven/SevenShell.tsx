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
      } else if (result.lines.length > 0) {
        idRef.current += result.lines.length;
        setLines((prev) => [...prev, ...result.lines]);
      }
      if (raw.trim()) {
        setHistory((prev) =>
          prev[prev.length - 1] === raw.trim() ? prev : [...prev, raw.trim()],
        );
      }
      setHistIndex(-1);
      setValue("");
      if (inputRef.current) inputRef.current.value = "";
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
      <div className="flex h-full min-h-0 flex-col px-4 pt-16 pb-4 sm:px-6">
        <p className="font-mono text-[10px] tracking-[0.32em] text-[#00f0ff] uppercase">
          APPLICATION // TTY0
        </p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-[#94a3b8] uppercase">
          {processes.length} processes · status 200 · node scl
        </p>

        <div
          ref={logRef}
          className="mt-5 min-h-0 flex-1 overflow-y-auto font-mono text-[12px] leading-relaxed sm:text-[13px]"
          aria-live="polite"
        >
          {lines.map((line) => {
            const color =
              line.tone === "in"
                ? "text-[#00ff66]"
                : line.tone === "err"
                  ? "text-[#ff0055]"
                  : line.tone === "ok"
                    ? "text-[#00f0ff]"
                    : line.tone === "dim"
                      ? "text-[#64748b]"
                      : "text-[#e2e8f0]";

            if (line.href) {
              const external = line.href.startsWith("http");
              return (
                <p key={line.id} className={`${color} whitespace-pre-wrap`}>
                  <Link
                    href={line.href}
                    className="underline decoration-[#00ff66]/40 underline-offset-2 hover:text-white"
                    {...(external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                  >
                    {line.text}
                  </Link>
                </p>
              );
            }

            return (
              <p key={line.id} className={`${color} whitespace-pre-wrap`}>
                {line.text}
              </p>
            );
          })}
        </div>

        <form
          className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 font-mono text-[12px] sm:text-[13px]"
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
            />
          </div>
        </form>
      </div>
    );
  },
);
