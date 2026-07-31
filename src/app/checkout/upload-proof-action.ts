"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"
import { put } from "@vercel/blob"

const ACCEPTED_PROOF_TYPES = ["image/jpeg", "image/png"]
const MAX_PROOF_SIZE = 5 * 1024 * 1024

type ProofState = { error?: string; success?: boolean } | null

export async function uploadPaymentProof(orderId: string, _prevState: ProofState, formData: FormData): Promise<ProofState> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Silakan login terlebih dahulu." }

  const rl = await checkRateLimit(`proof-upload:${session.user.id}`)
  if (!rl.allowed) return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." }

  const file = formData.get("proof") as File | null
  if (!file || file.size === 0) return { error: "Pilih file bukti transfer terlebih dahulu." }
  if (!ACCEPTED_PROOF_TYPES.includes(file.type)) return { error: "Format tidak valid. Hanya JPG/PNG." }
  if (file.size > MAX_PROOF_SIZE) return { error: "Ukuran file maksimal 5MB." }

  try {
    // Verify order exists AND belongs to this user (or staff)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { buyerId: true, paymentStatus: true },
    })
    if (!order) return { error: "Pesanan tidak ditemukan." }
    if (order.paymentStatus !== "PENDING") return { error: "Pesanan ini sudah tidak menunggu pembayaran." }

    const isStaff = session.user.role === "ADMIN" || session.user.role === "BENDAHARA" || session.user.role === "KETUA"
    if (!isStaff && order.buyerId !== session.user.id) return { error: "Anda tidak memiliki akses ke pesanan ini." }

    const uniqueName = `proof-${orderId}-${Date.now()}`
    const blob = await put(uniqueName, file, { access: "public" })

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentProofUrl: blob.url },
    })

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: `Uploaded payment proof for order #${orderId.slice(0, 8)}`,
        targetType: "Order",
        targetId: orderId,
      },
    })

    revalidatePath("/checkout")
    revalidatePath("/pesanan-saya")
    return { success: true }
  } catch (e) {
    console.error("uploadPaymentProof Error:", e)
    return { error: "Gagal mengunggah bukti. Silakan coba lagi." }
  }
}
