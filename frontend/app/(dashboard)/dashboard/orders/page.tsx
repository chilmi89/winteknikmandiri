import type { Metadata } from "next";
import OrderWorkspace from "@/components/dashboard/orders/OrderWorkspace";

export const metadata: Metadata = {
  title: "Pesanan & Invoice Nego — Dashboard",
};

export default function OrdersPage() {
  return <OrderWorkspace />;
}
