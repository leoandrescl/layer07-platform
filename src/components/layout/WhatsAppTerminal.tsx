"use client";

import { useState } from "react";
import { SITE, whatsappUrl } from "@/lib/site";

export function WhatsAppTerminal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <div className="w-[min(100vw-2rem,20rem)] border border-neon/50 bg-surface shadow-neon">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-[10px] tracking-widest text-neon uppercase">
              wa://console
            </span>
            <button
              type="button"
              className="cursor-pointer font-mono text-[10px] text-muted-dim transition-colors hover:text-magenta"
              onClick={() => setOpen(false)}
              aria-label="Cerrar consola WhatsApp"
            >
              [X]
            </button>
          </div>
          <div className="space-y-2 px-3 py-3 font-mono text-xs text-muted-dim">
            <p>
              <span className="text-neon">root@layer07</span>
              <span className="text-cyan">:~$</span> connect --channel whatsapp
            </p>
            <p>target: {SITE.phoneDisplay}</p>
            <p className="text-muted">Establecer enlace directo con el lead engineer.</p>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full cursor-pointer items-center justify-center border border-neon bg-neon/10 px-3 py-2 text-[11px] tracking-[0.18em] text-neon uppercase transition-all duration-200 hover:bg-neon/20 hover:-translate-y-0.5 hover:shadow-neon"
            >
              Ejecutar conexión
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer border border-neon bg-background px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-neon uppercase shadow-neon transition-all duration-200 glitch-hover hover:-translate-y-0.5 hover:bg-neon/10 hover:shadow-neon"
        aria-expanded={open}
        aria-label="Abrir terminal WhatsApp"
      >
        {open ? "close_tty" : "wa_term"}
      </button>
    </div>
  );
}
