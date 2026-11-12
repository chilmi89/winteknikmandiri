"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, LogIn } from "lucide-react";
import { site } from "@/lib/site";
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

interface NavbarProps {
  /**
   * "overlay" untuk hero gelap (transparan di atas, solid saat scroll).
   * "solid" untuk halaman dengan latar terang.
   */
  variant?: "solid" | "overlay";
  /** Paksa warna teks brand bila diperlukan. */
  brandTone?: "light" | "dark";
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A82020]";

const tentangKamiSections = [
  {
    number: "00",
    label: "Profil Lengkap",
    sublabel: "Ringkasan profil & fakta legalitas",
    href: "/tentang-kami",
  },
  {
    number: "01",
    label: "Our Journey",
    sublabel: "Rekam jejak & milestone sejak 2014",
    href: "/tentang-kami#perjalanan",
  },
  {
    number: "02",
    label: "Visi & Misi",
    sublabel: "Standar & komitmen mutu pengerjaan",
    href: "/tentang-kami#visi-misi",
  },
  {
    number: "03",
    label: "Legalitas Usaha",
    sublabel: "Izin Kemenkumham, NIB, NPWP & KBLI",
    href: "/tentang-kami#legalitas",
  },
  {
    number: "04",
    label: "Our Team & Workshop",
    sublabel: "Personil teknisi spesialis & sertifikasi",
    href: "/tentang-kami#tim",
  },
];

function getSocialMeta(item: SosialMediaItem, lightText: boolean) {
  const key = (item.icon || item.nama).toLowerCase();

  if (key.includes("instagram")) {
    return {
      Icon: InstagramIcon,
      hoverClass: lightText
        ? "hover:border-[#E1306C] hover:bg-[#E1306C]/20 hover:text-[#E1306C] hover:shadow-[0_0_14px_rgba(225,48,108,0.4)]"
        : "hover:border-[#E1306C] hover:bg-[#E1306C]/10 hover:text-[#E1306C] hover:shadow-[0_0_12px_rgba(225,48,108,0.25)]",
      footerHover: "hover:text-[#E1306C]",
    };
  }

  if (key.includes("tiktok")) {
    return {
      Icon: TikTokIcon,
      hoverClass: lightText
        ? "hover:border-white hover:bg-white/20 hover:text-white hover:shadow-[0_0_14px_rgba(255,255,255,0.35)]"
        : "hover:border-[#010101] hover:bg-slate-100 hover:text-[#010101] hover:shadow-[0_0_12px_rgba(0,0,0,0.15)]",
      footerHover: "hover:text-black",
    };
  }

  if (key.includes("facebook")) {
    return {
      Icon: FacebookIcon,
      hoverClass: lightText
        ? "hover:border-[#1877F2] hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:shadow-[0_0_14px_rgba(24,119,242,0.4)]"
        : "hover:border-[#1877F2] hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:shadow-[0_0_12px_rgba(24,119,242,0.25)]",
      footerHover: "hover:text-[#1877F2]",
    };
  }

  if (key.includes("youtube")) {
    return {
      Icon: YouTubeIcon,
      hoverClass: lightText
        ? "hover:border-[#FF0000] hover:bg-[#FF0000]/20 hover:text-[#FF0000] hover:shadow-[0_0_14px_rgba(255,0,0,0.4)]"
        : "hover:border-[#FF0000] hover:bg-[#FF0000]/10 hover:text-[#FF0000] hover:shadow-[0_0_12px_rgba(255,0,0,0.25)]",
      footerHover: "hover:text-[#FF0000]",
    };
  }

  return {
    Icon: Globe,
    hoverClass: lightText
      ? "hover:border-[#8ACFF8] hover:bg-[#8ACFF8]/20 hover:text-[#8ACFF8] hover:shadow-[0_0_14px_rgba(138,207,248,0.4)]"
      : "hover:border-[#2279CF] hover:bg-[#2279CF]/10 hover:text-[#2279CF] hover:shadow-[0_0_12px_rgba(34,121,207,0.25)]",
    footerHover: "hover:text-[#2279CF]",
  };
}

export default function Navbar({
  variant = "solid",
  brandTone,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [socials, setSocials] = useState<SosialMediaItem[]>(defaultSosialMedia);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let active = true;
    async function loadSocials() {
      const data = await fetchSosialMediaList();
      if (active && Array.isArray(data) && data.length > 0) {
        setSocials(data);
      }
    }
    void loadSocials();
    return () => {
      active = false;
    };
  }, []);

  const transparent = variant === "overlay" && !scrolled;
  const solidHeader = !transparent || open;
  const lightText = brandTone ? brandTone === "light" : !solidHeader;

  useEffect(() => {
    if (variant !== "overlay") return;
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Tutup dropdown saat rute berpindah
  useEffect(() => {
    setAboutDropdownOpen(false);
    setOpen(false);
  }, [pathname]);

  const handleMouseEnterAbout = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setAboutDropdownOpen(true);
  };

  const handleMouseLeaveAbout = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 180);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transform-gpu transition-colors duration-300 ${
        solidHeader
          ? "border-b border-[#0A2540]/10 bg-white/98 shadow-[0_1px_3px_rgba(10,37,64,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className={`flex h-10 shrink-0 items-center gap-2.5 ${focusRing}`}
          aria-label="CV Win Teknik Mandiri — Beranda"
        >
          <Image
            src="/logo/logo_wtm.png"
            alt=""
            width={44}
            height={37}
            className="h-8.5 w-auto object-contain"
            priority
          />
          <span
            className={`text-base font-semibold leading-none tracking-[-0.01em] transition-colors sm:text-lg ${
              lightText
                ? "text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]"
                : "text-[#0A2540]"
            }`}
          >
            WIN TEKNIK <span className="text-[#A82020]">MANDIRI</span>
          </span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-8 lg:flex"
        >
          {site.navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href;

            // Dropdown menu khusus untuk Tentang Kami
            if (link.href === "/tentang-kami") {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={handleMouseEnterAbout}
                  onMouseLeave={handleMouseLeaveAbout}
                >
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    aria-expanded={aboutDropdownOpen}
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`relative inline-flex h-10 items-center gap-1.5 text-[13px] font-medium tracking-wide transition-colors after:absolute after:bottom-1 after:left-0 after:h-[2px] after:w-full after:transition-all ${
                      lightText
                        ? isActive
                          ? "text-white after:bg-white after:opacity-100"
                          : "text-white/75 after:bg-white after:opacity-0 hover:text-white hover:after:opacity-100"
                        : isActive
                          ? "text-[#A82020] after:bg-[#A82020] after:opacity-100"
                          : "text-[#0A2540]/70 after:bg-[#A82020] after:opacity-0 hover:text-[#0A2540] hover:after:opacity-100"
                    } ${focusRing}`}
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${
                        aboutDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Link>

                  {/* Dropdown Panel Desktop */}
                  {aboutDropdownOpen && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 z-50 w-76">
                      <div className="overflow-hidden rounded-xl border border-[#0A2540]/10 bg-white/98 p-1.5 shadow-[0_16px_40px_rgba(10,37,64,0.14)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-1.5 border-b border-[#0A2540]/5">
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#0A2540]/50">
                            Bagian Profil Perusahaan
                          </p>
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {tentangKamiSections.map((sec) => (
                            <Link
                              key={sec.href}
                              href={sec.href}
                              onClick={() => setAboutDropdownOpen(false)}
                              className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#F4FAFE]"
                            >
                              <span className="font-mono text-[11px] font-bold text-[#A82020] mt-0.5 transition-transform group-hover:scale-110">
                                {sec.number}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#0A2540] group-hover:text-[#A82020] transition-colors leading-tight">
                                  {sec.label}
                                </p>
                                <p className="text-[10.5px] text-[#0A2540]/60 truncate mt-0.5">
                                  {sec.sublabel}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative inline-flex h-10 items-center text-[13px] font-medium tracking-wide transition-colors after:absolute after:bottom-1 after:left-0 after:h-[2px] after:w-full after:transition-all ${
                  lightText
                    ? isActive
                      ? "text-white after:bg-white after:opacity-100"
                      : "text-white/75 after:bg-white after:opacity-0 hover:text-white hover:after:opacity-100"
                    : isActive
                      ? "text-[#A82020] after:bg-[#A82020] after:opacity-100"
                      : "text-[#0A2540]/70 after:bg-[#A82020] after:opacity-0 hover:text-[#0A2540] hover:after:opacity-100"
                } ${focusRing}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop Login Button */}
          <Link
            href="/login"
            className={`hidden h-10 items-center gap-2 rounded-lg border px-3.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 sm:inline-flex ${
              lightText
                ? "border-white/30 text-white hover:border-white hover:bg-white/10"
                : "border-[#0A2540]/20 text-[#0A2540] hover:border-[#0A2540] hover:bg-[#0A2540]/5"
            } ${focusRing}`}
          >
            <LogIn className="size-4" aria-hidden="true" />
            <span>Login</span>
          </Link>

          {/* Tombol Ikon Media Sosial Bersebelahan (Desktop & Tablet) */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {socials.map((social) => {
              const meta = getSocialMeta(social, lightText);
              const IconComponent = meta.Icon;

              return (
                <a
                  key={social.id || social.nama}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Kunjungi akun ${social.nama} CV Win Teknik Mandiri`}
                  className={`inline-flex size-10 items-center justify-center rounded-lg border transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                    lightText
                      ? "border-white/25 bg-white/5 text-white/90"
                      : "border-[#0A2540]/15 bg-white text-[#0A2540] shadow-xs"
                  } ${meta.hoverClass} ${focusRing}`}
                >
                  <IconComponent className="size-4.5" />
                </a>
              );
            })}
          </div>

          {/* Mobile Login Button (Hanya tampil di layar kecil < sm) */}
          <Link
            href="/login"
            aria-label="Login ke akun"
            className={`inline-flex size-10 items-center justify-center rounded-lg border transition-all duration-200 active:scale-95 sm:hidden ${
              lightText
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-[#0A2540]/15 text-[#0A2540] hover:bg-[#F4FAFE]"
            } ${focusRing}`}
          >
            <LogIn className="size-4" aria-hidden="true" />
          </Link>

          {/* Tombol Hamburger Animatif (Mobile) */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className={`relative flex size-10 flex-col items-center justify-center gap-1.5 rounded-lg border transition-all duration-200 active:scale-95 lg:hidden ${
              lightText
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-[#0A2540]/15 text-[#0A2540] hover:bg-[#F4FAFE]"
            } ${focusRing}`}
          >
            <span
              className={`h-[2px] w-5 rounded-full transition-all duration-300 ease-in-out ${
                lightText ? "bg-white" : "bg-[#0A2540]"
              } ${open ? "translate-y-[8px] rotate-45" : ""}`}
            />
            <span
              className={`h-[2px] w-5 rounded-full transition-all duration-200 ease-in-out ${
                lightText ? "bg-white" : "bg-[#0A2540]"
              } ${open ? "opacity-0 scale-x-0" : "opacity-100"}`}
            />
            <span
              className={`h-[2px] w-5 rounded-full transition-all duration-300 ease-in-out ${
                lightText ? "bg-white" : "bg-[#0A2540]"
              } ${open ? "-translate-y-[8px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer yang Rapi, Minimalis & Animatif */}
      <div
        id="mobile-navigation"
        className={`grid transition-all duration-300 ease-in-out lg:hidden ${
          open
            ? "grid-rows-[1fr] opacity-100 border-t border-[#0A2540]/10"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden bg-white/98 shadow-xl backdrop-blur-md">
          <nav
            aria-label="Navigasi seluler"
            className="mx-auto max-w-7xl px-4 py-4 sm:px-6 space-y-4"
          >
            {/* List Menu Link */}
            <ul className="divide-y divide-[#0A2540]/5">
              {site.navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href;

                // Sub-menu accordion untuk Tentang Kami di mobile
                if (link.href === "/tentang-kami") {
                  return (
                    <li key={link.href} className="py-1">
                      <div className="flex items-center justify-between py-2.5">
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={`text-sm font-medium transition-colors ${
                            isActive
                              ? "text-[#A82020] font-semibold"
                              : "text-[#0A2540]/80 hover:text-[#0A2540]"
                          } ${focusRing}`}
                        >
                          {link.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setMobileAboutOpen((val) => !val)}
                          aria-label="Buka sub-menu bagian Tentang Kami"
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#0A2540]/60 hover:bg-[#0A2540]/5 hover:text-[#A82020]"
                        >
                          <span className="font-mono text-[10px] uppercase tracking-wider">Bagian</span>
                          <ChevronDown
                            className={`size-3.5 transition-transform duration-200 ${
                              mobileAboutOpen ? "rotate-180 text-[#A82020]" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Sub-menu accordion */}
                      <div
                        className={`grid transition-all duration-200 ease-in-out ${
                          mobileAboutOpen
                            ? "grid-rows-[1fr] opacity-100 mb-2"
                            : "grid-rows-[0fr] opacity-0 pointer-events-none"
                        }`}
                      >
                        <div className="overflow-hidden border-l-2 border-[#A82020]/25 pl-3 space-y-1 py-1">
                          {tentangKamiSections.map((sec) => (
                            <Link
                              key={sec.href}
                              href={sec.href}
                              onClick={() => {
                                setOpen(false);
                                setMobileAboutOpen(false);
                              }}
                              className="flex items-center gap-2 py-1.5 text-xs text-[#0A2540]/75 hover:text-[#A82020] transition-colors"
                            >
                              <span className="font-mono text-[10.5px] font-bold text-[#A82020]">
                                {sec.number}
                              </span>
                              <span>{sec.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-[#A82020] font-semibold"
                          : "text-[#0A2540]/80 hover:text-[#0A2540]"
                      } ${focusRing}`}
                    >
                      <span>{link.label}</span>
                      {isActive ? (
                        <span className="size-1.5 rounded-full bg-[#A82020]" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Bagian Ikon Media Sosial di Mobile Drawer */}
            <div className="pt-2 border-t border-[#0A2540]/10">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0A2540]/50 mb-2.5">
                Media Sosial Resmi
              </p>
              <div className="grid grid-cols-3 gap-2">
                {socials.map((social) => {
                  const meta = getSocialMeta(social, false);
                  const IconComponent = meta.Icon;

                  return (
                    <a
                      key={social.id || social.nama}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-[#0A2540]/10 bg-[#0A2540]/[0.02] p-2.5 text-xs text-[#0A2540]/80 transition-all duration-200 active:scale-95 hover:border-current hover:bg-white ${meta.footerHover} ${focusRing}`}
                    >
                      <IconComponent className="size-4" />
                      <span className="text-[11px] font-medium truncate max-w-full">
                        {social.nama}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Tombol Login di Mobile Drawer */}
            <div className="pt-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#0A2540]/20 bg-[#0A2540]/[0.02] text-xs font-semibold text-[#0A2540] transition-colors hover:bg-[#0A2540]/5 ${focusRing}`}
              >
                <LogIn className="size-3.5" aria-hidden="true" />
                <span>Masuk ke Akun Admin</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
