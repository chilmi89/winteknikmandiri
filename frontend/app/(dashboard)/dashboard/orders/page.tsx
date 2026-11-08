import type { Metadata } from "next";
import OrderWorkspace from "@/components/dashboard/orders/OrderWorkspace";

export const metadata: Metadata = {
  title: "Pesanan — Dashboard",
};

export default function OrdersPage() {
  return <OrderWorkspace />;
}
