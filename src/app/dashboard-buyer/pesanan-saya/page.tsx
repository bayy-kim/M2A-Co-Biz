import { BuyerOrders } from "@/components/buyer-orders"

export default async function DashboardBuyerPesananPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  return <BuyerOrders tab={params.tab || "active"} baseHref="/dashboard-buyer/pesanan-saya" />
}
