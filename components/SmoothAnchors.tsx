"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Handles smooth scrolling for:
 * 1. Same-page hash links (e.g. "#faq", "/#faq" when already on "/")
 * 2. Landing with hash in URL without fighting manual user scrolling.
 */
export default function SmoothAnchors() {
  const pathname = usePathname();
  const hasScrolledRef = useRef(false);

  // Auto-scroll to hash on mount only if a hash is explicitly present
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash;
    // If no hash in URL, do nothing! Never attach scroll-fighting timers.
    if (!hash || hash === "#") return;

    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      return;
    }

    const scrollToHash = () => {
      if (hasScrolledRef.current) return;
      const target = document.getElementById(id);
      if (!target) return;

      hasScrolledRef.current = true;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    // Single delayed call after preloader/DOM finishes
    const timer = window.setTimeout(scrollToHash, 400);

    // Cancel auto-scroll if user starts scrolling manually
    const cancelAutoScroll = () => {
      hasScrolledRef.current = true;
      window.clearTimeout(timer);
    };

    window.addEventListener("wheel", cancelAutoScroll, { passive: true });
    window.addEventListener("touchstart", cancelAutoScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", cancelAutoScroll);
      window.removeEventListener("touchstart", cancelAutoScroll);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  // Intercept click on same-page links with hash
  useEffect(() => {
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

      const rawHref = anchor.getAttribute("href");
      if (!rawHref) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      // Check if it's pointing to the same page with a hash (e.g. "/#faq" or "#faq" on "/")
      const isSameOrigin = url.origin === window.location.origin;
      const isSamePath = url.pathname === window.location.pathname;
      const hasHash = Boolean(url.hash && url.hash !== "#");

      if (isSameOrigin && isSamePath && hasHash) {
        let id = url.hash.slice(1);
        try {
          id = decodeURIComponent(id);
        } catch {
          return;
        }

        const target = document.getElementById(id);
        if (!target) return;

        event.preventDefault();

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });

        window.history.pushState(window.history.state, "", url.hash);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
