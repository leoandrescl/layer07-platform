import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-grid flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[11px] tracking-[0.3em] text-magenta uppercase">
        ERR_404
      </p>
      <h1 className="mt-4 text-2xl text-foreground">Nodo no encontrado</h1>
      <p className="mt-3 max-w-md text-sm text-muted-dim">
        La ruta solicitada no existe en esta red.
      </p>
      <Link
        href="/"
        className="mt-8 border border-neon px-5 py-3 font-mono text-xs tracking-[0.2em] text-neon uppercase hover:bg-neon/10"
      >
        Volver a /
      </Link>
    </div>
  );
}
