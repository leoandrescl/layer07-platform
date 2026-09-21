import { cn } from "@/lib/cn";
import type { Project, ProjectCategory } from "@/lib/content/projects";
import type { Locale } from "@/lib/i18n/config";

function Bar({ className }: { className?: string }) {
  return <span className={cn("block rounded-full bg-line-strong", className)} />;
}

function EcommerceMock() {
  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-md border border-line bg-bg/60 p-2"
        >
          <span
            className={cn(
              "block h-1/2 w-full rounded-sm",
              index === 1 ? "bg-accent/25" : "bg-surface-strong",
            )}
          />
          <div className="space-y-1">
            <Bar className="h-1 w-3/4" />
            <Bar className="h-1 w-1/3 opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemsMock() {
  const bars = [38, 62, 46, 78, 54, 88, 70];
  return (
    <div className="flex h-full gap-2">
      <div className="flex w-1/4 flex-col gap-2 rounded-md border border-line bg-bg/60 p-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Bar
            key={index}
            className={cn("h-1.5", index === 1 ? "w-full bg-accent/40" : "w-2/3")}
          />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-1 items-end gap-1.5 rounded-md border border-line bg-bg/60 p-3">
          {bars.map((height, index) => (
            <span
              key={index}
              className={cn(
                "flex-1 rounded-sm",
                index === 5 ? "bg-accent/50" : "bg-surface-strong",
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="space-y-1.5 rounded-md border border-line bg-bg/60 p-2.5">
          <Bar className="h-1 w-full" />
          <Bar className="h-1 w-4/5" />
          <Bar className="h-1 w-2/3" />
        </div>
      </div>
    </div>
  );
}

function AppsMock() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-full w-[46%] max-w-[220px] flex-col gap-2 rounded-lg border border-line bg-bg/70 p-3">
        <div className="flex items-center gap-2">
          <span className="size-5 rounded-full bg-accent/40" />
          <Bar className="h-1.5 w-1/2" />
        </div>
        <span className="mt-1 block h-1/3 w-full rounded-md bg-surface-strong" />
        <Bar className="h-1 w-3/4" />
        <Bar className="h-1 w-1/2" />
        <span className="mt-auto block h-5 w-full rounded-full bg-accent/30" />
      </div>
    </div>
  );
}

function WebsiteMock() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-2">
        <Bar className="h-2 w-2/3" />
        <Bar className="h-2 w-1/2" />
        <Bar className="h-2 w-1/4 opacity-50" />
      </div>
      <div className="flex gap-2">
        <span className="h-10 flex-1 rounded-md bg-surface-strong" />
        <span className="h-10 w-1/4 rounded-md bg-accent/25" />
      </div>
    </div>
  );
}

const MOCKS: Record<ProjectCategory, () => React.ReactElement> = {
  ecommerce: EcommerceMock,
  systems: SystemsMock,
  apps: AppsMock,
  websites: WebsiteMock,
  integrations: WebsiteMock,
};

export function ProjectVisual({
  project,
  locale,
  className,
}: {
  project: Project;
  locale: Locale;
  className?: string;
}) {
  const Mock = MOCKS[project.category];
  const host = (project.liveUrl ?? "layer07.cl")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <div
      aria-hidden
      className={cn(
        "relative overflow-hidden rounded-xl border border-line bg-bg-elevated transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-line px-3 py-2.5">
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="ml-2 flex-1 truncate rounded-full bg-surface px-2.5 py-1 font-mono text-[0.5625rem] tracking-[0.08em] text-ink-muted">
          {host}
        </span>
      </div>
      <div className="aspect-[16/10] p-4">
        <Mock />
      </div>
      <span
        data-locale={locale}
        className="pointer-events-none absolute -right-6 -bottom-10 font-display text-[6rem] leading-none text-ink/[0.04] select-none"
      >
        07
      </span>
    </div>
  );
}
