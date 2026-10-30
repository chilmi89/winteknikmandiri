import React from "react";

export function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.102a2.895 2.895 0 0 1 2.373-4.512c.277 0 .546.04.802.114V9.382a6.34 6.34 0 0 0-.802-.051 6.34 6.34 0 0 0-6.339 6.34 6.34 0 0 0 6.34 6.34 6.34 0 0 0 6.339-6.34V8.718a8.21 8.21 0 0 0 4.771 1.516V6.789a4.807 4.807 0 0 1-1-.103z" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export const socialBrandConfig = {
  Instagram: {
    name: "Instagram",
    handle: "@winteknikmandiri",
    tagline: "Dokumentasi & Story Harian",
    brandColor: "#E1306C",
    borderColor: "hover:border-[#E1306C]",
    textColor: "group-hover:text-[#E1306C]",
    topLineColor: "bg-[#E1306C]",
    iconBoxHover:
      "group-hover:bg-[#E1306C] group-hover:text-white group-hover:border-[#E1306C]",
    shadowHover:
      "hover:shadow-[0_20px_40px_-20px_rgba(225,48,108,0.4),0_0_0_1px_rgba(225,48,108,0.3)]",
    footerHover: "hover:text-[#E1306C]",
    Icon: InstagramIcon,
  },
  TikTok: {
    name: "TikTok",
    handle: "@winteknikmandiri",
    tagline: "Tips & Video Lapangan",
    brandColor: "#010101",
    borderColor: "hover:border-[#010101]",
    textColor: "group-hover:text-[#010101]",
    topLineColor: "bg-[#010101]",
    iconBoxHover:
      "group-hover:bg-[#010101] group-hover:text-white group-hover:border-[#010101]",
    shadowHover:
      "hover:shadow-[0_20px_40px_-20px_rgba(1,1,1,0.4),0_0_0_1px_rgba(1,1,1,0.3)]",
    footerHover: "hover:text-black",
    Icon: TikTokIcon,
  },
  Facebook: {
    name: "Facebook",
    handle: "Win Teknik Mandiri",
    tagline: "Informasi Resmi & Kemitraan",
    brandColor: "#1877F2",
    borderColor: "hover:border-[#1877F2]",
    textColor: "group-hover:text-[#1877F2]",
    topLineColor: "bg-[#1877F2]",
    iconBoxHover:
      "group-hover:bg-[#1877F2] group-hover:text-white group-hover:border-[#1877F2]",
    shadowHover:
      "hover:shadow-[0_20px_40px_-20px_rgba(24,119,242,0.4),0_0_0_1px_rgba(24,119,242,0.3)]",
    footerHover: "hover:text-[#1877F2]",
    Icon: FacebookIcon,
  },
} as const;
