"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { ProductStatus, FulfillmentStatus } from "@prisma/client"
import { z } from "zod"
import { put } from "@vercel/blob"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const productSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  priceRupiah: z.coerce.number().int().positive("Harga harus lebih dari 0"),
  categoryId: z.string().optional().nullable(),
})

type ProductState = { error?: string | Record<string, string[]>; success?: boolean } | null

async function uploadImage(file: File, sellerId: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const uniqueName = `product-${sellerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const blob = await put(uniqueName, buffer, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  })
  return blob.url
}

export async function createProduct(prevState: ProductState, formData: FormData): Promise<ProductState> {
  const session = await auth()
  if (!session?.user) return { error: "Sesi tidak valid" }

  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!seller || seller.status !== "APPROVED") return { error: "Akun penjual belum disetujui" }

    const raw = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priceRupiah: formData.get("priceRupiah") as string,
      categoryId: formData.get("categoryId") as string || null,
    }

    const result = productSchema.safeParse(raw)
    if (!result.success) return { error: "Harap perbaiki kesalahan form" }

    const imageFiles = formData.getAll("images") as File[]
    const imageUrls: string[] = []
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) continue
        if (file.size > MAX_FILE_SIZE) continue
        const url = await uploadImage(file, seller.id)
        imageUrls.push(url)
      }
    }

    await prisma.product.create({
      data: {
        sellerId: seller.id,
        title: result.data.title,
        description: result.data.description,
        priceRupiah: result.data.priceRupiah,
        categoryId: result.data.categoryId || undefined,
        images: imageUrls,
      },
    })

    revalidatePath("/seller")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal membuat produk" }
  }
}

const categoryProposalSchema = z.object({
  categoryName: z.string().min(2, "Nama kategori minimal 2 karakter"),
})

export async function proposeCategory(prevState: { error?: string; success?: boolean } | null, formData: FormData): Promise<{ error?: string; success?: boolean } | null> {
  const session = await auth()
  if (!session?.user) return { error: "Sesi tidak valid" }

  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!seller || seller.status !== "APPROVED") return { error: "Akun penjual belum disetujui" }

    const raw = { categoryName: formData.get("categoryName") as string }
    const result = categoryProposalSchema.safeParse(raw)
    if (!result.success) return { error: "Nama terlalu pendek" }

    const existing = await prisma.category.findFirst({
      where: { name: { equals: result.data.categoryName, mode: "insensitive" } },
    })
    if (existing) return { error: "Kategori sudah ada" }

    await prisma.category.create({
      data: {
        name: result.data.categoryName,
        status: "PENDING",
        requestedBySellerId: seller.id,
      },
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: `Proposed new category "${result.data.categoryName}"`,
        targetType: "Category",
        targetId: seller.id,
      },
    })

    revalidatePath("/seller")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengusulkan kategori" }
  }
}

type PayoutRequestState = { error?: string; success?: boolean } | null

export async function requestPayout(prevState: PayoutRequestState, formData: FormData): Promise<PayoutRequestState> {
  const session = await auth()
  if (!session?.user) return { error: "Sesi tidak valid" }

  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!seller || seller.status !== "APPROVED") return { error: "Akun penjual belum disetujui" }

    const amountRupiah = parseInt(formData.get("amountRupiah") as string)
    if (isNaN(amountRupiah) || amountRupiah <= 0) return { error: "Jumlah tidak valid" }

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
      return { error: `Saldo tidak cukup. Tersedia: Rp${availableBalance.toLocaleString("id-ID")}` }
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
    revalidatePath("/bendahara")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengajukan payout" }
  }
}

export async function updateProductStatus(productId: string, status: ProductStatus) {
  const session = await auth()
  if (!session?.user) return { error: "Sesi tidak valid" }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    })
    if (!product || product.seller.userId !== session.user.id) return { error: "Tidak ditemukan" }

    await prisma.product.update({
      where: { id: productId },
      data: { status },
    })

    revalidatePath("/seller")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengupdate produk" }
  }
}

export async function updateFulfillmentStatus(orderId: string, fulfillmentStatus: FulfillmentStatus) {
  const session = await auth()
  if (!session?.user) return { error: "Sesi tidak valid" }

  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!seller) return { error: "Seller tidak ditemukan" }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order) return { error: "Pesanan tidak ditemukan" }

    const hasSellerItem = order.items.some((item) => item.sellerId === seller.id)
    if (!hasSellerItem) return { error: "Akses ditolak" }

    await prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus },
    })

    revalidatePath("/seller")
    revalidatePath("/pesanan-saya")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengupdate status pengerjaan" }
  }
}
