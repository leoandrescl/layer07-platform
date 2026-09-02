import { cn } from "@/lib/cn";

type PageHeroProps = {
  path: string;
  title: string;
  kicker?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHero({
  path,
  title,
  kicker,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn("border-b border-dashed border-[#00ff66]/25", className)}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fffd4]">
          {path}
        </p>
        {kicker ? (
          <p className="mt-4 font-mono text-[10px] tracking-widest text-[#00f0ff] uppercase">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-sans lain-glow mt-4 max-w-3xl text-3xl font-normal tracking-[0.06em] text-[#e8fff8] lowercase sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-[#8fb8b0] sm:text-base">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
