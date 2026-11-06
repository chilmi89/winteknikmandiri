"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe, Mail, MapPin, MessageCircle } from "lucide-react";
import { site, waLink } from "@/lib/site";
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
import {
  fetchJamOperasional,
  type JamOperasionalItem,
} from "@/lib/jamOperasional";

type SiteFooterProps = {
  activeHref?: string;
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A82020]";

function getFooterSocialMeta(item: SosialMediaItem) {
  const key = (item.icon || item.nama).toLowerCase();

  if (key.includes("instagram")) {
    return {
      Icon: InstagramIcon,
      hoverClass: "hover:text-[#E1306C] hover:border-[#E1306C]/40",
    };
  }
  if (key.includes("tiktok")) {
    return {
      Icon: TikTokIcon,
      hoverClass: "hover:text-black hover:border-black/40",
    };
  }
  if (key.includes("facebook")) {
    return {
      Icon: FacebookIcon,
      hoverClass: "hover:text-[#1877F2] hover:border-[#1877F2]/40",
    };
  }
  if (key.includes("youtube")) {
    return {
      Icon: YouTubeIcon,
      hoverClass: "hover:text-[#FF0000] hover:border-[#FF0000]/40",
    };
  }
  return {
    Icon: Globe,
    hoverClass: "hover:text-[#2279CF] hover:border-[#2279CF]/40",
  };
}

export default function SiteFooter({ activeHref }: SiteFooterProps) {
  const [socials, setSocials] = useState<SosialMediaItem[]>(defaultSosialMedia);
  const [hours, setHours] = useState<{ label: string; value: string }[]>(() =>
    site.hours.map((it) => ({ label: it.label, value: it.value }))
  );

  useEffect(() => {
    let active = true;

    async function loadFooterData() {
      const [sosmedData, jamData] = await Promise.all([
        fetchSosialMediaList(),
        fetchJamOperasional(),
      ]);

      if (active) {
        if (Array.isArray(sosmedData) && sosmedData.length > 0) {
          setSocials(sosmedData);
        }
        if (jamData && Array.isArray(jamData.items) && jamData.items.length > 0) {
          setHours(
            jamData.items.map((it: JamOperasionalItem) => ({
              label: it.day_label,
              value: it.is_closed ? "Libur" : it.hours,
            }))
          );
        }
      }
    }

    void loadFooterData();
    return () => {
      active = false;
    };
  }, []);
  return (
    <footer className="border-t border-[#0A2540]/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-14 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Link
              href="/"
              className={`inline-flex items-center gap-2.5 ${focusRing}`}
              aria-label="CV Win Teknik Mandiri — Beranda"
            >
              <Image
                src="/logo/logo_wtm.png"
                alt=""
                width={40}
                height={34}
                className="h-8 w-auto object-contain"
              />
              <span className="text-base font-semibold tracking-[-0.01em] text-[#0A2540]">
                WIN TEKNIK <span className="text-[#A82020]">MANDIRI</span>
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#0A2540]/60">
              Kontraktor AC, ducting, dan tata udara untuk hunian, komersial,
              dan industri di Kediri Raya. Berdiri sejak 2014.
            </p>

            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-5 flex max-w-sm items-start gap-2.5 text-sm leading-6 text-[#0A2540]/65 transition-colors hover:text-[#A82020] ${focusRing}`}
            >
              <MapPin className="mt-1 size-4 shrink-0 text-[#A82020]" aria-hidden="true" />
              <span>{site.address}</span>
            </a>
          </div>

          <nav aria-label="Navigasi footer" className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/45">
              Navigasi
            </p>
            <ul className="mt-4 space-y-2.5">
              {site.navLinks.map((link) => {
                const isActive = activeHref === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`text-sm transition-colors hover:text-[#A82020] ${
                        isActive ? "text-[#A82020]" : "text-[#0A2540]/70"
                      } ${focusRing}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0A2540]/45">
              Kontak & jam operasional
            </p>

            <dl className="mt-4 space-y-1.5">
              {hours.map((entry) => (
                <div
                  key={entry.label}
                  className="flex items-baseline justify-between gap-4 text-sm"
                >
                  <dt className="text-[#0A2540]/60">{entry.label}</dt>
                  <dd className="font-medium text-[#0A2540]">{entry.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 space-y-2.5">
              <a
                href={waLink(
                  "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2.5 text-sm font-medium text-[#0A2540] transition-colors hover:text-[#A82020] ${focusRing}`}
              >
                <MessageCircle className="size-4 text-[#A82020]" aria-hidden="true" />
                {site.phoneDisplay}
              </a>

              <a
                href={`mailto:${site.email}`}
                className={`flex items-center gap-2.5 text-sm text-[#0A2540]/70 transition-colors hover:text-[#A82020] ${focusRing}`}
              >
                <Mail className="size-4 text-[#A82020]" aria-hidden="true" />
                {site.email}
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {socials.map((social) => {
                const meta = getFooterSocialMeta(social);
                const IconComponent = meta.Icon;

                return (
                  <a
                    key={social.id || social.nama}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 border border-[#0A2540]/10 bg-[#0A2540]/5 px-2.5 py-1 text-xs text-[#0A2540]/65 transition-all duration-300 hover:border-current hover:bg-white ${meta.hoverClass} ${focusRing}`}
                  >
                    <IconComponent className="size-3.5" />
                    <span>{social.nama}</span>
                    <ArrowUpRight className="size-2.5 opacity-60" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#0A2540]/10 py-6 text-xs text-[#0A2540]/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 {site.name}. Seluruh hak cipta dilindungi.
          </p>
          <p className="font-mono tracking-[0.06em]">
            {site.legal.ahu} · NIB {site.legal.nib}
          </p>
        </div>
      </div>
    </footer>
  );
}
