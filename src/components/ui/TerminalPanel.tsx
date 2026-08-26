import { cn } from "@/lib/cn";

type TerminalPanelProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export function TerminalPanel({ children, className, title }: TerminalPanelProps) {
  return (
    <div
      className={cn(
        "border border-border bg-surface/80 backdrop-blur-sm transition-shadow hover:border-neon/40 hover:shadow-neon",
        className,
      )}
    >
      {title ? (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="size-2 rounded-full bg-magenta/80" />
          <span className="size-2 rounded-full bg-cyan/80" />
          <span className="size-2 rounded-full bg-neon/80" />
          <span className="ml-2 font-mono text-[10px] tracking-widest text-muted-dim uppercase">
            {title}
          </span>
        </div>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
