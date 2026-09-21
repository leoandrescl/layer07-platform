import { cn } from "@/lib/cn";

export function PageIntro({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      data-field="0.12"
      className={cn("shell pt-36 pb-16 md:pt-44 md:pb-24", className)}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="display-lg mt-6 max-w-5xl text-ink">{title}</h1>
      {intro ? <p className="lede mt-7 max-w-2xl">{intro}</p> : null}
      {children}
    </header>
  );
}
