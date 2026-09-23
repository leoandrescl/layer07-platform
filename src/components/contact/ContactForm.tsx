"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ButtonLayers, useButtonFx } from "@/components/ui/button-fx";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(20),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const t = dict.contact;
  const { ref: submitRef, handlers: submitHandlers } =
    useButtonFx<HTMLButtonElement>();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, locale }),
      });
      if (!response.ok) throw new Error("request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  const fieldClass = (hasError?: boolean) =>
    cn(
      "mt-3 w-full border-b bg-transparent pb-3 text-[1.0625rem] text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-accent",
      hasError ? "border-accent" : "border-line-strong",
    );

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-surface/60 p-8">
        <p className="eyebrow text-accent">{t.successTitle}</p>
        <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
          {t.successBody}
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 rounded-full border border-line-strong px-5 py-3 text-[0.8125rem] text-ink transition-colors hover:bg-ink hover:text-bg"
        >
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      {(
        [
          { name: "name", label: t.name, placeholder: t.namePlaceholder, type: "text" },
          { name: "email", label: t.email, placeholder: t.emailPlaceholder, type: "email" },
          { name: "company", label: t.company, placeholder: t.companyPlaceholder, type: "text" },
        ] as const
      ).map((field) => (
        <label key={field.name} className="block">
          <span className="eyebrow">{field.label}</span>
          <input
            type={field.type}
            className={fieldClass(Boolean(errors[field.name]))}
            placeholder={field.placeholder}
            {...register(field.name)}
          />
        </label>
      ))}

      <label className="block">
        <span className="eyebrow">{t.message}</span>
        <textarea
          rows={4}
          className={cn(fieldClass(Boolean(errors.message)), "resize-y")}
          placeholder={t.messagePlaceholder}
          {...register("message")}
        />
      </label>

      {status === "error" ? (
        <p className="text-sm text-accent">{t.error}</p>
      ) : null}

      <button
        ref={submitRef}
        type="submit"
        disabled={status === "loading"}
        className="btn btn-outline disabled:cursor-not-allowed"
        {...submitHandlers}
      >
        <ButtonLayers>
          {status === "loading" ? t.sending : t.submit}
          <span aria-hidden>→</span>
        </ButtonLayers>
      </button>
    </form>
  );
}
