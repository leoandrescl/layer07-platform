"use client";

import Link from "next/link";
import { ButtonLayers, useButtonFx } from "./button-fx";

type Variant = "solid" | "outline" | "ghost";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function Button({
  href,
  children,
  variant = "solid",
  external,
  className,
  ...rest
}: ButtonProps) {
  const { ref, handlers } = useButtonFx<HTMLAnchorElement>();

  const classes = `btn btn-${variant} ${className ?? ""}`;
  const isExternal = external || /^(https?:|mailto:|tel:)/.test(href);

  if (isExternal) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...handlers}
        {...rest}
      >
        <ButtonLayers>{children}</ButtonLayers>
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={classes} {...handlers} {...rest}>
      <ButtonLayers>{children}</ButtonLayers>
    </Link>
  );
}
