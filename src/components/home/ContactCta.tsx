import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactCta({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const { contact } = dict.home;

  return (
    <section className="shell py-28 text-center md:py-40">
      <Reveal>
        <p className="eyebrow">{contact.eyebrow}</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="display-xl mt-6 text-ink">{contact.title}</h2>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="lede mx-auto mt-7 max-w-xl">{contact.body}</p>
      </Reveal>
      <Reveal delay={0.18} className="mt-10 flex justify-center">
        <Button href={`/${locale}/contact`}>{contact.cta}</Button>
      </Reveal>
    </section>
  );
}
