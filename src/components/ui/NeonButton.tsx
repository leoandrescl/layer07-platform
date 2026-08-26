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
  neon: "border-neon text-neon hover:bg-neon/10 border-glow",
  cyan: "border-cyan text-cyan hover:bg-cyan/10 border-glow-cyan",
  ghost: "border-border text-muted hover:border-neon/50 hover:text-neon",
} as const;

export function NeonButton({
  href,
  children,
  variant = "neon",
  className,
  external,
}: NeonButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 border px-5 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-colors glitch-hover",
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
