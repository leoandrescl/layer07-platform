import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Agency({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { agency } = dict.home;

  return (
    <section
      data-field="0.86"
      className="border-y border-line bg-surface/60 backdrop-blur-sm"
    >
      <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <Reveal>
            <SectionHeading
              eyebrow={agency.eyebrow}
              title={agency.title}
              intro={agency.body}
            />
          </Reveal>
          <Reveal delay={0.12}>
            <Button href={`/${locale}/agency`} className="mt-10">
              {agency.cta}
            </Button>
          </Reveal>
        </div>

        <ul className="self-center">
          {agency.bullets.map((bullet, index) => (
            <li key={bullet}>
              <Reveal delay={0.04}>
                <div className="flex items-baseline gap-5 border-t border-line py-5 last:border-b">
                  <span className="font-mono text-xs text-accent">
                    0{index + 1}
                  </span>
                  <span className="text-[1.125rem] leading-snug text-ink">
                    {bullet}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
