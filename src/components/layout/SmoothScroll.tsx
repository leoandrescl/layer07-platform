"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis, setLenis } from "@/lib/scroll";

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      autoRaf: false,
      respectReducedMotion: true,
    });

    setLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Always start each route at the top: Lenis keeps its own scroll state, so it
  // has to be reset explicitly or it re-applies the previous position.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const reset = () => {
      const lenis = getLenis();
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(0, { immediate: true, force: true });
      } else {
        window.scrollTo(0, 0);
      }
    };

    reset();
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
