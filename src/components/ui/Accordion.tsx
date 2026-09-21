export function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-[1.375rem] leading-snug tracking-[-0.02em] text-ink">
              {item.q}
            </span>
            <span
              aria-hidden
              className="shrink-0 font-mono text-xl text-accent transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-7 leading-relaxed text-ink-soft">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
