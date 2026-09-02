import {
  CATEGORY_LABELS,
  type Project,
} from "@/lib/data/content";
import { SITE, whatsappUrl } from "@/lib/site";

export type SevenProcess = {
  pid: number;
  slug: string;
  title: string;
  client: string;
  category: string;
  year: number;
  excerpt: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  status: "LIVE" | "IDLE";
};

export type ShellLine = {
  id: number;
  tone: "in" | "out" | "err" | "dim" | "ok";
  text: string;
  href?: string;
};

export const COMMANDS = [
  "help",
  "ps",
  "ls",
  "open",
  "cat",
  "whoami",
  "stack",
  "contact",
  "github",
  "linkedin",
  "layers",
  "clear",
  "exit",
] as const;

export function toProcesses(projects: Project[]): SevenProcess[] {
  return projects.map((project, index) => ({
    pid: 1001 + index,
    slug: project.slug,
    title: project.title,
    client: project.client,
    category: CATEGORY_LABELS[project.category],
    year: project.year,
    excerpt: project.excerpt,
    stack: project.stack,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    status: project.liveUrl ? "LIVE" : "IDLE",
  }));
}

export function bootLines(count: number): ShellLine[] {
  return [
    {
      id: count,
      tone: "ok",
      text: "attached  LAYER 07 / APPLICATION  ·  session guest",
    },
    {
      id: count + 1,
      tone: "dim",
      text: "click a process     type help     / to focus",
    },
  ];
}

function matchesProcess(proc: SevenProcess, query: string) {
  const q = query.toLowerCase();
  return (
    proc.slug.toLowerCase().includes(q) ||
    proc.title.toLowerCase().includes(q) ||
    proc.client.toLowerCase().includes(q) ||
    String(proc.pid) === q
  );
}

export function completeToken(buffer: string, processes: SevenProcess[]) {
  const trimmed = buffer.trimStart();
  const parts = trimmed.split(/\s+/);
  const endsWithSpace = /\s$/.test(buffer);

  if (parts.length <= 1 && !endsWithSpace) {
    const prefix = parts[0] ?? "";
    return COMMANDS.find((cmd) => cmd.startsWith(prefix)) ?? "";
  }

  const cmd = parts[0];
  if (cmd === "open" || cmd === "cat") {
    const prefix = endsWithSpace ? "" : (parts[1] ?? "");
    const hit = processes.find(
      (proc) =>
        proc.slug.startsWith(prefix) || proc.slug.includes(prefix),
    );
    if (!hit) return "";
    return `${cmd} ${hit.slug}`;
  }

  return "";
}

export function runCommand(
  raw: string,
  processes: SevenProcess[],
  nextId: number,
): {
  lines: ShellLine[];
  clear?: boolean;
  exit?: boolean;
  attached?: SevenProcess | null;
} {
  const input = raw.trim();
  if (!input) return { lines: [] };

  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(" ");
  const echo: ShellLine = {
    id: nextId,
    tone: "in",
    text: `guest@layer07:~/seven$ ${input}`,
  };
  let id = nextId + 1;

  const out = (text: string, tone: ShellLine["tone"] = "out"): ShellLine => {
    const line = { id, tone, text };
    id += 1;
    return line;
  };
  const link = (text: string, href: string): ShellLine => {
    const line = { id, tone: "ok" as const, text, href };
    id += 1;
    return line;
  };

  switch (cmd) {
    case "help":
    case "man":
      return {
        lines: [
          echo,
          out("commands", "dim"),
          out("  click a process      same as open"),
          out("  help                 this list"),
          out("  ps | ls              processes on layer 07"),
          out("  open | cat <name>    attach a process"),
          out("  whoami               operator"),
          out("  stack                runtime"),
          out("  contact              handshake"),
          out("  github | linkedin    net"),
          out("  layers               osi map"),
          out("  clear                reset tty"),
          out("  exit                 /labs"),
        ],
      };
    case "ps":
    case "ls":
    case "processes":
      return {
        lines: [
          echo,
          out(
            `${pad("PID", 6)} ${pad("STAT", 6)} ${pad("PROCESS", 28)} TYPE`,
            "dim",
          ),
          ...processes.map((proc) =>
            out(
              `${pad(String(proc.pid), 6)} ${pad(proc.status, 6)} ${pad(proc.slug, 28)} ${proc.category}`,
            ),
          ),
          out(`${processes.length} processes  ·  open <slug>`, "dim"),
        ],
      };
    case "whoami":
      return {
        lines: [
          echo,
          out(`${SITE.founder.name}`),
          out(`${SITE.founder.role}  ·  ${SITE.founder.years} yrs  ·  ${SITE.location}`),
          out("uid=1000(leonardo)  gid=layer07  tty=seven"),
        ],
      };
    case "stack":
      return {
        lines: [
          echo,
          out(SITE.founder.stack.join("  ·  ")),
          out("runtime  next.js 16  ·  webgl rain  ·  osi layer 07", "dim"),
        ],
      };
    case "contact":
      return {
        lines: [
          echo,
          link(SITE.email, `mailto:${SITE.email}`),
          link(SITE.phoneDisplay, `tel:${SITE.phone}`),
          link("whatsapp", whatsappUrl()),
          link("/contacto", "/contacto"),
        ],
      };
    case "github":
      return { lines: [echo, link(SITE.social.github, SITE.social.github)] };
    case "linkedin":
      return { lines: [echo, link(SITE.social.linkedin, SITE.social.linkedin)] };
    case "layers":
      return {
        lines: [
          echo,
          out("7  APPLICATION     you are here"),
          out("6  PRESENTATION    storefronts / ui", "dim"),
          out("5  SESSION         handshake / clients", "dim"),
          out("4  TRANSPORT       lcp / uptime", "dim"),
          out("3  NETWORK         apis / integrations", "dim"),
          out("2  DATA LINK       catalogs / contracts", "dim"),
          out("1  PHYSICAL        santiago · cloud · 8 yrs", "dim"),
        ],
      };
    case "clear":
      return { lines: [], clear: true, attached: null };
    case "exit":
      return { lines: [echo, out("detach → /labs", "dim")], exit: true };
    case "open":
    case "cat": {
      if (!arg) {
        return {
          lines: [echo, out("usage: open <process>  —  try ps", "err")],
        };
      }
      const hits = processes.filter((proc) => matchesProcess(proc, arg));
      if (hits.length === 0) {
        return {
          lines: [echo, out(`no process matches '${arg}'`, "err")],
        };
      }
      if (hits.length > 1 && !hits.some((proc) => proc.slug === arg)) {
        return {
          lines: [
            echo,
            out("ambiguous — pick one:", "err"),
            ...hits.map((proc) => out(`  ${proc.pid}  ${proc.slug}`)),
          ],
        };
      }
      const proc =
        hits.find((item) => item.slug === arg) ?? hits[0];
      if (!proc) {
        return { lines: [echo, out("attach failed", "err")] };
      }
      const lines: ShellLine[] = [
        echo,
        out(`attached pid ${proc.pid}  ${proc.status}`, "ok"),
        out(proc.title),
        out(`${proc.client}  ·  ${proc.year}  ·  ${proc.category}`, "dim"),
        out(proc.excerpt),
        out(`stack  ${proc.stack.join(" · ")}`, "dim"),
      ];
      if (proc.liveUrl) lines.push(link(`live  ${proc.liveUrl}`, proc.liveUrl));
      if (proc.repoUrl) lines.push(link(`repo  ${proc.repoUrl}`, proc.repoUrl));
      lines.push(link(`case  /portafolio/${proc.slug}`, `/portafolio/${proc.slug}`));
      return { lines, attached: proc };
    }
    default:
      return {
        lines: [
          echo,
          out(`seven: ${cmd}: command not found  —  try help`, "err"),
        ],
      };
  }
}

function pad(value: string, size: number) {
  if (value.length >= size) return value.slice(0, size);
  return value + " ".repeat(size - value.length);
}
