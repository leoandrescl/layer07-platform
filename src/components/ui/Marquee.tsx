export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];

  return (
    <div
      aria-hidden
      className="relative flex overflow-hidden border-y border-line py-6"
    >
      <div className="flex w-max animate-marquee">
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-12 whitespace-nowrap pr-12 font-display text-[1.5rem] tracking-[-0.02em] text-ink-soft md:text-[2rem]"
          >
            {item}
            <span className="text-accent">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
