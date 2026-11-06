import type { Metadata } from "next";
import SosialMediaManager from "@/components/dashboard/sosial-media/SosialMediaManager";

export const metadata: Metadata = {
  title: "Sosial Media Publik — Dashboard",
};

export default function SocialMediaPage() {
  return <SosialMediaManager />;
}
