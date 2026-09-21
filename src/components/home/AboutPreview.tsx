import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function AboutPreview({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { about } = dict.home;

  return (
    <section data-field="0.74" className="border-t border-line">
      <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading
              eyebrow={about.eyebrow}
              title={about.title}
              intro={about.lede}
            />
          </Reveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.08}>
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              {about.body}
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
              {about.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-[2rem] leading-none tracking-[-0.02em] text-ink">
                    {stat.value}
                  </dt>
                  <dd className="eyebrow mt-2">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.16}>
            <Button
              href={`/${locale}/about`}
              variant="outline"
              className="mt-10"
            >
              {about.cta}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
