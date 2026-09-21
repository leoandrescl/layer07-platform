import { cn } from "@/lib/cn";

type TerminalPanelProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
};

export function TerminalPanel({ children, className, title }: TerminalPanelProps) {
  return (
    <div className={cn("wired-frame transition-colors hover:border-[#7fffd4]/40", className)}>
      {title ? (
        <div className="flex items-center gap-2 border-b border-dashed border-[#00ff66]/35 px-3 py-1.5">
          <span className="wired-rule h-[7px] min-w-4 flex-1" aria-hidden />
          <span className="truncate font-mono text-[11px] tracking-[0.14em] text-[#94a3b8] lowercase">
            {title}
          </span>
          <span className="wired-rule h-[7px] min-w-4 flex-1" aria-hidden />
        </div>
      ) : null}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
