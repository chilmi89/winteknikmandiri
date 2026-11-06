import type { Metadata } from "next";
import JamOperasionalManager from "@/components/dashboard/jam-operasional/JamOperasionalManager";

export const metadata: Metadata = {
  title: "Jam Operasional Publik — Dashboard",
};

export default function JamOperasionalPage() {
  return <JamOperasionalManager />;
}
