import Link from "next/link";
import { cn } from "@/lib/cn";

type NeonButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "neon" | "cyan" | "ghost";
  className?: string;
  external?: boolean;
};

const variants = {
  neon:
    "border-neon text-neon border-glow hover:bg-neon/15 hover:shadow-neon hover:brightness-110",
  cyan:
    "border-cyan text-cyan border-glow-cyan hover:bg-cyan/15 hover:shadow-cyan hover:brightness-110",
  ghost:
    "border-border text-muted hover:border-neon/60 hover:bg-neon/5 hover:text-neon hover:shadow-neon",
} as const;

export function NeonButton({
  href,
  children,
  variant = "neon",
  className,
  external,
}: NeonButtonProps) {
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 border px-5 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-all duration-200 ease-out glitch-hover hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
    variants[variant],
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
