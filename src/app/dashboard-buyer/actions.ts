"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { checkRateLimit } from "@/lib/rate-limit"
import { put, del } from "@vercel/blob"
import { encrypt } from "@/lib/encryption"
import { z } from "zod"
import type { DocumentType, SellerType } from "@prisma/client"

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size === 0 || ACCEPTED_FILE_TYPES.includes(f.type), "Hanya file JPG, PNG, atau PDF yang diterima")
  .refine((f) => f.size <= MAX_FILE_SIZE, "Ukuran maksimal file 5MB")
  .optional()
  .nullable()

const becomeSellerSchema = z.object({
  businessName: z.string().transform((v) => v?.trim() || "").refine((v) => v.length >= 3, "Nama usaha minimal 3 karakter."),
  businessType: z.enum(["UMKM", "JASA"], { required_error: "Pilih jenis usaha." }),
  consent: z.literal("on", { errorMap: () => ({ message: "Anda harus menyetujui ketentuan." }) }),
  ktp: z.instanceof(File).refine((f) => f.size > 0 && ACCEPTED_FILE_TYPES.includes(f.type), "KTP wajib diunggah (JPG/PNG/PDF)").refine((f) => f.size <= MAX_FILE_SIZE, "Ukuran KTP maksimal 5MB"),
  kartuKeluarga: z.instanceof(File).refine((f) => f.size > 0 && ACCEPTED_FILE_TYPES.includes(f.type), "Kartu Keluarga wajib diunggah (JPG/PNG/PDF)").refine((f) => f.size <= MAX_FILE_SIZE, "Ukuran KK maksimal 5MB"),
})

export type BecomeSellerState = {
  success?: boolean
  message?: string
  errors?: Record<string, string[]>
}

async function uploadAndEncrypt(file: File, prefix: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString("base64")
  const encrypted = encrypt(base64)

  const uniqueName = `docs-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.enc`
  const blob = await put(uniqueName, encrypted, {
    access: "private",
    contentType: "text/plain",
    addRandomSuffix: false,
  })
  return blob.url
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
    ktp: formData.get("ktp"),
    kartuKeluarga: formData.get("kartuKeluarga"),
  })
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Validasi gagal." }

  const { businessName, businessType, ktp, kartuKeluarga } = parsed.data

  const uploadedUrls: string[] = []

  try {
    const existingSeller = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (existingSeller) {
      return { message: "Anda sudah terdaftar sebagai penjual atau sedang dalam proses persetujuan." }
    }

    const docEntries: { type: DocumentType; encryptedBlobUrl: string }[] = []

    // Upload & encrypt identity documents (KTP, KK)
    for (const [file, field, docType] of [
      [ktp, "ktp", "KTP"],
      [kartuKeluarga, "kartuKeluarga", "KK"],
    ] as const) {
      if (file && file.size > 0) {
        const url = await uploadAndEncrypt(file, field)
        uploadedUrls.push(url)
        docEntries.push({ type: docType as DocumentType, encryptedBlobUrl: url })
      }
    }

    if (!docEntries.find((d) => d.type === "KTP") || !docEntries.find((d) => d.type === "KK")) {
      throw new Error("Dokumen KTP dan Kartu Keluarga wajib diunggah")
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
          type: businessType as SellerType,
          status: "PENDING",
          documents: { create: docEntries },
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
    // Cleanup uploaded blobs on failure to avoid orphaned storage
    for (const url of uploadedUrls) {
      try { await del(url) } catch {}
    }
    return { message: e instanceof Error ? e.message : "Gagal memproses permohonan. Coba lagi." }
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
