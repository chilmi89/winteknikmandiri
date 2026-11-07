import type { Metadata } from "next";
import TeamManager from "@/components/dashboard/teams/TeamManager";

export const metadata: Metadata = {
  title: "Tim Teknisi Publik — Dashboard",
};

export default function TeamPage() {
  return <TeamManager />;
}
