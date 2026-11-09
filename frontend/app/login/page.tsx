import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login — Portal Klien & Mitra CV Win Teknik Mandiri",
  description:
    "Masuk ke portal layanan dan manajemen proyek CV Win Teknik Mandiri Kediri.",
};

export default function LoginPage() {
  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-[#F4FAFE] pt-28 pb-16">
        {/* Glow biru dekoratif */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-[#2279CF]/10 blur-3xl" />
          <div className="absolute -right-24 bottom-0 size-80 rounded-full bg-[#8ACFF8]/25 blur-3xl" />
        </div>

        <div className="relative">
          <LoginForm />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
