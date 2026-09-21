import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.about.title,
    description: dict.about.intro,
    alternates: { canonical: `/${lang}/about` },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { about } = dict;

  return (
    <>
      <PageIntro eyebrow={dict.nav.about} title={about.lead} intro={about.intro} />

      <section className="shell grid gap-14 pb-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="eyebrow">{about.role}</p>
          <p className="mt-4 font-display text-3xl tracking-[-0.02em] text-ink">
            {SITE.founder.years}
          </p>
          <p className="eyebrow mt-1">{dict.home.about.stats[0].label}</p>
        </div>
        <div className="space-y-6">
          {about.bio.map((paragraph, index) => (
            <Reveal key={paragraph} delay={index * 0.05}>
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface/60">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <SectionHeading title={about.valuesTitle} />
          </Reveal>
          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {about.values.map((value, index) => (
              <div
                key={value.title}
                className="bg-bg/70 p-8 backdrop-blur-md md:p-10"
              >
                <span className="font-mono text-xs text-ink-muted">
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-display text-[1.6rem] leading-tight tracking-[-0.02em] text-ink">
                  {value.title}
                </h3>
                <p className="mt-3 leading-relaxed text-ink-soft">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-24 md:py-32">
        <p className="eyebrow">{about.stackTitle}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {SITE.founder.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-line px-4 py-2 font-mono text-[0.6875rem] tracking-[0.12em] text-ink-soft uppercase"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap gap-3">
          <Button href={`/${lang}/contact`}>{about.cta}</Button>
          <Button href={`/${lang}/agency`} variant="outline">
            {dict.nav.agency}
          </Button>
        </div>
      </section>
    </>
  );
}
