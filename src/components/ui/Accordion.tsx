"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="border-t border-line">
      {items.map((item, index) => {
        const isOpen = open === index;
        const panelId = `${uid}-panel-${index}`;
        const buttonId = `${uid}-button-${index}`;

        return (
          <div key={item.q} className="border-b border-line">
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : index)}
              className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
            >
              <span
                className={cn(
                  "font-display text-[1.375rem] leading-snug tracking-[-0.02em] transition-colors duration-300",
                  isOpen ? "text-accent" : "text-ink group-hover:text-accent",
                )}
              >
                {item.q}
              </span>
              <span
                aria-hidden
                className={cn(
                  "accordion-plus shrink-0 font-mono text-xl text-accent",
                  isOpen && "is-open",
                )}
              >
                +
              </span>
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="accordion-panel"
              data-open={isOpen}
            >
              <div className="accordion-panel-inner">
                <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
