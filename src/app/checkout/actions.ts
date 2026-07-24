"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"
import { resolveCommission } from "@/lib/commission-engine"

const checkoutSchema = z.object({
  productId: z.string().min(1),
  buyerName: z.string().min(3, "Name must be at least 3 characters"),
  buyerPhone: z.string().min(8, "Invalid phone number"),
  qty: z.coerce.number().int().positive("Quantity must be at least 1"),
})

export async function createCheckout(formData: FormData) {
  const raw = {
    productId: formData.get("productId") as string,
    buyerName: formData.get("buyerName") as string,
    buyerPhone: formData.get("buyerPhone") as string,
    qty: formData.get("qty") as string,
  }

  const result = checkoutSchema.safeParse(raw)
  if (!result.success) return { error: "Please fix the form errors" }

  const { productId, buyerName, buyerPhone, qty } = result.data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true, category: true },
  })
  if (!product || product.status !== "ACTIVE") return { error: "Product not available" }

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

  await prisma.ledgerEntry.create({
    data: {
      type: "IN",
      amountRupiah: totalRupiah,
      relatedOrderId: order.id,
    },
  })

  if (commissionRupiah > 0) {
    await prisma.ledgerEntry.create({
      data: {
        type: "IN",
        amountRupiah: commissionRupiah,
        relatedOrderId: order.id,
      },
    })
  }

  return {
    success: true,
    orderId: order.id,
  }
}
