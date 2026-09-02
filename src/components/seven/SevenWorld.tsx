"use client";

import Link from "next/link";
import { SITE, whatsappUrl } from "@/lib/site";

const STACK = SITE.founder.stack.slice(0, 6);

export function SevenWorld({ onRestore }: { onRestore: () => void }) {
  return (
    <div
      data-shot-ui
      className="pointer-events-none w-full max-w-lg border border-dashed border-[#7fffd4]/35 bg-black/70 px-6 py-7 text-center backdrop-blur-[2px] sm:px-8"
    >
      <p className="font-mono text-[10px] tracking-[0.28em] text-[#7fffd4]">
        present day, present time.
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-[#8fb8b0]">
        close the NAVI · open the world
      </p>

      <h2 className="font-lain lain-glow mt-6 text-4xl tracking-[0.08em] text-[#e8fff8] lowercase sm:text-5xl">
        leonardo
      </h2>
      <p className="font-lain mt-1 text-2xl tracking-[0.16em] text-[#c8efe6]/90 lowercase">
        contreras
      </p>
      <p className="mt-4 font-mono text-[11px] tracking-[0.16em] text-[#8fb8b0]">
        a body in Santiago · a ghost in the Wired
      </p>

      <p className="mt-5 font-mono text-[10px] leading-relaxed tracking-[0.12em] text-[#7fffd4]/80">
        {STACK.join("  ·  ")}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] tracking-[0.16em] text-[#7fffd4]">
        <Link href={`mailto:${SITE.email}`} className="hover:text-white">
          mail
        </Link>
        <Link
          href={whatsappUrl()}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          whatsapp
        </Link>
        <Link
          href={SITE.social.github}
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          github
        </Link>
        <Link href="/contacto" className="hover:text-white">
          handshake
        </Link>
      </div>

      <button
        type="button"
        onClick={onRestore}
        className="mt-7 inline-flex items-center gap-2 border border-[#111] bg-[#cfcfcf] px-3 py-1.5 font-mono text-[10px] tracking-wide text-[#222] shadow-[2px_2px_0_#111] hover:bg-[#e4e4e4]"
      >
        <span
          className="grid size-[13px] place-items-center border border-[#111] bg-[#e8e8e8] text-[9px] leading-none"
          aria-hidden
        >
          □
        </span>
        NAVI.SYS
      </button>
    </div>
  );
}
