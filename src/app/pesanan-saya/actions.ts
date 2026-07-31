"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import filterXSS from "xss"

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
