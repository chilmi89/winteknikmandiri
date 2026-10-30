"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogoLoaderMark } from "@/components/LogoLoader";

const MIN_VISIBLE_MS = 400;
const MAX_VISIBLE_MS = 2500;
const EXIT_MS = 450;

type Phase = "idle" | "visible" | "leaving";

const normalizePath = (p: string) => p.replace(/\/+$/, "") || "/";

/**
 * Branded overlay for client-side route changes.
 * Guaranteed single overlay, smooth exit, and normalized path comparisons
 * to prevent any unexpected hanging or flashing overlay.
 */
export default function NavigationLoader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");

  const activeRef = useRef(false);
  const leavingRef = useRef(false);
  const fromPathRef = useRef<string | null>(null);
  const currentPathRef = useRef(normalizePath(pathname));
  const startedAtRef = useRef(0);

  const minTimerRef = useRef<number | undefined>(undefined);
  const maxTimerRef = useRef<number | undefined>(undefined);
  const exitTimerRef = useRef<number | undefined>(undefined);

  const finish = useCallback(() => {
    if (!activeRef.current || leavingRef.current) return;
    leavingRef.current = true;

    window.clearTimeout(maxTimerRef.current);
    window.clearTimeout(minTimerRef.current);

    const elapsed = performance.now() - startedAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    minTimerRef.current = window.setTimeout(() => {
      setPhase("leaving");
      exitTimerRef.current = window.setTimeout(() => {
        activeRef.current = false;
        leavingRef.current = false;
        fromPathRef.current = null;
        setPhase("idle");
      }, EXIT_MS);
    }, wait);
  }, []);

  useEffect(() => {
    const start = (fromPath: string) => {
      if (activeRef.current) return;

      // If initial preloader is currently visible on screen, never start a competing loader!
      const preloader = document.getElementById("wtm-preloader");
      if (preloader && window.getComputedStyle(preloader).display !== "none") {
        return;
      }

      activeRef.current = true;
      leavingRef.current = false;
      fromPathRef.current = normalizePath(fromPath);
      startedAtRef.current = performance.now();
      setPhase("visible");

      window.clearTimeout(maxTimerRef.current);
      maxTimerRef.current = window.setTimeout(finish, MAX_VISIBLE_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const element = event.target;
      if (!(element instanceof Element)) return;

      const anchor = element.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.rel.includes("external")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      // Same page (including hash links) is handled by SmoothAnchors.
      if (normalizePath(url.pathname) === normalizePath(window.location.pathname)) {
        return;
      }

      start(window.location.pathname);
    };

    const onPopState = () => {
      start(currentPathRef.current);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.clearTimeout(minTimerRef.current);
      window.clearTimeout(maxTimerRef.current);
      window.clearTimeout(exitTimerRef.current);
    };
  }, [finish]);

  useEffect(() => {
    const next = normalizePath(pathname);
    currentPathRef.current = next;

    if (!activeRef.current) return;
    if (fromPathRef.current !== next) {
      finish();
    }
  }, [pathname, finish]);

  if (phase === "idle") return null;

  return (
    <div
      id="wtm-nav-loader"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#F4FAFE] ${
        phase === "leaving" ? "wtm-loader-leave" : ""
      }`}
    >
      <div className="wtm-loader-body">
        <LogoLoaderMark />
      </div>
      <span className="sr-only">Memuat halaman</span>
    </div>
  );
}
