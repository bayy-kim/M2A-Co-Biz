import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { restoreVariantStock } from "@/lib/order-utils"

export const maxDuration = 60

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expected = process.env.CRON_SECRET
  if (!expected) {
    console.error("[cron/expire-orders] CRON_SECRET not set — disabled")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const threshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days

  const staleOrders = await prisma.order.findMany({
    where: {
      paymentStatus: "PENDING",
      fulfillmentStatus: { notIn: ["CANCELLED", "COMPLETED"] },
      createdAt: { lt: threshold },
    },
    include: { items: true },
    take: 200,
  })

  let processed = 0
  for (const order of staleOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUnique({
          where: { id: order.id },
          include: { items: true },
        })
        if (!current || current.paymentStatus !== "PENDING") return
        if (current.fulfillmentStatus === "CANCELLED" || current.fulfillmentStatus === "COMPLETED") return

        await restoreVariantStock(tx, current)

        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "EXPIRED" },
        })

        await tx.activityLog.create({
          data: {
            actorId: "system",
            action: `Order #${order.id.slice(0, 8)} expired (no payment for 3 days)`,
            targetType: "Order",
            targetId: order.id,
          },
        })
      })
      processed++
    } catch (e) {
      console.error("[cron/expire-orders] failed for order", order.id, e)
    }
  }

  return NextResponse.json({ processed, total: staleOrders.length })
}
