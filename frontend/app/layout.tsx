import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Preloader from "@/components/LogoLoader";
import NavigationLoader from "@/components/NavigationLoader";
import SmoothAnchors from "@/components/SmoothAnchors";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Win Teknik Mandiri Kediri | Jasa Service & Pemasangan AC Ngadiluwih",
  description:
    "Jasa service AC profesional panggilan Kediri, cuci AC higienis, pemasangan baru standar vakum pipa, tambah freon, dan perbaikan AC bergaransi resmi 30 hari. Workshop di Dusun Selomanen, Desa Purwokerto, Kec. Ngadiluwih, Kab. Kediri.",
  icons: {
    icon: "/logo/logo_wtm.png",
    apple: "/logo/logo_wtm.png",
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
        <Preloader />
        <NavigationLoader />
        <SmoothAnchors />
        {children}
      </body>
    </html>
  );
}
