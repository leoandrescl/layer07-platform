import Link from "next/link";

type Variant = "solid" | "outline" | "ghost";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
  "aria-label"?: string;
};

const base =
  "group inline-flex items-center gap-2 rounded-full px-5 py-3 text-[0.8125rem] font-medium tracking-[0.02em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]";

const variants: Record<Variant, string> = {
  solid: "bg-accent text-accent-ink hover:-translate-y-0.5 hover:opacity-90",
  outline:
    "border border-line-strong text-ink hover:bg-ink hover:text-bg hover:-translate-y-0.5",
  ghost: "text-ink hover:text-accent px-0",
};

export function Button({
  href,
  children,
  variant = "solid",
  external,
  className,
  ...rest
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className ?? ""}`;
  const isExternal =
    external || /^(https?:|mailto:|tel:)/.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
