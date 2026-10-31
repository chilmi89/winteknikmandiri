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

      <main className="min-h-screen bg-[#F4FAFE] pt-28 pb-16">
        <LoginForm />
      </main>

      <SiteFooter />
    </>
  );
}
