import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { offerings } from "@/lib/content/offerings";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.services.title,
    description: dict.services.intro,
    alternates: { canonical: `/${lang}/services` },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const { services } = dict;

  return (
    <>
      <PageIntro
        eyebrow={dict.nav.services}
        title={services.title}
        intro={services.intro}
      />

      <section className="shell pb-24">
        <p className="eyebrow">{services.offeringsTitle}</p>
        <div className="mt-10 border-t border-line">
          {offerings.map((offering, index) => (
            <Reveal key={offering.id} delay={0.03}>
              <article className="grid gap-6 border-b border-line py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div className="flex gap-5">
                  <span className="font-mono text-xs text-ink-muted">
                    0{index + 1}
                  </span>
                  <h2 className="font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-ink">
                    {offering.title[lang]}
                  </h2>
                </div>
                <div>
                  <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
                    {offering.body[lang]}
                  </p>
                  <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                    {offering.includes[lang].map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-[0.9375rem] text-ink-soft"
                      >
                        <span className="text-accent">·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface/60">
        <div className="shell py-24 md:py-32">
          <Reveal>
            <SectionHeading
              eyebrow={services.processTitle}
              title={services.processIntro}
            />
          </Reveal>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {services.process.map((step) => (
              <li key={step.step} className="flex flex-col gap-4 bg-bg p-8">
                <span className="font-mono text-xs text-accent">
                  {step.step}
                </span>
                <h3 className="font-display text-xl tracking-[-0.02em] text-ink">
                  {step.title}
                </h3>
                <p className="text-[0.9375rem] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell py-24 md:py-32">
        <Reveal>
          <SectionHeading title={services.faqTitle} />
        </Reveal>
        <div className="mt-12 max-w-3xl">
          <Accordion items={services.faq} />
        </div>
      </section>

      <section className="shell pb-28 text-center md:pb-36">
        <Reveal>
          <h2 className="display-md text-ink">{dict.home.contact.title}</h2>
        </Reveal>
        <Reveal delay={0.08} className="mt-8 flex justify-center">
          <Button href={`/${lang}/contact`}>
            {dict.common.startProject}
          </Button>
        </Reveal>
      </section>
    </>
  );
}
