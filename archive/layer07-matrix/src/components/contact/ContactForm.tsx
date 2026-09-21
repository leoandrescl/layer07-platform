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
      <div className="wired-frame p-6 font-mono text-sm">
        <p className="text-[#00ff66]">guest@layer07:~$ send --status ok</p>
        <p className="mt-3 text-[#c8efe6]">
          Transmisión recibida. Responderemos por el canal indicado.
        </p>
        <button
          type="button"
          className="mt-6 cursor-pointer border border-dashed border-[#00ff66]/35 px-4 py-2 text-[11px] tracking-widest text-[#00f0ff] lowercase transition-all duration-200 hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 hover:-translate-y-0.5"
          onClick={() => setStatus("idle")}
        >
          nueva transmisión
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
          <span className="font-mono text-[10px] tracking-widest text-[#8fb8b0] uppercase">
            {field.label}
          </span>
          <input
            type={field.type}
            className={cn(
              "mt-2 w-full border border-dashed bg-black/50 px-3 py-3 font-mono text-sm text-[#e8fff8] outline-none transition-colors placeholder:text-[#8fb8b0]/50 focus:border-[#7fffd4]",
              errors[field.name] ? "border-[#ff0055]" : "border-[#00ff66]/30",
            )}
            placeholder={`> ${field.label.toLowerCase()}`}
            {...register(field.name)}
          />
          {errors[field.name] ? (
            <span className="mt-1 block font-mono text-[11px] text-[#ff0055]">
              {errors[field.name]?.message}
            </span>
          ) : null}
        </label>
      ))}

      <label className="block">
        <span className="font-mono text-[10px] tracking-widest text-[#8fb8b0] uppercase">
          Mensaje
        </span>
        <textarea
          rows={5}
          className={cn(
            "mt-2 w-full resize-y border border-dashed bg-black/50 px-3 py-3 font-mono text-sm text-[#e8fff8] outline-none transition-colors placeholder:text-[#8fb8b0]/50 focus:border-[#7fffd4]",
            errors.message ? "border-[#ff0055]" : "border-[#00ff66]/30",
          )}
          placeholder="> describe el sistema, deadline e integraciones..."
          {...register("message")}
        />
        {errors.message ? (
          <span className="mt-1 block font-mono text-[11px] text-[#ff0055]">
            {errors.message.message}
          </span>
        ) : null}
      </label>

      {status === "error" ? (
        <p className="font-mono text-xs text-[#ff0055]">
          ERR: {serverMessage || "No se pudo enviar"}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full cursor-pointer border border-dashed border-[#00ff66]/50 bg-[#00ff66]/10 px-4 py-3 font-mono text-xs tracking-[0.2em] text-[#7fffd4] lowercase transition-all duration-200 hover:bg-[#00ff66]/20 hover:-translate-y-0.5 hover:text-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === "loading" ? "transmitiendo..." : "enviar transmisión"}
      </button>
    </form>
  );
}
