"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export const Navbar = () => {
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]
  );
  const borderOpacity = useTransform(
    scrollY,
    [0, 100],
    ["rgba(39,39,42,0)", "rgba(39,39,42,1)"]
  );

  return (
    <motion.nav
      style={{ backgroundColor, borderColor: borderOpacity }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 border-b backdrop-blur-md"
    >
      <Link
        href="/"
        className="text-sm font-mono tracking-tighter font-bold text-white hover:text-emerald-200/90 transition-colors"
        style={{ transform: "none" }}
      >
        LAYER07 // STUDIO
      </Link>
      <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-400">
        <Link
          href="/#work"
          className="hover:text-white transition-colors duration-200"
          style={{ transform: "none" }}
        >
          Work
        </Link>
        <Link
          href="/capacidades"
          className="hover:text-white transition-colors duration-200"
          style={{ transform: "none" }}
        >
          Perfil
        </Link>
        <Link
          href="/#services"
          className="hover:text-white transition-colors duration-200"
          style={{ transform: "none" }}
        >
          Services
        </Link>
        <Link
          href="/#contact"
          className="hover:text-white transition-colors duration-200 underline decoration-zinc-700 underline-offset-4"
          style={{ transform: "none" }}
        >
          Briefing
        </Link>
      </div>
    </motion.nav>
  );
};
