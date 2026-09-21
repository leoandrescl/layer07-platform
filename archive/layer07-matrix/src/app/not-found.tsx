import Link from "next/link";

export default function NotFound() {
  return (
    <div className="seven-root relative flex min-h-dvh flex-col items-center justify-center bg-[#030b0c] px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.28) 2px, rgba(0,0,0,0.28) 3px)",
        }}
        aria-hidden
      />
      <p className="relative font-mono text-[11px] tracking-[0.3em] text-[#ff0055] uppercase">
        ERR_404
      </p>
      <h1 className="font-sans lain-glow relative mt-4 text-2xl tracking-[0.08em] text-[#e8fff8] lowercase">
        nodo no encontrado
      </h1>
      <p className="relative mt-3 max-w-md font-mono text-sm text-[#8fb8b0]">
        La ruta solicitada no existe en esta red.
      </p>
      <Link
        href="/"
        className="relative mt-8 border border-dashed border-[#00ff66]/50 px-5 py-3 font-mono text-xs tracking-[0.2em] text-[#7fffd4] lowercase hover:bg-[#00ff66]/10 hover:text-white"
      >
        volver a /
      </Link>
    </div>
  );
}
