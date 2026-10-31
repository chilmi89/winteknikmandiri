import type { Metadata } from "next";
import InquiriesTable from "@/components/dashboard/InquiriesTable";

export const metadata: Metadata = {
  title: "Permohonan",
};

export default function InquiriesPage() {
  return <InquiriesTable />;
}
