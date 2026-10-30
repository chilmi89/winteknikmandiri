export const site = {
  name: "CV Win Teknik Mandiri",
  legalName: "CV WIN TEKNIK MANDIRI",
  tagline: "Fresh Air, Fresh Mind, Your AC Solutions",
  description:
    "Kontraktor AC, ducting, dan tata udara untuk hunian, komersial, dan industri di Kediri Raya.",
  phone: "6281216622840",
  phoneDisplay: "+62 812-1662-2840",
  email: "cswinteknikmandiri@gmail.com",
  address:
    "Dusun Selomanen, Desa Purwokerto, Kec. Ngadiluwih, Kab. Kediri, Jawa Timur",
  mapsUrl: "https://maps.app.goo.gl/W2qiypTupnmwVVay7",
  legal: {
    ahu: "AHU-0066756-AH.01.14",
    year: "2026",
    nib: "1310260079829",
    npwp: "1000000011517477",
    kbli: ["43224", "71109"],
  },
  hours: [
    { label: "Senin – Jumat", value: "08.00 – 16.00" },
    { label: "Sabtu", value: "08.00 – 12.00" },
    { label: "Minggu & tanggal merah", value: "Libur" },
  ],
  navLinks: [
    { label: "Beranda", href: "/" },
    { label: "Layanan", href: "/layanan" },
    { label: "Tentang Kami", href: "/tentang-kami" },
    { label: "Galeri", href: "/galeri" },
    { label: "FAQ", href: "/#faq" },
    { label: "Kontak", href: "/kontak" },
  ],
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/winteknikmandiri?xtok=MWcxbWdteXR5YTNuMQ==",
    },
    {
      label: "TikTok",
      href: "https://www.tiktok.com/@winteknikmandiri?_r=1&_t=ZS-9AmW2KKxbPB",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/1By3XGtpVT/",
    },
  ],
} as const;

export function waLink(message: string) {
  return `https://wa.me/${site.phone}?text=${encodeURIComponent(message)}`;
}
