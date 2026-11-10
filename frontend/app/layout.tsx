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
    default: "Service AC Kediri & Kontraktor AC Komersial | CV Win Teknik Mandiri",
    template: "%s | CV Win Teknik Mandiri",
  },
  description:
    "Jasa service AC Kediri profesional & kontraktor AC komersial. Melayani cuci AC rumah higienis, bongkar pasang AC standar vakum, isi freon murni, perbaikan kompresor, hingga instalasi VRF dan fabrikasi ducting di Kediri Raya bergaransi 30 hari.",
  keywords: [
    "service ac kediri",
    "ac kediri",
    "jasa ac kediri",
    "jasa ac",
    "ac rumah",
    "ac komersial",
    "kontraktor ac",
    "cuci ac kediri",
    "pasang ac kediri",
    "service ac panggilan kediri",
    "teknisi ac ngadiluwih",
    "kontraktor hvac kediri",
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
    title: "Service AC Kediri & Kontraktor AC Komersial | CV Win Teknik Mandiri",
    description:
      "Jasa service AC Kediri & kontraktor AC komersial terpercaya. Melayani cuci AC rumah, pasang baru, isi freon, perbaikan, dan instalasi sistem tata udara komersial bergaransi 30 hari.",
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
    title: "Service AC Kediri & Kontraktor AC Komersial | CV Win Teknik Mandiri",
    description:
      "Jasa service AC Kediri profesional & kontraktor AC komersial. Melayani cuci AC rumah, pasang AC vakum, isi freon, dan instalasi VRF di Kediri Raya.",
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
