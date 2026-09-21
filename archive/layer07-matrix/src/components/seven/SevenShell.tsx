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
import { AsciiFace } from "./AsciiFace";
import {
  bootLines,
  completeToken,
  isSysPanel,
  runCommand,
  SYS_PANELS,
  type SevenAttach,
  type SevenProcess,
  type SevenSysPanel,
  type ShellLine,
} from "./commands";
import { setDeckOpen } from "./deck";
import { cn } from "@/lib/cn";
import { SITE, whatsappUrl } from "@/lib/site";

export type SevenShellHandle = {
  focus: () => void;
};

type Props = {
  processes: SevenProcess[];
  onFocusChange?: (focused: boolean) => void;
  onClose?: () => void;
  reducedMotion?: boolean;
};

export const SevenShell = forwardRef<SevenShellHandle, Props>(
  function SevenShell({ processes, onFocusChange, onClose, reducedMotion = false }, ref) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const idRef = useRef(3);
    const [value, setValue] = useState("");
    const [lines, setLines] = useState<ShellLine[]>(() => bootLines(0));
    const [history, setHistory] = useState<string[]>([]);
    const [histIndex, setHistIndex] = useState(-1);
    const [attached, setAttached] = useState<SevenAttach | null>(null);

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
        router.push("/");
        return;
      }
      if (result.deck) setDeckOpen(true);
      if (result.clear) {
        idRef.current = 3;
        setLines(bootLines(0));
        setAttached(null);
      } else if (result.attached) {
        idRef.current += result.lines.length;
        setLines((prev) => [...prev, ...result.lines]);
        setAttached(result.attached);
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

    function attach(node: SevenAttach) {
      submit(`open ${node.slug}`);
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
      <div className="pointer-events-none flex h-full min-h-0 flex-col overflow-hidden border border-dashed border-[#00ff66]/35 bg-black/70">
        <div className="flex shrink-0 items-center gap-2 border-b border-dashed border-[#00ff66]/35 px-2 py-1.5">
          <button
            type="button"
            data-shot-ui
            data-no-shot
            onClick={onClose}
            aria-label="Cerrar NAVI"
            title="close"
            className="grid size-[15px] shrink-0 place-items-center border border-[#111] bg-[#cfcfcf] font-mono text-[10px] leading-none font-bold text-[#1a1a1a] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#6a6a6a] hover:bg-[#e8e8e8] active:shadow-[inset_1px_1px_0_#6a6a6a,inset_-1px_-1px_0_#fff]"
          >
            ×
          </button>
          <span
            className="h-[7px] min-w-4 flex-1 bg-[repeating-linear-gradient(to_bottom,#00ff66_0_1px,transparent_1px_2px)] opacity-35"
            aria-hidden
          />
          <span className="truncate font-mono text-[11px] text-[#94a3b8]">
            NAVI · guest@layer07 ~ /seven
          </span>
          <span
            className="h-[7px] min-w-4 flex-1 bg-[repeating-linear-gradient(to_bottom,#00ff66_0_1px,transparent_1px_2px)] opacity-35"
            aria-hidden
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-rows-none lg:grid-cols-[minmax(16rem,40%)_minmax(0,1fr)]">
          <section
            aria-label="Retrato ASCII"
            className="flex min-h-0 flex-col overflow-hidden border-b border-dashed border-[#00ff66]/25 lg:h-full lg:border-r lg:border-b-0"
          >
            <p className="shrink-0 px-4 pt-3 font-mono text-[12px] text-[#e2e8f0]">
              Welcome, visitor.
            </p>
            <div className="relative h-44 shrink-0 sm:h-52 lg:h-auto lg:min-h-0 lg:flex-1">
              <AsciiFace reducedMotion={reducedMotion} />
            </div>
            <p className="shrink-0 border-t border-dashed border-[#00ff66]/20 px-4 py-3 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-[#94a3b8] uppercase">
              Full Stack Engineer · Santiago, CL
              <span className="mt-1 block text-[#00f0ff]/70 normal-case tracking-normal">
                present in the Wired
              </span>
            </p>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden px-3 pt-2 sm:px-4">
            <p className="shrink-0 font-mono text-[10px] tracking-[0.32em] text-[#00f0ff] uppercase">
              APPLICATION // NAVI
            </p>
            <p className="mt-0.5 shrink-0 font-mono text-[10px] tracking-[0.18em] text-[#94a3b8] uppercase">
              {SYS_PANELS.length} sys · {processes.length} processes · click
            </p>

            <div
              data-shot-ui
              className="mt-3 grid shrink-0 grid-cols-3 gap-1.5"
            >
              {SYS_PANELS.map((panel) => {
                const active = attached?.pid === panel.pid;
                return (
                  <button
                    key={panel.pid}
                    type="button"
                    onClick={() => attach(panel)}
                    className={cn(
                      "min-w-0 border px-2 py-1.5 text-left font-mono transition-colors",
                      active
                        ? "border-[#00f0ff]/55 bg-[#00f0ff]/10"
                        : "border-white/10 bg-black/25 hover:border-[#00f0ff]/40 hover:bg-white/5",
                    )}
                  >
                    <span className="block text-[9px] tracking-[0.22em] text-[#00f0ff]">
                      SYS
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-white">
                      {panel.title}
                    </span>
                    <span className="mt-0.5 hidden truncate text-[9px] text-[#64748b] sm:block">
                      {panel.pid} · {panel.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden border border-dashed border-white/15 bg-black/30">
              <ul
                data-shot-ui
                className="seven-scroll min-h-0 flex-1 space-y-1 overflow-y-auto p-2"
              >
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

              <div
                data-shot-ui
                className="seven-scroll max-h-[calc(42%+18px)] shrink-0 overflow-y-auto border-t border-dashed border-[#00ff66]/25 p-3 sm:p-4"
              >
                {attached ? (
                  isSysPanel(attached) ? (
                    <SysInspector panel={attached} />
                  ) : (
                    <ProcessInspector process={attached} />
                  )
                ) : (
                  <p className="font-mono text-[12px] leading-relaxed text-[#64748b]">
                    SYS primero — operator, stack, contact — o un proceso.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div
          ref={logRef}
          className="h-28 shrink-0 overflow-y-auto border-t border-dashed border-[#00ff66]/25 px-4 py-3 font-mono text-[11px] leading-relaxed [scrollbar-width:none] sm:h-32 [&::-webkit-scrollbar]:hidden"
          aria-live="polite"
        >
          {lines.map((line) => (
            <LogLine key={`${line.id}:${line.href ?? line.text}`} line={line} />
          ))}
        </div>

        <form
          className="flex shrink-0 items-center gap-2 border-t border-dashed border-[#00ff66]/35 px-4 py-2 font-mono text-[12px] sm:text-[13px]"
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

function SysInspector({ panel }: { panel: SevenSysPanel }) {
  return (
    <div className="flex min-h-0 flex-col">
      <p className="font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
        pid {panel.pid} · SYS · {panel.hint}
      </p>
      {panel.slug === "operator" ? <OperatorBody /> : null}
      {panel.slug === "stack" ? <StackBody /> : null}
      {panel.slug === "contact" ? <ContactBody /> : null}
    </div>
  );
}

function OperatorBody() {
  return (
    <>
      <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {SITE.founder.name}
      </h2>
      <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
        {SITE.founder.role} · {SITE.founder.years} yrs · {SITE.location}
      </p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#cbd5e1]">
        Product Engineer independiente. Un lead que cubre UI, backend, datos y
        cloud — sistemas que salen a producción, no demos. Base en Santiago,
        delivery remoto LatAm.
      </p>
      <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] tracking-widest uppercase">
        <Link
          href={SITE.social.github}
          target="_blank"
          rel="noreferrer"
          className="text-[#00f0ff] hover:text-white"
        >
          GitHub →
        </Link>
        <Link
          href={SITE.social.linkedin}
          target="_blank"
          rel="noreferrer"
          className="text-[#94a3b8] hover:text-white"
        >
          LinkedIn →
        </Link>
      </div>
    </>
  );
}

function StackBody() {
  const lines = [
    "Sistemas a medida — POS, dashboards, portales B2B",
    "Headless commerce — Next.js, Shopify, WooCommerce",
    "Integraciones — APIs, CMS, pagos, WhatsApp",
  ];

  return (
    <>
      <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
        Qué puedo construir
      </h2>
      <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
        software · commerce · APIs · el cliente es dueño del código
      </p>
      <ul className="mt-3 space-y-1 text-sm leading-relaxed text-[#cbd5e1]">
        {lines.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10px] tracking-wide text-[#64748b]">
        discovery → arquitectura → build → deploy + SLA
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SITE.founder.stack.map((tech) => (
          <span
            key={tech}
            className="border border-[#00f0ff]/25 px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#00f0ff] uppercase"
          >
            {tech}
          </span>
        ))}
      </div>
    </>
  );
}

function ContactBody() {
  return (
    <>
      <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
        Handshake
      </h2>
      <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
        {SITE.location} · horario hábil · trae objetivo, stack y deadline
      </p>
      <ul className="mt-3 space-y-1.5 font-mono text-[12px] text-[#cbd5e1]">
        <li>
          <Link href={`mailto:${SITE.email}`} className="text-[#00f0ff] hover:text-white">
            {SITE.email}
          </Link>
        </li>
        <li>
          <Link href={`tel:${SITE.phone}`} className="hover:text-white">
            {SITE.phoneDisplay}
          </Link>
        </li>
        <li>
          <Link
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
            className="text-[#00ff66] hover:text-white"
          >
            WhatsApp →
          </Link>
        </li>
      </ul>
      <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] tracking-widest uppercase">
        <Link href="/contacto" className="text-[#00f0ff] hover:text-white">
          Formulario →
        </Link>
        <Link
          href={SITE.social.github}
          target="_blank"
          rel="noreferrer"
          className="text-[#94a3b8] hover:text-white"
        >
          GitHub →
        </Link>
        <Link
          href={SITE.social.linkedin}
          target="_blank"
          rel="noreferrer"
          className="text-[#94a3b8] hover:text-white"
        >
          LinkedIn →
        </Link>
      </div>
    </>
  );
}

function ProcessInspector({ process }: { process: SevenProcess }) {
  return (
    <div className="flex min-h-0 flex-col">
      <p className="font-mono text-[10px] tracking-[0.28em] text-[#00f0ff] uppercase">
        pid {process.pid} · {process.status}
      </p>
      <h2 className="mt-1 font-sans text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {process.title}
      </h2>
      <p className="mt-0.5 font-mono text-[11px] text-[#94a3b8]">
        {process.client} · {process.year} · {process.category}
      </p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#cbd5e1]">
        {process.excerpt}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {process.stack.map((tech) => (
          <span
            key={tech}
            className="border border-[#00ff66]/25 px-2 py-0.5 font-mono text-[10px] tracking-wider text-[#00ff66] uppercase"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] tracking-widest uppercase">
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
