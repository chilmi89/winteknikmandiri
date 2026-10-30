"use client";

import { ReactNode, useEffect, useRef } from "react";

type ParallaxMediaProps = {
  children: ReactNode;
  /** Jarak gerak relatif terhadap viewport. 0.06 = halus, 0.12 = jelas. */
  speed?: number;
  /** Skala awal untuk memberi ruang gerak di dalam frame. */
  scale?: number;
  className?: string;
};

export default function ParallaxMedia({
  children,
  speed = 0.06,
  scale = 1.08,
  className = "",
}: ParallaxMediaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreen = window.matchMedia("(max-width: 767px)");

    if (reducedMotion.matches || smallScreen.matches) return;

    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      if (!visible) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const distance = rect.top + rect.height / 2 - viewport / 2;
      const offset = distance * speed;

      element.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(${scale})`;
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) requestUpdate();
      },
      { rootMargin: "120px" }
    );

    observer.observe(element);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [scale, speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `scale(${scale})`, willChange: "transform" }}
    >
      {children}
    </div>
  );
}
