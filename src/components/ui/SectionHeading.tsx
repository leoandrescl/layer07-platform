import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={cn("display-lg max-w-4xl text-ink", titleClassName)}>
        {title}
      </h2>
      {intro ? <p className="lede max-w-2xl">{intro}</p> : null}
    </div>
  );
}
