"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/cn";

const schema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  email: z.string().email("Email inválido"),
  company: z.string().optional(),
  message: z.string().min(20, "Cuéntanos un poco más (mín. 20 caracteres)"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setStatus("loading");
    setServerMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Error de transmisión");
      }
      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setServerMessage(err instanceof Error ? err.message : "Fallo de red");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-neon/50 bg-surface p-6 font-mono text-sm shadow-neon">
        <p className="text-neon">root@layer07:~$ send --status ok</p>
        <p className="mt-3 text-muted">
          Transmisión recibida. Responderemos por el canal indicado.
        </p>
        <button
          type="button"
          className="mt-6 border border-border px-4 py-2 text-[11px] tracking-widest text-cyan uppercase hover:border-cyan"
          onClick={() => setStatus("idle")}
        >
          Nueva transmisión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {(
        [
          { name: "name", label: "Nombre", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "company", label: "Empresa (opcional)", type: "text" },
        ] as const
      ).map((field) => (
        <label key={field.name} className="block">
          <span className="font-mono text-[10px] tracking-widest text-muted-dim uppercase">
            {field.label}
          </span>
          <input
            type={field.type}
            className={cn(
              "mt-2 w-full border bg-background px-3 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-dim/50 focus:border-neon",
              errors[field.name] ? "border-magenta" : "border-border",
            )}
            placeholder={`> ${field.label.toLowerCase()}`}
            {...register(field.name)}
          />
          {errors[field.name] ? (
            <span className="mt-1 block font-mono text-[11px] text-magenta">
              {errors[field.name]?.message}
            </span>
          ) : null}
        </label>
      ))}

      <label className="block">
        <span className="font-mono text-[10px] tracking-widest text-muted-dim uppercase">
          Mensaje
        </span>
        <textarea
          rows={5}
          className={cn(
            "mt-2 w-full resize-y border bg-background px-3 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-dim/50 focus:border-neon",
            errors.message ? "border-magenta" : "border-border",
          )}
          placeholder="> describe el sistema, deadline e integraciones..."
          {...register("message")}
        />
        {errors.message ? (
          <span className="mt-1 block font-mono text-[11px] text-magenta">
            {errors.message.message}
          </span>
        ) : null}
      </label>

      {status === "error" ? (
        <p className="font-mono text-xs text-magenta">
          ERR: {serverMessage || "No se pudo enviar"}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full border border-neon bg-neon/10 px-4 py-3 font-mono text-xs tracking-[0.2em] text-neon uppercase shadow-neon transition-colors hover:bg-neon/20 disabled:opacity-60"
      >
        {status === "loading" ? "Transmitiendo..." : "Enviar transmisión"}
      </button>
    </form>
  );
}
