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
        <p className="mb-3 font-mono text-[11px] tracking-[0.28em] text-[#7fffd4] lowercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-sans text-2xl font-normal tracking-[0.06em] text-[#e8fff8] lowercase sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-[#8fb8b0] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
