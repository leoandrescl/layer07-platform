import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function Hero({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { hero } = dict.home;

  return (
    <section
      data-field="0"
      className="relative flex min-h-[94svh] flex-col justify-between pt-32 pb-10 md:pt-40"
    >
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <Reveal>
            <p className="eyebrow">{hero.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display-xl mt-8 text-ink">
              {hero.title}{" "}
              <span className="italic text-accent">{hero.titleAccent}</span>
            </h1>
          </Reveal>
        </div>

        <div className="flex flex-col justify-end gap-7 lg:col-span-4 lg:pb-2">
          <Reveal delay={0.15}>
            <p className="lede">{hero.lede}</p>
          </Reveal>
          <Reveal delay={0.22} className="flex flex-wrap gap-3">
            <Button href={`/${locale}/contact`}>{hero.primary}</Button>
            <Button href={`/${locale}/work`} variant="outline">
              {hero.secondary}
            </Button>
          </Reveal>
        </div>
      </div>

      <div className="shell mt-16 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2.5 font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
          {SITE.location}
        </span>
        <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
          {dict.common.scroll} ↓
        </span>
      </div>
    </section>
  );
}
