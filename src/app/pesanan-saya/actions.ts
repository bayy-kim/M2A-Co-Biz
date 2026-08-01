"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { restoreVariantStock } from "@/lib/order-utils"
import { checkRateLimit } from "@/lib/rate-limit"
import filterXSS from "xss"

export type CancelOrderState = { error?: string; success?: boolean } | null

export async function cancelOrder(orderId: string): Promise<CancelOrderState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Silakan login terlebih dahulu." }

  const rl = await checkRateLimit(`cancel-order:${session.user.id}`)
  if (!rl.allowed) return { error: "Terlalu banyak permintaan. Coba lagi nanti." }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (!order || order.buyerId !== session.user.id) throw new Error("Anda tidak memiliki akses ke pesanan ini.")
      if (order.paymentStatus !== "PENDING") throw new Error("Pesanan sudah tidak bisa dibatalkan.")
      if (order.fulfillmentStatus === "CANCELLED" || order.fulfillmentStatus === "COMPLETED") throw new Error("Pesanan sudah final.")

      // Return stock to inventory on cancellation
      await restoreVariantStock(tx, order)

      await tx.order.update({
        where: { id: orderId },
        data: { fulfillmentStatus: "CANCELLED" },
      })

      await tx.activityLog.create({
        data: {
          actorId: session.user.id,
          action: `Buyer cancelled order #${orderId.slice(0, 8)}`,
          targetType: "Order",
          targetId: orderId,
        },
      })
    })

    revalidatePath("/pesanan-saya")
    revalidatePath("/dashboard-buyer")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal membatalkan pesanan." }
  }
}

export async function submitReview(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Silakan login terlebih dahulu." }

  const orderId = formData.get("orderId") as string
  const productId = formData.get("productId") as string
  const rating = Number(formData.get("rating"))
  const comment = formData.get("comment") as string || ""

  if (!orderId || !productId || !rating || rating < 1 || rating > 5) {
    return { error: "Semua isian ulasan wajib diisi dengan benar." }
  }

  try {
    // Double check that user actually completed this order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: session.user.id,
        paymentStatus: "PAID",
        fulfillmentStatus: "COMPLETED",
      },
    })

    if (!order) {
      return { error: "Anda hanya dapat mengulas pesanan yang telah lunas dan selesai dikerjakan." }
    }

    // Create review (upsert to handle double calls gracefully)
    await prisma.review.upsert({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
      update: {
        rating,
        comment: filterXSS(comment),
      },
      create: {
        orderId,
        productId,
        buyerId: session.user.id,
        rating,
        comment: filterXSS(comment),
      },
    })

    revalidatePath("/pesanan-saya")
    return { success: true }
  } catch (err) {
    console.error("Submit Review Error:", err)
    return { error: "Gagal mengirim ulasan." }
  }
}
