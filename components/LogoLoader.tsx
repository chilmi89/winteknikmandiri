"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SESSION_KEY = "wtm-preloader-seen";
const SKIP_CLASS = "wtm-preloader-skip";
const MIN_VISIBLE_MS = 600;
const MAX_VISIBLE_MS = 1400;
const EXIT_MS = 450;

type Phase = "loading" | "leaving" | "hidden";

const waveDelays = [
  "wtm-wave-1",
  "wtm-wave-2",
  "wtm-wave-3",
  "wtm-wave-4",
  "wtm-wave-5",
];

const waveColors = [
  "bg-[#A82020]",
  "bg-[#8ACFF8]",
  "bg-[#A82020]",
  "bg-[#8ACFF8]",
  "bg-[#A82020]",
];

/** Presentational logo loader: pulsing mark over a five-bar wave. */
export function LogoLoaderMark() {
  return (
    <div aria-hidden="true" className="flex flex-col items-center">
      <Image
        src="/logo/logo_wtm-loader.png"
        alt=""
        width={240}
        height={199}
        preload
        sizes="96px"
        className="wtm-logo-pulse h-auto w-[76px] sm:w-[84px]"
      />

      <div className="mt-7 flex h-9 items-end gap-1.5">
        {waveDelays.map((delayClass, index) => (
          <span
            key={delayClass}
            className={`wtm-wave-bar h-full w-1.5 ${waveColors[index]} ${delayClass}`}
          />
        ))}
      </div>

      <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.26em] text-[#0A2540]/45">
        Memuat
      </p>
    </div>
  );
}

/**
 * Brand preloader shown once per browser session on the first full page load.
 *
 * The inline script in the root layout adds `wtm-preloader-skip` to <html>
 * when the session flag already exists, so returning visitors never see a
 * flash of the overlay.
 */
export default function Preloader() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    if (document.documentElement.classList.contains(SKIP_CLASS)) {
      // The inline script already hid the overlay via CSS; leave the markup
      // parked instead of toggling state during hydration.
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Private mode / storage blocked: still show the loader.
    }

    const startedAt = performance.now();
    let finished = false;
    let leaveTimer: number | undefined;

    const beginLeave = () => {
      if (finished) return;
      finished = true;
      const remaining = Math.max(
        0,
        MIN_VISIBLE_MS - (performance.now() - startedAt),
      );
      leaveTimer = window.setTimeout(() => setPhase("leaving"), remaining);
    };

    if (document.readyState === "complete") {
      beginLeave();
    } else {
      window.addEventListener("load", beginLeave, { once: true });
    }

    const maxTimer = window.setTimeout(beginLeave, MAX_VISIBLE_MS);

    return () => {
      window.removeEventListener("load", beginLeave);
      window.clearTimeout(maxTimer);
      if (leaveTimer !== undefined) window.clearTimeout(leaveTimer);
    };
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    const timer = window.setTimeout(() => setPhase("hidden"), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "hidden") return;
    if (document.documentElement.classList.contains(SKIP_CLASS)) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      id="wtm-preloader"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F4FAFE] ${
        phase === "leaving" ? "wtm-loader-leave" : ""
      }`}
    >
      <div className="wtm-loader-body">
        <LogoLoaderMark />
      </div>
      <span className="sr-only">Memuat situs Win Teknik Mandiri</span>
    </div>
  );
}
