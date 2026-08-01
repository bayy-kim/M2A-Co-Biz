"use server"

import "server-only"
import { randomBytes } from "crypto"
import { prisma } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendPasswordReset } from "@/lib/email"
import { hashToken } from "@/lib/password-reset"

export type ForgotState = { message?: string; success?: boolean }

export async function requestPasswordReset(prevState: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = ((formData.get("email") as string) || "").trim().toLowerCase()

  if (!email || !email.includes("@")) return { message: "Masukkan email yang valid." }

  const rl = await checkRateLimit(`forgot-password:${email}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan. Coba lagi nanti." }

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return the same message to avoid user enumeration
  if (user) {
    const token = randomBytes(32).toString("hex")

    // Invalidate any previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      },
    })

    const origin = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000"
    const resetUrl = `${origin}/reset-password?token=${token}`
    await sendPasswordReset(user.email, user.name, resetUrl)
  }

  return { success: true, message: "Jika email terdaftar, tautan reset telah dikirim. Periksa inbox Anda." }
}
