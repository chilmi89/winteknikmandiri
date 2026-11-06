"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Globe } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  YouTubeIcon,
} from "@/components/SocialIcons";
import {
  defaultSosialMedia,
  fetchSosialMediaList,
  type SosialMediaItem,
} from "@/lib/sosialMedia";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

export default function SosialMediaCards() {
  const [items, setItems] = useState<SosialMediaItem[]>(defaultSosialMedia);

  useEffect(() => {
    let active = true;

    async function load() {
      const data = await fetchSosialMediaList();
      if (active && Array.isArray(data) && data.length > 0) {
        setItems(data);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  function getPlatformMeta(item: SosialMediaItem) {
    const key = (item.icon || item.nama).toLowerCase();

    if (key.includes("instagram")) {
      return {
        Icon: InstagramIcon,
        handleTagline: "@winteknikmandiri · Dokumentasi & Story Harian",
        borderColor: "hover:border-[#E1306C]",
        textColor: "group-hover:text-[#E1306C]",
        topLineColor: "bg-[#E1306C]",
        iconBoxHover:
          "group-hover:bg-[#E1306C] group-hover:text-white group-hover:border-[#E1306C]",
        shadowHover:
          "hover:shadow-[0_20px_40px_-20px_rgba(225,48,108,0.4),0_0_0_1px_rgba(225,48,108,0.3)]",
      };
    }

    if (key.includes("tiktok")) {
      return {
        Icon: TikTokIcon,
        handleTagline: "@winteknikmandiri · Tips & Video Lapangan",
        borderColor: "hover:border-[#010101]",
        textColor: "group-hover:text-[#010101]",
        topLineColor: "bg-[#010101]",
        iconBoxHover:
          "group-hover:bg-[#010101] group-hover:text-white group-hover:border-[#010101]",
        shadowHover:
          "hover:shadow-[0_20px_40px_-20px_rgba(1,1,1,0.4),0_0_0_1px_rgba(1,1,1,0.3)]",
      };
    }

    if (key.includes("facebook")) {
      return {
        Icon: FacebookIcon,
        handleTagline: "Win Teknik Mandiri · Informasi Resmi & Kemitraan",
        borderColor: "hover:border-[#1877F2]",
        textColor: "group-hover:text-[#1877F2]",
        topLineColor: "bg-[#1877F2]",
        iconBoxHover:
          "group-hover:bg-[#1877F2] group-hover:text-white group-hover:border-[#1877F2]",
        shadowHover:
          "hover:shadow-[0_20px_40px_-20px_rgba(24,119,242,0.4),0_0_0_1px_rgba(24,119,242,0.3)]",
      };
    }

    if (key.includes("youtube")) {
      return {
        Icon: YouTubeIcon,
        handleTagline: "Dokumentasi & Video Resmi",
        borderColor: "hover:border-[#FF0000]",
        textColor: "group-hover:text-[#FF0000]",
        topLineColor: "bg-[#FF0000]",
        iconBoxHover:
          "group-hover:bg-[#FF0000] group-hover:text-white group-hover:border-[#FF0000]",
        shadowHover:
          "hover:shadow-[0_20px_40px_-20px_rgba(255,0,0,0.4),0_0_0_1px_rgba(255,0,0,0.3)]",
      };
    }

    // Default untuk kanal kustom lainnya (seperti rsmad / web)
    const displayHandle =
      item.link.replace(/^https?:\/\/(www\.)?/, "").split("/")[0] || "Kanal Resmi";

    return {
      Icon: Globe,
      handleTagline: displayHandle,
      borderColor: "hover:border-[#2279CF]",
      textColor: "group-hover:text-[#2279CF]",
      topLineColor: "bg-[#2279CF]",
      iconBoxHover:
        "group-hover:bg-[#2279CF] group-hover:text-white group-hover:border-[#2279CF]",
      shadowHover:
        "hover:shadow-[0_20px_40px_-20px_rgba(34,121,207,0.4),0_0_0_1px_rgba(34,121,207,0.3)]",
    };
  }

  return (
    <div className="space-y-4">
      {items.map((social, index) => {
        const meta = getPlatformMeta(social);
        const IconComponent = meta.Icon;

        return (
          <ScrollReveal
            key={social.id || social.nama}
            delay={index * 100}
            direction="up"
          >
            <a
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-between overflow-hidden border border-[#0A2540]/10 bg-white p-6 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 ${meta.borderColor} ${meta.shadowHover} ${focusRing}`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 z-30 h-[2px] origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 ${meta.topLineColor}`}
              />
              <span
                aria-hidden="true"
                className="card-sheen pointer-events-none absolute inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0"
              />

              <div className="flex items-center gap-4">
                <span
                  className={`flex size-12 shrink-0 items-center justify-center border border-[#0A2540]/10 bg-[#0A2540]/5 text-[#0A2540] transition-all duration-300 ${meta.iconBoxHover}`}
                >
                  <IconComponent className="size-5" />
                </span>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A2540]/50">
                    Media Sosial Resmi
                  </p>
                  <h4
                    className={`mt-0.5 text-lg font-bold text-[#0A2540] transition-colors ${meta.textColor}`}
                  >
                    {social.nama}
                  </h4>
                  <p className="mt-0.5 font-mono text-xs text-[#0A2540]/65">
                    {meta.handleTagline}
                  </p>
                </div>
              </div>

              <span className="flex size-9 shrink-0 items-center justify-center text-[#0A2540]/40 transition-colors group-hover:text-[#0A2540]">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
