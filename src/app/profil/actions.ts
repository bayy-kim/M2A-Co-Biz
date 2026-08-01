"use server"

import "server-only"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { authenticator } from "otplib"
import type { SellerType } from "@prisma/client"
import filterXSS from "xss"

const profileSchema = z.object({
  fullName: z.string().transform((v) => v?.trim() || "").refine((v) => v.length >= 1, "Nama wajib diisi"),
  phone: z.string().transform((v) => v?.trim() || "")
    .refine((v) => /^[0-9]+$/.test(v), "Nomor telepon harus berupa angka")
    .refine((v) => v.length >= 8, "Nomor telepon minimal 8 digit"),
  businessName: z.string().transform((v) => v?.trim() || "").optional().nullable(),
  businessType: z.enum(["UMKM", "JASA"]).optional().nullable(),
  bankName: z.string().transform((v) => v?.trim() || "").optional().nullable(),
  bankAccountNo: z.string().transform((v) => v?.trim() || "").optional().nullable(),
  bankAccountName: z.string().transform((v) => v?.trim() || "").optional().nullable(),
})

export type ProfileSettingsState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export type TwoFactorState = { message?: string; success?: boolean }

export async function generate2faSecret(): Promise<{ secret: string; otpauthUrl: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "Silakan login terlebih dahulu." }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, twoFactorSecret: true },
  })
  if (!user) return { error: "User tidak ditemukan." }
  if (user.twoFactorSecret) return { error: "2FA sudah aktif." }

  const secret = authenticator.generateSecret()
  const otpauthUrl = authenticator.keyuri(user.email, "M2A Co-Biz", secret)
  return { secret, otpauthUrl }
}

export async function verifyAndEnable2fa(_prevState: TwoFactorState, formData: FormData): Promise<TwoFactorState> {
  const session = await auth()
  if (!session?.user?.id) return { message: "Silakan login terlebih dahulu." }

  const secret = (formData.get("secret") as string) || ""
  const code = (formData.get("code") as string) || ""

  const rl = await checkRateLimit(`enable-2fa:${session.user.id}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan." }

  if (!secret || !code || code.length !== 6) return { message: "Masukkan kode 6 digit dari aplikasi Authenticator." }

  try {
    const valid = authenticator.verify({ token: code, secret })
    if (!valid) return { message: "Kode tidak valid. Periksa kembali waktu perangkat Anda." }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    })
    revalidatePath("/profil")
    return { success: true, message: "2FA berhasil diaktifkan!" }
  } catch {
    return { message: "Gagal mengaktifkan 2FA." }
  }
}

export async function updateProfile(prevState: ProfileSettingsState, formData: FormData): Promise<ProfileSettingsState> {
  const session = await auth()
  if (!session?.user?.id) return { message: "Silakan login terlebih dahulu." }

  const rl = await checkRateLimit(`update-profile:${session.user.id}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan." }

  const raw = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    businessName: (formData.get("businessName") as string) || null,
    businessType: (formData.get("businessType") as string) || null,
    bankName: (formData.get("bankName") as string) || null,
    bankAccountNo: (formData.get("bankAccountNo") as string) || null,
    bankAccountName: (formData.get("bankAccountName") as string) || null,
  }

  const result = profileSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Perbaiki isian di bawah." }
  }

  const { fullName, phone, businessName, businessType, bankName, bankAccountNo, bankAccountName } = result.data

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: filterXSS(fullName),
          phone,
        },
      })

      // Update seller data only if a seller profile exists (sellers + pending sellers)
      const sellerProfile = await tx.sellerProfile.findUnique({ where: { userId: session.user.id } })
      if (sellerProfile) {
        await tx.sellerProfile.update({
          where: { userId: session.user.id },
          data: {
            businessName: filterXSS(businessName || sellerProfile.businessName),
            type: (businessType as SellerType | null) || sellerProfile.type,
            bankName: bankName || null,
            bankAccountNo: bankAccountNo || null,
            bankAccountName: bankAccountName || null,
          },
        })
      }
    })

    revalidatePath("/profil")
    revalidatePath("/dashboard-buyer")
    revalidatePath("/seller")
    return { success: true, message: "Profil berhasil diperbarui!" }
  } catch (e) {
    console.error("updateProfile Error:", e)
    return { message: "Gagal memperbarui profil. Silakan coba lagi." }
  }
}
