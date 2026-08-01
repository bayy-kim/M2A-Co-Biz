"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { processPayoutById } from "@/lib/payout-utils"
import { restoreVariantStock } from "@/lib/order-utils"
import { createNotification } from "@/lib/notify"
import type { CommissionScope } from "@prisma/client"
import { z } from "zod"

const commissionSchema = z.object({
  scope: z.enum(["GLOBAL", "CATEGORY", "SELLER"]),
  refId: z.string().optional().nullable(),
  percent: z.coerce.number().min(0).max(100),
})

type CommissionState = { error?: string; success?: boolean } | null

export async function setCommissionRule(prevState: CommissionState, formData: FormData): Promise<CommissionState> {
  const session = await auth()
  if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "ADMIN")) {
    return { error: "Sesi tidak memiliki akses bendahara" }
  }

  try {
    const raw = {
      scope: formData.get("scope") as string,
      refId: formData.get("refId") as string || null,
      percent: formData.get("percent") as string,
    }

    const result = commissionSchema.safeParse(raw)
    if (!result.success) return { error: "Nilai tidak valid" }

    if (result.data.scope === "SELLER" && !result.data.refId) {
      return { error: "ID penjual wajib diisi untuk komisi per seller" }
    }
    if (result.data.scope === "CATEGORY" && !result.data.refId) {
      return { error: "ID kategori wajib diisi untuk komisi per kategori" }
    }
    if (result.data.scope === "GLOBAL" && result.data.refId) {
      return { error: "Komisi global tidak boleh memiliki refId" }
    }

    await prisma.commissionRule.create({
      data: {
        scope: result.data.scope as CommissionScope,
        refId: result.data.refId || null,
        percent: result.data.percent,
        updatedBy: session.user.id,
      },
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: `Set ${result.data.scope} commission to ${result.data.percent}%`,
        targetType: "CommissionRule",
        targetId: result.data.scope,
        metadata: { refId: result.data.refId, percent: result.data.percent },
      },
    })

    revalidatePath("/bendahara")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menyimpan aturan komisi" }
  }
}

type PayoutState = { error?: string; success?: boolean } | null

type ConfirmState = { error?: string; success?: boolean } | null

export async function confirmPayment(orderId: string): Promise<ConfirmState> {
  const session = await auth()
  if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "ADMIN")) {
    return { error: "Sesi tidak memiliki akses bendahara" }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })
    if (!order || order.paymentStatus !== "PENDING") return { error: "Pesanan tidak valid" }

    // Check if payment proof exists for TRANSFER payments
    if (order.paymentMethod === "TRANSFER" && !order.paymentProofUrl) {
      return { error: "Pembeli belum mengunggah bukti transfer. Konfirmasi ditolak." }
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "PAID" },
      }),
      prisma.ledgerEntry.create({
        data: {
          type: "IN",
          amountRupiah: order.totalRupiah,
          relatedOrderId: orderId,
        },
      }),
      prisma.activityLog.create({
        data: {
          actorId: session.user.id,
          action: `Confirmed payment for order #${orderId.slice(0, 8)} — Rp${order.totalRupiah.toLocaleString("id-ID")}`,
          targetType: "Order",
          targetId: orderId,
        },
      }),
    ])

    revalidatePath("/bendahara")
    if (order.buyerId) {
      await createNotification({
        userId: order.buyerId,
        type: "PAYMENT",
        title: "Pembayaran Dikonfirmasi",
        message: `Pembayaran pesanan #${orderId.slice(0, 8)} telah dikonfirmasi Bendahara.`,
        link: "/dashboard-buyer/pesanan-saya",
      })
    }
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal konfirmasi pembayaran" }
  }
}

export async function rejectPayment(orderId: string): Promise<ConfirmState> {
  const session = await auth()
  if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "ADMIN")) {
    return { error: "Sesi tidak memiliki akses bendahara" }
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true },
    })

    await prisma.$transaction(async (tx) => {
      const txOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      })
      if (!txOrder || txOrder.paymentStatus !== "PENDING") throw new Error("Pesanan tidak valid")

      await restoreVariantStock(tx, txOrder)

      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: "FAILED" },
      })

      await tx.activityLog.create({
        data: {
          actorId: session.user.id,
          action: `Rejected payment for order #${orderId.slice(0, 8)}`,
          targetType: "Order",
          targetId: orderId,
        },
      })
    })

    revalidatePath("/bendahara")
    revalidatePath("/pesanan-saya")
    if (order?.buyerId) {
      await createNotification({
        userId: order.buyerId,
        type: "PAYMENT",
        title: "Pembayaran Ditolak",
        message: `Pembayaran pesanan #${orderId.slice(0, 8)} tidak dapat diverifikasi dan ditolak.`,
        link: "/dashboard-buyer/pesanan-saya",
      })
    }
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal menolak pembayaran" }
  }
}

export async function processPayout(payoutId: string, _prevState: PayoutState, _formData?: FormData): Promise<PayoutState> {  const session = await auth()
  if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "ADMIN")) {
    return { error: "Sesi tidak memiliki akses bendahara" }
  }

  try {
    const result = await processPayoutById(payoutId, session.user.id)

    revalidatePath("/bendahara")
    if (result.success) return { success: true }
    return { error: result.error }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal memproses payout" }
  }
}
