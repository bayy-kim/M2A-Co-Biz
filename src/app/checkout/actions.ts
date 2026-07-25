"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { resolveCommission } from "@/lib/commission-engine"
import { checkRateLimit } from "@/lib/rate-limit"

const checkoutSchema = z.object({
  productId: z.string().min(1),
  buyerName: z.string().min(3, "Nama minimal 3 karakter"),
  buyerPhone: z.string().min(8, "Nomor telepon tidak valid"),
  qty: z.coerce.number().int().positive("Jumlah minimal 1"),
})

export async function createCheckout(formData: FormData) {
  const raw = {
    productId: formData.get("productId") as string,
    buyerName: formData.get("buyerName") as string,
    buyerPhone: formData.get("buyerPhone") as string,
    buyerId: (formData.get("buyerId") as string) || undefined,
    qty: formData.get("qty") as string,
  }

  const rl = await checkRateLimit(`checkout:${raw.buyerPhone || "anonymous"}`)
  if (!rl.allowed) return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }

  const result = checkoutSchema.safeParse(raw)
  if (!result.success) return { error: "Perbaiki isian form" }

  const { productId, buyerName, buyerPhone, buyerId, qty } = result.data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true, category: true },
  })
  if (!product || product.status !== "ACTIVE") return { error: "Produk tidak tersedia" }

  const totalRupiah = product.priceRupiah * qty

  const commission = await resolveCommission(
    product.sellerId,
    product.categoryId ?? null,
  )

  const commissionPerItem = Math.round(product.priceRupiah * (commission.percent / 100))
  const commissionRupiah = commissionPerItem * qty
  const sellerNetRupiah = totalRupiah - commissionRupiah

  const order = await prisma.order.create({
    data: {
      buyerName,
      buyerPhone,
      buyerId: buyerId || null,
      totalRupiah,
      items: {
        create: {
          productId: product.id,
          sellerId: product.sellerId,
          qty,
          priceRupiah: product.priceRupiah,
          commissionPercent: commission.percent,
          commissionRupiah,
          sellerNetRupiah,
        },
      },
    },
  })

  return {
    success: true,
    orderId: order.id,
  }
}
