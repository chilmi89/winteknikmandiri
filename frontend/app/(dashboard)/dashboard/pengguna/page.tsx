import type { Metadata } from "next";
import UsersManager from "@/components/dashboard/users/UsersManager";

export const metadata: Metadata = {
  title: "Manajemen Pengguna",
};

export default function PenggunaPage() {
  return <UsersManager />;
}
