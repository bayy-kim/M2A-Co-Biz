"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { resolveCommission } from "@/lib/commission-engine"
import { checkRateLimit } from "@/lib/rate-limit"
import { createNotification } from "@/lib/notify"
import { formatRupiah } from "@/lib/utils"

const checkoutSchema = z.object({
  productId: z.string().min(1),
  buyerName: z.string().min(3, "Nama minimal 3 karakter"),
  buyerPhone: z.string().min(8, "Nomor telepon tidak valid"),
  qty: z.coerce.number().int().positive("Jumlah minimal 1"),
  buyerId: z.string().optional(),
  serviceNotes: z.string().optional().nullable(),
  paymentMethod: z.enum(["TRANSFER", "COD"]).default("TRANSFER"),
})

export async function createCheckout(formData: FormData) {
  const session = await auth()

  const raw = {
    productId: formData.get("productId") as string,
    buyerName: formData.get("buyerName") as string,
    buyerPhone: formData.get("buyerPhone") as string,
    buyerId: (formData.get("buyerId") as string) || undefined,
    qty: formData.get("qty") as string,
    serviceNotes: (formData.get("serviceNotes") as string) || undefined,
    paymentMethod: (formData.get("paymentMethod") as string) || "TRANSFER",
  }

  if (!session?.user) {
    return { error: "Harus login untuk checkout" }
  }
  if (raw.buyerId && session.user.id !== raw.buyerId) {
    return { error: "Sesi tidak valid" }
  }

  // Use session user id for rate limit tracking to avoid bypass by modifying buyerPhone
  const rl = await checkRateLimit(`checkout:${session.user.id}`)
  if (!rl.allowed) return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }

  const result = checkoutSchema.safeParse(raw)
  if (!result.success) return { error: "Perbaiki isian form" }

  const { productId, buyerName, buyerPhone, buyerId, qty, serviceNotes, paymentMethod } = result.data

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true, category: true, variants: true },
  })
  if (!product || product.status !== "ACTIVE") return { error: "Produk tidak tersedia" }

  // Check and deduct variant stock inside transaction scope to prevent race conditions
  let selectedVariantName = ""
  if (serviceNotes && serviceNotes.includes("[Varian:")) {
    const match = serviceNotes.match(/\[Varian:\s*(.*?)\]/)
    if (match && match[1]) {
      selectedVariantName = match[1].trim()
    }
  }

  if (product.variants.length > 0 && selectedVariantName) {
    const targetVariant = product.variants.find((v) => v.name === selectedVariantName)
    if (!targetVariant) {
      return { error: "Varian produk yang dipilih tidak valid" }
    }
    if (targetVariant.stock < qty) {
      return { error: `Stok untuk varian "${selectedVariantName}" tidak mencukupi (Tersisa: ${targetVariant.stock})` }
    }
  }

  const totalRupiah = product.priceRupiah * qty

  const commission = await resolveCommission(
    product.sellerId,
    product.categoryId ?? null,
  )

  const commissionPerItem = Math.round(product.priceRupiah * (commission.percent / 100))
  const commissionRupiah = commissionPerItem * qty
  const sellerNetRupiah = totalRupiah - commissionRupiah

  try {
    const order = await prisma.$transaction(async (tx) => {
      // If product has variants, perform atomic stock deduction
      if (product.variants.length > 0 && selectedVariantName) {
        const variant = await tx.productVariant.findFirst({
          where: { productId: product.id, name: selectedVariantName },
        })
        if (!variant || variant.stock < qty) {
          throw new Error(`Stok varian "${selectedVariantName}" habis atau tidak mencukupi`)
        }
        
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: qty } },
        })
      }

      return tx.order.create({
        data: {
          buyerName,
          buyerPhone,
          buyerId: buyerId || null,
          serviceNotes: serviceNotes || null,
          paymentMethod,
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
    })

    // Fire notifications (best-effort, non-blocking)
    const total = formatRupiah(order.totalRupiah)
    if (buyerId) {
      await createNotification({
        userId: buyerId,
        type: "ORDER",
        title: "Pesanan Dibuat",
        message: `Pesanan #${order.id.slice(0, 8)} senilai ${total} berhasil dibuat.`,
        link: "/dashboard-buyer/pesanan-saya",
      })
    }
    await createNotification({
      userId: product.seller.userId,
      type: "ORDER",
      title: "Pesanan Baru Masuk",
      message: `Ada pesanan baru #${order.id.slice(0, 8)} senilai ${total}.`,
      link: "/seller?tab=sales",
    })

    return {
      success: true,
      orderId: order.id,
    }
  } catch (e) {
    console.error("Checkout Database Error:", e)
    return { error: e instanceof Error ? e.message : "Gagal memproses pesanan. Silakan coba kembali." }
  }
}
