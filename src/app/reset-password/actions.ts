"use server"

import "server-only"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"
import { hashToken } from "@/lib/password-reset"

export type ResetState = { message?: string; success?: boolean }

export async function resetPassword(prevState: ResetState, formData: FormData): Promise<ResetState> {
  const token = (formData.get("token") as string) || ""
  const password = (formData.get("password") as string) || ""

  if (!token) return { message: "Tautan tidak valid." }
  if (!password || password.length < 8) return { message: "Kata sandi minimal 8 karakter." }

  const rl = await checkRateLimit(`reset-password:${hashToken(token)}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan. Coba lagi nanti." }

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { tokenHash: hashToken(token), usedAt: null },
  })

  if (!resetToken) return { message: "Tautan tidak valid atau sudah digunakan." }
  if (resetToken.expiresAt < new Date()) return { message: "Tautan sudah kedaluwarsa. Ajukan ulang." }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashed },
    })
    await tx.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    })
  })

  return { success: true, message: "Kata sandi berhasil diubah. Silakan masuk." }
}
