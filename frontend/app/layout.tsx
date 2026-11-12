import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Preloader from "@/components/LogoLoader";
import NavigationLoader from "@/components/NavigationLoader";
import SmoothAnchors from "@/components/SmoothAnchors";
import JsonLd from "@/components/JsonLd";
import { site } from "@/lib/site";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Service AC Kediri #1 Bergaransi & Kontraktor AC Komersial | CV Win Teknik Mandiri",
    template: "%s | CV Win Teknik Mandiri",
  },
  description:
    "Jasa service AC Kediri panggilan cepat & kontraktor AC komersial resmi. Melayani cuci AC higienis, bongkar pasang standar vakum, isi freon murni, perbaikan kompresor/PCB, hingga instalasi VRF dan fabrikasi ducting di Kediri Raya bergaransi tertulis 30 hari.",
  keywords: [
    "service ac kediri",
    "ac kediri",
    "jasa service ac kediri",
    "service ac panggilan kediri",
    "cuci ac kediri",
    "pasang ac kediri",
    "bongkar pasang ac kediri",
    "isi freon ac kediri",
    "tambah freon ac kediri",
    "kontraktor ac kediri",
    "tukang ac kediri",
    "teknisi ac kediri",
    "bengkel ac kediri",
    "service ac terdekat kediri",
    "service ac murah kediri",
    "service ac bergaransi kediri",
    "service ac ngadiluwih",
    "service ac pare kediri",
    "service ac mojoroto",
    "service ac pesantren kediri",
    "service ac kras kediri",
    "service ac kandat",
    "service ac wates kediri",
    "service ac gurah",
    "service ac plosoklaten",
    "service ac mojo kediri",
    "kontraktor hvac kediri",
    "instalasi ac vrf kediri",
    "fabrikasi ducting ac kediri",
    "service ac daikin kediri",
    "service ac panasonic kediri",
    "service ac sharp kediri",
    "service ac gree kediri",
    "cv win teknik mandiri",
  ],
  authors: [{ name: "CV Win Teknik Mandiri" }],
  creator: "CV Win Teknik Mandiri",
  publisher: "CV Win Teknik Mandiri",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: site.url,
    siteName: "CV Win Teknik Mandiri",
    title: "Service AC Kediri #1 Bergaransi & Kontraktor AC Komersial | CV Win Teknik Mandiri",
    description:
      "Jasa service AC Kediri panggilan cepat & kontraktor AC komersial resmi. Melayani cuci AC higienis, pasang AC vakum, isi freon murni, dan instalasi sistem tata udara komersial bergaransi 30 hari.",
    images: [
      {
        url: "/logo/logo_wtm.png",
        width: 800,
        height: 600,
        alt: "CV Win Teknik Mandiri - Jasa Service AC Kediri & Kontraktor HVAC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Service AC Kediri #1 Bergaransi & Kontraktor AC Komersial | CV Win Teknik Mandiri",
    description:
      "Jasa service AC Kediri panggilan cepat & kontraktor AC komersial resmi. Melayani cuci AC higienis, pasang AC vakum, isi freon murni, dan instalasi VRF di Kediri Raya bergaransi 30 hari.",
    images: ["/logo/logo_wtm.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "1Ga_zqwX4OnlZN9TkVJD5uszWMeQDUj7_zABR_RAqWE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "ID-JI",
    "geo.placename": "Kediri",
    "geo.position": "-7.8924;112.0152",
    ICBM: "-7.8924, 112.0152",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[#0a2540]">
        <script
          // Runs before the overlay markup is parsed: returning visitors get
          // `wtm-preloader-skip` so the preloader never flashes.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('wtm-preloader-seen')){document.documentElement.classList.add('wtm-preloader-skip')}}catch(e){}",
          }}
        />
        <noscript>
          <style>{`#wtm-preloader{display:none}`}</style>
        </noscript>
        <JsonLd />
        <Preloader />
        <NavigationLoader />
        <SmoothAnchors />
        {children}
      </body>
    </html>
  );
}
