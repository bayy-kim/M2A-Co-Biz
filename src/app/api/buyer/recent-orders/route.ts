import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ orders: [] })

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: { items: true, reviews: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const productIds = orders.flatMap(o => o.items.map(i => i.productId))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true },
  })
  const productMap = new Map(products.map(p => [p.id, p.title]))

  const data = orders.map(o => ({
    id: o.id,
    totalRupiah: o.totalRupiah,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    fulfillmentStatus: o.fulfillmentStatus,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map(i => ({
      productId: i.productId,
      qty: i.qty,
      priceRupiah: i.priceRupiah,
      title: productMap.get(i.productId) || "Produk M2A",
    })),
  }))

  return NextResponse.json({ orders: data })
}
