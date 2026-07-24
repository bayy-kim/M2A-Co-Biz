"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { ProductStatus } from "@prisma/client"
import { z } from "zod"

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceRupiah: z.coerce.number().int().positive("Price must be positive"),
  categoryId: z.string().optional().nullable(),
})

type ProductState = { error?: string | Record<string, string[]>; success?: boolean } | null

export async function createProduct(prevState: ProductState, formData: FormData): Promise<ProductState> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!seller || seller.status !== "APPROVED") return { error: "Seller not approved" }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    priceRupiah: formData.get("priceRupiah") as string,
    categoryId: formData.get("categoryId") as string || null,
  }

  const result = productSchema.safeParse(raw)
  if (!result.success) return { error: "Please fix the form errors" }

  await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: result.data.title,
      description: result.data.description,
      priceRupiah: result.data.priceRupiah,
      categoryId: result.data.categoryId || undefined,
      images: [],
    },
  })

  revalidatePath("/seller")
  return { success: true }
}

type PayoutRequestState = { error?: string; success?: boolean } | null

export async function requestPayout(prevState: PayoutRequestState, formData: FormData): Promise<PayoutRequestState> {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!seller || seller.status !== "APPROVED") return { error: "Seller not approved" }

  const amountRupiah = parseInt(formData.get("amountRupiah") as string)
  if (isNaN(amountRupiah) || amountRupiah <= 0) return { error: "Invalid amount" }

  const paidItems = await prisma.orderItem.findMany({
    where: { sellerId: seller.id, order: { paymentStatus: "PAID" } },
  })
  const totalEarnings = paidItems.reduce((sum, i) => sum + i.sellerNetRupiah, 0)

  const paidPayouts = await prisma.payout.findMany({
    where: { sellerId: seller.id, status: { in: ["PROCESSING", "PAID"] } },
  })
  const totalPaid = paidPayouts.reduce((sum, p) => sum + p.amountRupiah, 0)

  const availableBalance = totalEarnings - totalPaid
  if (amountRupiah > availableBalance) {
    return { error: `Insufficient balance. Available: Rp${availableBalance.toLocaleString("id-ID")}` }
  }

  const periodStart = seller.createdAt
  const periodEnd = new Date()

  await prisma.payout.create({
    data: {
      sellerId: seller.id,
      amountRupiah,
      periodStart,
      periodEnd,
      status: "PENDING",
    },
  })

  await prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: `Requested payout of Rp${amountRupiah.toLocaleString("id-ID")}`,
      targetType: "Payout",
      targetId: seller.id,
    },
  })

  revalidatePath("/seller")
  revalidatePath("/sekretaris")
  return { success: true }
}

export async function updateProductStatus(productId: string, status: ProductStatus) {
  const session = await auth()
  if (!session?.user) return { error: "Unauthorized" }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true },
  })
  if (!product || product.seller.userId !== session.user.id) return { error: "Not found" }

  await prisma.product.update({
    where: { id: productId },
    data: { status },
  })

  revalidatePath("/seller")
  return { success: true }
}
