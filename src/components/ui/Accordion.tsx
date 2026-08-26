"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
};

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className={cn("divide-y divide-border border border-border", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-mono text-sm text-muted transition-colors hover:bg-surface hover:text-neon sm:px-5"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span>
                <span className="mr-2 text-neon">{open ? "▼" : "▶"}</span>
                {item.question}
              </span>
              <span className="shrink-0 text-[10px] tracking-widest text-muted-dim">
                {open ? "CLOSE" : "OPEN"}
              </span>
            </button>
            {open ? (
              <div className="border-t border-border/60 bg-surface/50 px-4 py-4 text-sm leading-relaxed text-muted-dim sm:px-5">
                <pre className="font-mono text-xs whitespace-pre-wrap sm:text-sm">
                  {`> ${item.answer}`}
                </pre>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
