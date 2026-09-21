import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { offerings } from "@/lib/content/offerings";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ServicesPreview({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { services } = dict.home;

  return (
    <section data-field="0.58" className="shell py-24 md:py-32">
      <Reveal>
        <SectionHeading
          eyebrow={services.eyebrow}
          title={services.title}
          intro={services.intro}
        />
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
        {offerings.map((offering, index) => (
          <Reveal key={offering.id} delay={0.04}>
            <article className="flex h-full flex-col gap-4 bg-bg/70 p-8 backdrop-blur-md transition-colors duration-500 hover:bg-surface/80 md:p-10">
              <span className="font-mono text-xs text-ink-muted">
                0{index + 1}
              </span>
              <h3 className="font-display text-[1.75rem] leading-tight tracking-[-0.02em] text-ink">
                {offering.title[locale]}
              </h3>
              <p className="leading-relaxed text-ink-soft">
                {offering.body[locale]}
              </p>
              <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 font-mono text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
                {offering.includes[locale].slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-accent">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-14">
        <Button href={`/${locale}/services`} variant="outline">
          {services.cta}
        </Button>
      </div>
    </section>
  );
}
