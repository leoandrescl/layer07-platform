import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {eyebrow ? (
        <p className="mb-3 font-mono text-[11px] tracking-[0.28em] text-neon uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-dim sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
