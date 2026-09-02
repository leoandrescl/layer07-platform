"use client";

import { useState } from "react";
import { SITE, whatsappUrl } from "@/lib/site";

export function WhatsAppTerminal() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <div className="wired-frame w-[min(100vw-2rem,20rem)]">
          <div className="flex items-center gap-2 border-b border-dashed border-[#00ff66]/35 px-3 py-1.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar consola WhatsApp"
              className="grid size-[15px] shrink-0 place-items-center border border-[#111] bg-[#cfcfcf] font-mono text-[10px] leading-none font-bold text-[#1a1a1a] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#6a6a6a] hover:bg-[#e8e8e8]"
            >
              ×
            </button>
            <span className="wired-rule h-[7px] min-w-4 flex-1" aria-hidden />
            <span className="truncate font-mono text-[11px] text-[#94a3b8]">
              NAVI · wa://console
            </span>
            <span className="wired-rule h-[7px] min-w-4 flex-1" aria-hidden />
          </div>
          <div className="space-y-2 px-3 py-3 font-mono text-xs text-[#8fb8b0]">
            <p>
              <span className="text-[#00ff66]">guest@layer07</span>
              <span className="text-[#00f0ff]">:~$</span> connect --channel whatsapp
            </p>
            <p>target: {SITE.phoneDisplay}</p>
            <p className="text-[#c8efe6]">Establecer enlace directo con el lead engineer.</p>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full cursor-pointer items-center justify-center border border-dashed border-[#00ff66]/50 px-3 py-2 text-[11px] tracking-[0.18em] text-[#7fffd4] lowercase transition-all duration-200 hover:bg-[#00ff66]/10 hover:text-white"
            >
              ejecutar conexión
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer border border-dashed border-[#00ff66]/50 bg-[#030b0c] px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-[#7fffd4] lowercase transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#00ff66]/10 hover:text-white"
        aria-expanded={open}
        aria-label="Abrir terminal WhatsApp"
      >
        {open ? "close" : "whatsapp"}
      </button>
    </div>
  );
}
