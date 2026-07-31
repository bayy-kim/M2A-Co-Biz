import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"
import { BuyerDashboardClient } from "./buyer-dashboard-client"

export default async function DashboardBuyerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard-buyer")

  const userId = session.user.id

  const [orders, reviews, sellerProfile, recommended] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.review.count({ where: { buyerId: userId } }),
    prisma.sellerProfile.findUnique({ where: { userId } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        seller: { select: { businessName: true, type: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])

  // Stats
  const paidOrders = orders.filter(o => o.paymentStatus === "PAID")
  const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalRupiah, 0)
  const activeOrders = orders.filter(
    o => o.paymentStatus === "PENDING" || (o.paymentStatus === "PAID" && o.fulfillmentStatus !== "COMPLETED"),
  )
  const pendingPayments = orders.filter(o => o.paymentStatus === "PENDING").length

  // Recent orders (4) with product titles
  const recent = orders.slice(0, 4)
  const productIds = recent.flatMap(o => o.items.map(i => i.productId))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true, images: true },
  })
  const productMap = new Map(products.map(p => [p.id, p]))

  const recentOrders = recent.map(o => ({
    id: o.id,
    totalRupiah: o.totalRupiah,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map(i => ({
      qty: i.qty,
      priceRupiah: i.priceRupiah,
      title: productMap.get(i.productId)?.title || "Produk M2A",
      image: productMap.get(i.productId)?.images?.[0] || null,
    })),
  }))

  const recommendedProducts = recommended.map(p => ({
    id: p.id,
    title: p.title,
    priceRupiah: p.priceRupiah,
    image: p.images?.[0] || null,
    businessName: p.seller?.businessName || "Mitra M2A",
    categoryName: p.category?.name || "Produk",
  }))

  const sellerStatus = sellerProfile?.status ?? null

  return (
    <SessionProvider session={session}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-clay-bg)" }}>
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      }>
        <BuyerDashboardClient
          user={session.user as any}
          stats={{ totalSpent, activeOrders: activeOrders.length, pendingPayments, totalReviews: reviews }}
          recentOrders={recentOrders}
          recommendedProducts={recommendedProducts}
          sellerStatus={sellerStatus}
        />
      </Suspense>
    </SessionProvider>
  )
}
