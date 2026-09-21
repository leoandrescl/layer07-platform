import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageIntro } from "@/components/ui/PageIntro";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { hasLocale } from "@/lib/i18n/config";
import { SITE, whatsappUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: dict.contact.title,
    description: dict.contact.intro,
    alternates: { canonical: `/${lang}/contact` },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.contact;

  const channels: { label: string; value: string; href?: string }[] = [
    { label: t.emailLabel, value: SITE.email, href: `mailto:${SITE.email}` },
    { label: t.phoneLabel, value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
    {
      label: t.whatsappLabel,
      value: SITE.phoneDisplay,
      href: whatsappUrl(),
    },
    { label: t.locationLabel, value: SITE.location },
  ];

  return (
    <>
      <PageIntro
        eyebrow={dict.nav.contact}
        title={t.title}
        intro={t.intro}
      />

      <section className="shell grid gap-16 pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 md:pb-36">
        <div>
          <p className="eyebrow">{t.formTitle}</p>
          <div className="mt-10">
            <ContactForm locale={lang} dict={dict} />
          </div>
        </div>

        <aside>
          <p className="eyebrow">{t.channelsTitle}</p>
          <ul className="mt-8 border-t border-line">
            {channels.map((channel) => (
              <li
                key={channel.label}
                className="flex items-baseline justify-between gap-6 border-b border-line py-5"
              >
                <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
                  {channel.label}
                </span>
                {channel.href ? (
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      channel.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="link-line text-right text-[0.9375rem] text-ink"
                  >
                    {channel.value}
                  </a>
                ) : (
                  <span className="text-right text-[0.9375rem] text-ink">
                    {channel.value}
                  </span>
                )}
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-6 border-b border-line py-5">
              <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-ink-muted uppercase">
                {t.socialLabel}
              </span>
              <span className="flex gap-4 text-[0.9375rem]">
                <a
                  href={SITE.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line text-ink"
                >
                  GitHub
                </a>
                <a
                  href={SITE.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line text-ink"
                >
                  LinkedIn
                </a>
              </span>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
}
