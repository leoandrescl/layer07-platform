import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Capabilities({ dict }: { dict: Dictionary }) {
  const { capabilities } = dict.home;

  return (
    <section data-field="0.45" className="border-t border-line">
      <div className="shell grid gap-12 py-24 md:py-32 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <Reveal>
            <SectionHeading
              eyebrow={capabilities.eyebrow}
              title={capabilities.title}
              intro={capabilities.intro}
            />
          </Reveal>
        </div>

        <ul className="border-t border-line">
          {capabilities.items.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={0.03}>
                <div className="group grid gap-3 border-b border-line py-7 sm:grid-cols-[3rem_1fr] sm:gap-6">
                  <span className="font-mono text-xs text-ink-muted">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-[1.6rem] leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-ink-soft">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
