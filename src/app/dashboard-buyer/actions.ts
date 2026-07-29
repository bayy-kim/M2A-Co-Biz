"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const becomeSellerSchema = z.object({
  businessName: z.string().min(3, "Nama usaha minimal 3 karakter."),
  businessType: z.enum(["UMKM", "JASA"], { required_error: "Pilih jenis usaha." }),
  consent: z.literal("on", { errorMap: () => ({ message: "Anda harus menyetujui ketentuan." }) }),
})

export type BecomeSellerState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

export async function requestBecomeSeller(prevState: BecomeSellerState, formData: FormData): Promise<BecomeSellerState> {
  const session = await auth()
  if (!session?.user?.id) return { message: "Sesi habis. Silakan login ulang." }

  const rl = await checkRateLimit(`become-seller:${session.user.id}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan. Coba lagi nanti." }

  const parsed = becomeSellerSchema.safeParse({
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    consent: formData.get("consent"),
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Validasi gagal." }

  const { businessName, businessType } = parsed.data

  try {
    const existingSeller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (existingSeller) {
      return { message: "Anda sudah terdaftar sebagai penjual atau sedang dalam proses persetujuan." }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "SELLER" },
      })
      await tx.sellerProfile.create({
        data: {
          userId: session.user.id,
          businessName,
          type: businessType as any,
          status: "PENDING",
        },
      })
      await tx.activityLog.create({
        data: {
          actorId: session.user.id,
          action: "SELLER_REGISTERED",
          targetType: "SellerProfile",
          targetId: session.user.id,
          metadata: { businessName, businessType },
        },
      })
    })

    return { success: true, message: "Permohonan berhasil dikirim! Menunggu persetujuan Admin/Ketua/Bendahara." }
  } catch (e) {
    console.error("requestBecomeSeller Error:", e)
    return { message: "Gagal memproses permohonan. Coba lagi." }
  }
}

export type CancelSellerState = { success?: boolean; message?: string }

export async function cancelSellerRequest(): Promise<CancelSellerState> {
  const session = await auth()
  if (!session?.user?.id) return { message: "Unauthorized" }

  try {
    await prisma.$transaction(async (tx) => {
      const profile = await tx.sellerProfile.findUnique({ where: { userId: session.user.id } })
      if (!profile || profile.status !== "PENDING") return

      await tx.sellerProfile.delete({ where: { userId: session.user.id } })
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: "BUYER" },
      })
    })
    return { success: true, message: "Permohonan dibatalkan." }
  } catch {
    return { message: "Gagal membatalkan." }
  }
}
