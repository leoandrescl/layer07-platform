import {
  CATEGORY_LABELS,
  type Project,
} from "@/lib/data/content";
import { SITE, whatsappUrl } from "@/lib/site";

export type SevenProcess = {
  kind: "project";
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

export type SevenSysSlug = "operator" | "stack" | "contact";

export type SevenSysPanel = {
  kind: "sys";
  pid: number;
  slug: SevenSysSlug;
  title: string;
  hint: string;
  status: "SYS";
};

export type SevenAttach = SevenProcess | SevenSysPanel;

export const SYS_PANELS: SevenSysPanel[] = [
  {
    kind: "sys",
    pid: 7,
    slug: "operator",
    title: "operator",
    hint: "whoami",
    status: "SYS",
  },
  {
    kind: "sys",
    pid: 8,
    slug: "stack",
    title: "stack",
    hint: "services",
    status: "SYS",
  },
  {
    kind: "sys",
    pid: 9,
    slug: "contact",
    title: "contact",
    hint: "handshake",
    status: "SYS",
  },
];

export function isSysPanel(node: SevenAttach): node is SevenSysPanel {
  return node.kind === "sys";
}

export function getSysPanel(slug: SevenSysSlug) {
  const panel = SYS_PANELS.find((item) => item.slug === slug);
  if (!panel) throw new Error(`missing SYS panel ${slug}`);
  return panel;
}

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
  "deck",
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
  return [...projects]
    .sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" }))
    .map((project, index) => ({
      kind: "project" as const,
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
      text: "NAVI attached  ·  protocol 7  ·  guest in the Wired",
    },
    {
      id: count + 1,
      tone: "dim",
      text: "present day, present time.     SYS · help · / to focus",
    },
    {
      id: count + 2,
      tone: "dim",
      text: "NAVI // DECK idle  ·  type deck to open",
    },
  ];
}

function matchesProcess(proc: SevenProcess, query: string) {
  const q = query.toLowerCase();
  return (
    proc.slug.toLowerCase() === q ||
    proc.slug.toLowerCase().startsWith(q) ||
    proc.title.toLowerCase().includes(q) ||
    proc.client.toLowerCase().includes(q) ||
    String(proc.pid) === q
  );
}

const SYS_ALIASES: Record<SevenSysSlug, string[]> = {
  operator: ["whoami", "me", "leonardo"],
  stack: ["services", "capabilities", "skills"],
  contact: ["handshake", "hire", "mail"],
};

function matchesSys(panel: SevenSysPanel, query: string) {
  const q = query.toLowerCase();
  return (
    panel.slug === q ||
    panel.slug.startsWith(q) ||
    panel.title.toLowerCase().includes(q) ||
    panel.hint.toLowerCase().includes(q) ||
    String(panel.pid) === q ||
    SYS_ALIASES[panel.slug].includes(q)
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
    const sysHit = SYS_PANELS.find(
      (panel) =>
        panel.slug.startsWith(prefix) || panel.slug.includes(prefix),
    );
    if (sysHit) return `${cmd} ${sysHit.slug}`;
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
  attached?: SevenAttach | null;
  deck?: boolean;
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
          out("  click SYS / process  same as open"),
          out("  help                 this list"),
          out("  ps | ls              SYS + processes"),
          out("  open | cat <name>    attach SYS or process"),
          out("  deck                 open NAVI // DECK"),
          out("  whoami               operator panel"),
          out("  stack                capabilities"),
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
          ...SYS_PANELS.map((panel) =>
            out(
              `${pad(String(panel.pid), 6)} ${pad(panel.status, 6)} ${pad(panel.slug, 28)} ${panel.hint}`,
            ),
          ),
          ...processes.map((proc) =>
            out(
              `${pad(String(proc.pid), 6)} ${pad(proc.status, 6)} ${pad(proc.slug, 28)} ${proc.category}`,
            ),
          ),
          out(
            `${SYS_PANELS.length} sys  ·  ${processes.length} processes  ·  open <slug>`,
            "dim",
          ),
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
        attached: getSysPanel("operator"),
      };
    case "stack":
      return {
        lines: [
          echo,
          out(SITE.founder.stack.join("  ·  ")),
          out("runtime  next.js 16  ·  webgl rain  ·  osi layer 07", "dim"),
        ],
        attached: getSysPanel("stack"),
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
        attached: getSysPanel("contact"),
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
    case "deck":
    case "music":
      return {
        lines: [
          echo,
          out("NAVI // DECK  ·  duvet · track 44", "ok"),
          out("play from the panel  ·  × to stow", "dim"),
        ],
        deck: true,
      };
    case "exit":
      return { lines: [echo, out("detach → /labs", "dim")], exit: true };
    case "open":
    case "cat": {
      if (!arg) {
        return {
          lines: [echo, out("usage: open <name>  —  try ps", "err")],
        };
      }
      const q = arg.toLowerCase();
      const exactSys = SYS_PANELS.find((panel) => panel.slug === q);
      if (exactSys) {
        return {
          lines: [
            echo,
            out(`attached pid ${exactSys.pid}  SYS  ·  ${exactSys.slug}`, "ok"),
          ],
          attached: exactSys,
        };
      }
      const exactProc = processes.find((proc) => proc.slug.toLowerCase() === q);
      if (exactProc) {
        return {
          lines: [
            echo,
            out(
              `attached pid ${exactProc.pid}  ${exactProc.status}  ·  ${exactProc.slug}`,
              "ok",
            ),
          ],
          attached: exactProc,
        };
      }
      const sysHits = SYS_PANELS.filter((panel) => matchesSys(panel, arg));
      const procHits = processes.filter((proc) => matchesProcess(proc, arg));
      const hits: SevenAttach[] = [...sysHits, ...procHits];
      if (hits.length === 0) {
        return {
          lines: [echo, out(`no process matches '${arg}'`, "err")],
        };
      }
      if (hits.length > 1) {
        return {
          lines: [
            echo,
            out("ambiguous — pick one:", "err"),
            ...hits.map((item) => out(`  ${item.pid}  ${item.slug}`)),
          ],
        };
      }
      const node = hits[0];
      if (!node) {
        return { lines: [echo, out("attach failed", "err")] };
      }
      return {
        lines: [
          echo,
          out(`attached pid ${node.pid}  ${node.status}  ·  ${node.slug}`, "ok"),
        ],
        attached: node,
      };
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
