import type { Metadata } from "next";
import FaqManager from "@/components/dashboard/faqs/FaqManager";

export const metadata: Metadata = {
  title: "FAQ Publik",
};

export default function FaqPage() {
  return <FaqManager />;
}
