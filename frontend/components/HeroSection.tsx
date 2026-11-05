"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import ParallaxMedia from "@/components/ParallaxMedia";
import { site, waLink } from "@/lib/site";
import { fetchHomeHero } from "@/lib/dashboard/homeHero";
import type { HomeHeroData } from "@/components/dashboard/home-hero/HomeHeroManager";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ACFF8]";

const DEFAULT_BADGE = "Kontraktor AC · Kediri · Sejak 2014";
const DEFAULT_TITLE = "WIN TEKNIK MANDIRI AC KEDIRI";
const DEFAULT_SLOGAN = "FRESH AIR, FRESH MIND, YOUR AC SOLUTIONS";
const DEFAULT_DESC =
  "Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk hunian, komersial, dan industri di Kediri Raya";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hero, setHero] = useState<HomeHeroData | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHero() {
      const data = await fetchHomeHero();
      if (active && data && data.is_active) {
        setHero(data);
      }
    }

    void loadHero();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      return;
    }

    video.play().catch(() => {});
  }, [reducedMotion]);

  // Ekstrak kata untuk render warna kustom per kata
  const badgeWords = useMemo(
    () => (hero?.badge_text || DEFAULT_BADGE).split(/\s+/).filter(Boolean),
    [hero?.badge_text]
  );
  const titleWords = useMemo(
    () => (hero?.title || DEFAULT_TITLE).split(/\s+/).filter(Boolean),
    [hero?.title]
  );
  const sloganWords = useMemo(
    () => (hero?.slogan || site.tagline || DEFAULT_SLOGAN).split(/\s+/).filter(Boolean),
    [hero?.slogan]
  );
  const descriptionWords = useMemo(
    () => (hero?.description || DEFAULT_DESC).split(/\s+/).filter(Boolean),
    [hero?.description]
  );

  const mediaType = hero?.media_type || "video";
  const mediaUrl = hero?.media_url || "/hero-section/video_hero_ac.mp4";
  const thumbnailUrl = hero?.thumbnail_url || "/images/wtm-pemasangan.jpg";

  return (
    <section
      id="home"
      className="relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-[#0A2540]"
    >
      <ParallaxMedia
        speed={0.1}
        scale={1.12}
        className="absolute inset-0 overflow-hidden"
      >
        {mediaType === "video" ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={thumbnailUrl}
            aria-hidden="true"
            tabIndex={-1}
            key={mediaUrl}
            className="h-full w-full object-cover object-center"
          >
            <source src={mediaUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full bg-cover bg-center object-cover"
            style={{ backgroundImage: `url(${mediaUrl})` }}
          />
        )}
      </ParallaxMedia>

      <div aria-hidden="true" className="absolute inset-0 bg-[#0A2540]/45" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/80 via-[#0A2540]/40 to-[#0A2540]/90"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A2540] to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Badge Atas dengan Warna Per Kata */}
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] flex flex-wrap justify-center gap-x-1.5">
            {badgeWords.map((word, i) => (
              <span
                key={i}
                style={{
                  color: hero?.badge_colors[i] || "rgba(255, 255, 255, 0.55)",
                }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* Judul H1 dengan Warna Per Kata */}
          <h1 className="mt-6 max-w-6xl text-balance text-[3rem] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[4.25rem] lg:text-[5rem] flex flex-wrap justify-center gap-x-2">
            {titleWords.map((word, i) => {
              // Default branding bila belum ada kustom: WIN (merah), TEKNIK MANDIRI (biru), AC KEDIRI (putih)
              const fallbackColor =
                i === 0
                  ? "#FF6B6B"
                  : i === 1 || i === 2
                  ? "#2279CF"
                  : "#FFFFFF";

              return (
                <span
                  key={i}
                  style={{
                    color: hero?.title_colors[i] || fallbackColor,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </h1>

          {/* Slogan dengan Warna Per Kata */}
          <p className="mt-4 font-mono text-[18px] sm:text-[20px] uppercase tracking-[0.22em] flex flex-wrap justify-center gap-x-1.5">
            {sloganWords.map((word, i) => (
              <span
                key={i}
                style={{
                  color: hero?.slogan_colors[i] || "rgba(255, 255, 255, 0.8)",
                }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* Deskripsi dengan Warna Per Kata */}
          <p className="mt-6 max-w-xl text-pretty text-[15px] leading-7 sm:text-base flex flex-wrap justify-center gap-x-1">
            {descriptionWords.map((word, i) => (
              <span
                key={i}
                style={{
                  color:
                    hero?.description_colors[i] || "rgba(255, 255, 255, 0.75)",
                }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* Tombol CTA */}
          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={
                hero?.cta_primary_url ||
                waLink(
                  "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC atau ducting."
                )
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 bg-[#A82020] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {hero?.cta_primary_text || "Konsultasi via WhatsApp"}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>

            <Link
              href={hero?.cta_secondary_url || "/layanan"}
              className={`inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-[#0A2540] ${focusRing}`}
            >
              {hero?.cta_secondary_text || "Lihat layanan"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
