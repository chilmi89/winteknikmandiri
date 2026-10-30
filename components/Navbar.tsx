"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, X } from "lucide-react";
import { site, waLink } from "@/lib/site";

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

export default function Navbar({
  variant = "solid",
  brandTone,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
          className={`flex shrink-0 items-center gap-2.5 ${focusRing}`}
          aria-label="CV Win Teknik Mandiri — Beranda"
        >
          <Image
            src="/logo/logo_wtm.png"
            alt=""
            width={44}
            height={37}
            className="h-9 w-auto object-contain"
            priority
          />
          <span
            className={`text-base font-semibold tracking-[-0.01em] transition-colors sm:text-lg ${
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
          className="hidden items-center gap-7 lg:flex"
        >
          {site.navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative py-2 text-[13px] font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-current after:opacity-0 after:transition-opacity hover:after:opacity-100 ${
                  lightText
                    ? isActive
                      ? "text-white after:opacity-100"
                      : "text-white/70 hover:text-white"
                    : isActive
                      ? "text-[#A82020] after:opacity-100"
                      : "text-[#0A2540]/65 hover:text-[#0A2540]"
                } ${focusRing}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href={waLink(
              "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC."
            )}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Konsultasi via WhatsApp"
            className={`inline-flex size-10 items-center justify-center border transition-colors sm:hidden ${
              lightText
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-[#0A2540]/15 text-[#A82020] hover:bg-[#F4FAFE]"
            } ${focusRing}`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href={waLink(
              "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden items-center gap-2 bg-[#A82020] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#8e1919] sm:inline-flex ${focusRing}`}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Konsultasi
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className={`inline-flex size-10 items-center justify-center border transition-colors lg:hidden ${
              lightText
                ? "border-white/30 text-white hover:bg-white/10"
                : "border-[#0A2540]/15 text-[#0A2540] hover:bg-[#F4FAFE]"
            } ${focusRing}`}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="border-t border-[#0A2540]/10 bg-white lg:hidden"
        >
          <nav
            aria-label="Navigasi seluler"
            className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
          >
            <ul className="divide-y divide-[#0A2540]/10">
              {site.navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`block py-3.5 text-sm font-medium transition-colors hover:text-[#A82020] ${
                        isActive ? "text-[#A82020]" : "text-[#0A2540]"
                      } ${focusRing}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href={waLink(
                "Halo CV Win Teknik Mandiri, saya ingin berkonsultasi mengenai kebutuhan AC."
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`mt-4 flex items-center justify-center gap-2 bg-[#A82020] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#8e1919] ${focusRing}`}
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Konsultasi via WhatsApp
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
