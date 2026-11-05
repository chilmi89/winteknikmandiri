import type { Metadata } from "next";
import HomeHeroManager from "@/components/dashboard/home-hero/HomeHeroManager";

export const metadata: Metadata = {
  title: "Hero Beranda — Dashboard WTM",
};

export default function HomeHeroPage() {
  return <HomeHeroManager />;
}
