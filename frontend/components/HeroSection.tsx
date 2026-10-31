"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import ParallaxMedia from "@/components/ParallaxMedia";
import { site, waLink } from "@/lib/site";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ACFF8]";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

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
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/wtm-pemasangan.jpg"
          aria-hidden="true"
          tabIndex={-1}
          className="h-full w-full object-cover object-center"
        >
          <source src="/hero-section/video_hero_ac.mp4" type="video/mp4" />
        </video>
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
          

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            Kontraktor AC · Kediri · Sejak 2014
          </p>

          <h1 className="mt-6 max-w-6xl text-balance text-[3rem] font-semibold leading-[0.95] tracking-[-0.05em] text-white sm:text-[4.25rem] lg:text-[5rem]">
            <span className="text-[#FF6B6B]">WIN</span>{" "}
            <span className="text-[#8ACFF8]">TEKNIK MANDIRI</span>
            <span className="mt-1 block text-white">AC KEDIRI</span>
          </h1>


          <p className="mt-4 font-mono text-[20px] uppercase tracking-[0.22em] text-white/80">
            {site.tagline}
          </p>
          <p className="mt-6 max-w-xl text-pretty text-[15px] leading-7 text-white/75 sm:text-base">
            Pengadaan, instalasi, dan pemeliharaan AC serta ducting untuk
            hunian, komersial, dan industri di Kediri Raya
          </p>

          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={waLink(
                "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC atau ducting."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 bg-[#A82020] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Konsultasi via WhatsApp
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>

            <Link
              href="/layanan"
              className={`inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-[#0A2540] ${focusRing}`}
            >
              Lihat layanan
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
