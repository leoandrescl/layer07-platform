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
    <div
      className={cn(
        "divide-y divide-[#00ff66]/20 border border-dashed border-[#00ff66]/35",
        className,
      )}
    >
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="bg-black/40">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-4 text-left font-mono text-sm text-[#c8efe6] transition-colors duration-200 hover:bg-white/5 hover:text-[#7fffd4] sm:px-5"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span>
                <span
                  className={cn(
                    "mr-2 inline-block text-[#00ff66] transition-transform duration-200",
                    open && "rotate-90",
                  )}
                >
                  ▶
                </span>
                {item.question}
              </span>
              <span className="shrink-0 text-[10px] tracking-widest text-[#8fb8b0]">
                {open ? "close" : "open"}
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "border-t border-dashed border-[#00ff66]/20 bg-black/30 px-4 py-4 text-sm leading-relaxed text-[#8fb8b0] transition-opacity duration-300 sm:px-5",
                    open ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden={!open}
                >
                  <pre className="font-mono text-xs whitespace-pre-wrap sm:text-sm">
                    {`> ${item.answer}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
