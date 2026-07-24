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
