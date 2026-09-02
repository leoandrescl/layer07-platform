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
    "border-[#00ff66]/50 text-[#7fffd4] hover:border-[#7fffd4] hover:bg-[#00ff66]/10 hover:text-white",
  cyan:
    "border-[#00f0ff]/40 text-[#00f0ff] hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:text-white",
  ghost:
    "border-white/15 text-[#8fb8b0] hover:border-[#7fffd4]/50 hover:bg-white/5 hover:text-[#e8fff8]",
} as const;

export function NeonButton({
  href,
  children,
  variant = "neon",
  className,
  external,
}: NeonButtonProps) {
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 border border-dashed px-5 py-3 font-mono text-xs tracking-[0.18em] lowercase transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
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
