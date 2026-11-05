import type { Metadata } from "next";
import InquiriesManager from "@/components/dashboard/inquiries/InquiriesManager";

export const metadata: Metadata = {
  title: "Permohonan Masuk",
};

export default function InquiriesPage() {
  return <InquiriesManager />;
}
