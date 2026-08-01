"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { ProductStatus, FulfillmentStatus } from "@prisma/client"
import { z } from "zod"
import { put, del } from "@vercel/blob"
import sharp from "sharp"
import filterXSS from "xss"
import { restoreVariantStock } from "@/lib/order-utils"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const productSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  priceRupiah: z.coerce.number().int().positive("Harga harus lebih dari 0"),
  categoryId: z.string().optional().nullable(),
  variants: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0).default(10),
})

type ProductState = { error?: string | Record<string, string[]>; success?: boolean } | null

async function uploadImage(file: File, sellerId: string): Promise<string> {
  const inputBuffer = Buffer.from(await file.arrayBuffer())
  
  // Compress and convert to WebP using sharp
  const compressedBuffer = await sharp(inputBuffer)
    .rotate() // Auto-rotate based on EXIF
    .resize(1080, null, { // Resize to max-width 1080px maintaining aspect ratio
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality: 80 }) // Convert to WebP format with 80% quality
    .toBuffer()

  const uniqueName = `product-${sellerId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const blob = await put(uniqueName, compressedBuffer, {
    access: "public",
    contentType: "image/webp",
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
      variants: formData.get("variants") as string || null,
      stock: formData.get("stock") as string || "10",
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

    // Process comma separated variants text into array
    const variantArray = result.data.variants
      ? result.data.variants.split(",").map((v) => v.trim()).filter(Boolean)
      : []

    const initialStock = result.data.stock

    try {
      await prisma.product.create({
        data: {
          sellerId: seller.id,
          title: filterXSS(result.data.title),
          description: filterXSS(result.data.description),
          priceRupiah: result.data.priceRupiah,
          categoryId: result.data.categoryId || undefined,
          images: imageUrls,
          variants: {
            create: variantArray.map((v) => ({
              name: filterXSS(v),
              stock: initialStock,
            })),
          },
        },
      })
    } catch (dbError) {
      // Cleanup uploaded images from Vercel Blob on DB failure to prevent orphaned storage waste
      for (const url of imageUrls) {
        try {
          await del(url)
        } catch (cleanupError) {
          console.error("Failed to cleanup orphaned blob:", url, cleanupError)
        }
      }
      throw dbError
    }

    revalidatePath("/seller")
    return { success: true }
  } catch (e) {
    console.error("createProduct Error:", e)
    return { error: "Gagal menyimpan produk. Silakan coba kembali." } // Safe error message hiding DB stack traces
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

    // Atomic balance check + payout creation (row lock prevents concurrent overshoot)
    await prisma.$transaction(async (tx) => {
      // Lock the seller row so concurrent payout requests serialize
      await tx.$queryRaw`SELECT id FROM "SellerProfile" WHERE id = ${seller.id} FOR UPDATE`

      const paidItems = await tx.orderItem.findMany({
        where: { sellerId: seller.id, order: { paymentStatus: "PAID" } },
      })
      const totalEarnings = paidItems.reduce((sum, i) => sum + i.sellerNetRupiah, 0)

      const paidPayouts = await tx.payout.findMany({
        where: { sellerId: seller.id, status: { in: ["PROCESSING", "PAID"] } },
      })
      const totalPaid = paidPayouts.reduce((sum, p) => sum + p.amountRupiah, 0)

      const availableBalance = totalEarnings - totalPaid
      if (amountRupiah > availableBalance) {
        throw new Error(`Saldo tidak cukup. Tersedia: Rp${availableBalance.toLocaleString("id-ID")}`)
      }

      const periodStart = seller.createdAt
      const periodEnd = new Date()

      await tx.payout.create({
        data: {
          sellerId: seller.id,
          amountRupiah,
          periodStart,
          periodEnd,
          status: "PENDING",
        },
      })

      await tx.activityLog.create({
        data: {
          actorId: session.user.id,
          action: `Requested payout of Rp${amountRupiah.toLocaleString("id-ID")}`,
          targetType: "Payout",
          targetId: seller.id,
        },
      })
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

    // Restore variant stock when an order is cancelled/failed so stock isn't lost permanently
    const isCancelOrFail = fulfillmentStatus === "CANCELLED"

    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (!current) throw new Error("Pesanan tidak ditemukan")
      if (current.fulfillmentStatus === "CANCELLED" || current.fulfillmentStatus === "COMPLETED") {
        // Already finalized — do not mutate again
        return
      }

      if (isCancelOrFail) {
        await restoreVariantStock(tx, current)
      }

      await tx.order.update({
        where: { id: orderId },
        data: { fulfillmentStatus },
      })
    })

    revalidatePath("/seller")
    revalidatePath("/pesanan-saya")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengupdate status pengerjaan" }
  }
}
