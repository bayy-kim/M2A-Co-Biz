"use server"

import { z } from "zod"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { put, del } from "@vercel/blob"
import { encrypt } from "@/lib/encryption"
import type { SellerType, DocumentType } from "@prisma/client"

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size === 0 || ACCEPTED_FILE_TYPES.includes(f.type), "Hanya file JPG, PNG, atau PDF yang diterima")
  .refine((f) => f.size <= MAX_FILE_SIZE, "Ukuran maksimal file 5MB")
  .optional()
  .nullable()

const buyerUpdateSchema = z.object({
  fullName: z.string().transform((v) => v?.trim() || "").refine((v) => v.length >= 1, "Nama wajib diisi"),
  phone: z.string().transform((v) => v?.trim() || "")
    .refine((v) => /^[0-9]+$/.test(v), "Nomor telepon harus berupa angka")
    .refine((v) => v.length >= 8, "Nomor telepon minimal 8 digit"),
  consent: z.string().refine((v) => v === "on", "Anda harus menyetujui ketentuan"),
})

const sellerUpdateSchema = z.object({
  fullName: z.string().transform((v) => v?.trim() || "").refine((v) => v.length >= 3, "Nama minimal 3 karakter"),
  phone: z.string().transform((v) => v?.trim() || "")
    .refine((v) => /^[0-9]+$/.test(v), "Nomor telepon harus berupa angka")
    .refine((v) => v.length >= 8, "Nomor telepon minimal 8 digit"),
  businessType: z.enum(["UMKM", "JASA"]),
  businessName: z.string().transform((v) => v?.trim() || "").refine((v) => v.length >= 3, "Nama usaha minimal 3 karakter"),
  ktp: fileSchema,
  kartuKeluarga: fileSchema,
  izinUsaha: fileSchema,
  consent: z.string().refine((v) => v === "on", "Anda harus menyetujui ketentuan"),
})

export type ProfileUpdateState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

async function uploadAndEncrypt(file: File, prefix: string): Promise<{ encryptedBlobUrl: string } | null> {
  if (!file || file.size === 0) return null

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString("base64")
  const encrypted = encrypt(base64)

  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.enc`
  const blob = await put(uniqueName, encrypted, {
    access: "public",
    contentType: "text/plain",
    addRandomSuffix: false,
  })

  return { encryptedBlobUrl: blob.url }
}

export async function completeBuyerProfile(prevState: ProfileUpdateState, formData: FormData): Promise<ProfileUpdateState> {
  const session = await auth()
  if (!session?.user) return { message: "Unauthorized" }

  // Prevent Privilege Downgrade Vulnerability
  if (session.user.role === "ADMIN" || session.user.role === "BENDAHARA" || session.user.role === "KETUA") {
    return { message: "Akun Anda tidak dapat diubah menjadi Pembeli." }
  }

  const raw = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    consent: formData.get("consent") as string,
  }

  const rl = await checkRateLimit(`update-profile:${session.user.id}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan." }

  const result = buyerUpdateSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Perbaiki isian di bawah." }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.fullName,
        phone: result.data.phone,
        role: "BUYER",
      },
    })
    return { success: true, message: "Profil berhasil diperbarui!" }
  } catch (e) {
    console.error("completeBuyerProfile Error:", e)
    return { message: "Gagal memperbarui profil" }
  }
}

export async function completeSellerProfile(prevState: ProfileUpdateState, formData: FormData): Promise<ProfileUpdateState> {
  const session = await auth()
  if (!session?.user) return { message: "Unauthorized" }

  // Prevent Privilege Downgrade Vulnerability
  if (session.user.role === "ADMIN" || session.user.role === "BENDAHARA" || session.user.role === "KETUA") {
    return { message: "Akun Anda tidak dapat diubah menjadi Penjual." }
  }

  const raw = {
    fullName: formData.get("fullName") as string,
    phone: formData.get("phone") as string,
    businessType: formData.get("businessType") as string,
    businessName: formData.get("businessName") as string,
    ktp: formData.get("ktp") as File | null,
    kartuKeluarga: formData.get("kartuKeluarga") as File | null,
    izinUsaha: formData.get("izinUsaha") as File | null,
    consent: formData.get("consent") as string,
  }

  const rl = await checkRateLimit(`update-profile:${session.user.id}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan." }

  const result = sellerUpdateSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Perbaiki isian dokumen atau data bisnis." }
  }

  // Prevent hard crash on duplicate SellerProfile creation (upsert instead of create)
  const existingProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id }
  })
  
  if (existingProfile) {
    return { message: "Anda sudah memiliki profil penjual yang sedang diproses atau aktif." }
  }

  const uploadedUrls: string[] = []

  try {
    const docEntries: { type: DocumentType; encryptedBlobUrl: string }[] = []

    // Parallel upload and encryption to prevent serial bottleneck and orphan files
    const fieldsToUpload = [
      { field: "ktp", docType: "KTP" },
      { field: "kartuKeluarga", docType: "KK" },
      { field: "izinUsaha", docType: "IZIN_USAHA" }
    ] as const

    const uploadPromises = fieldsToUpload.map(async ({ field, docType }) => {
      const file = formData.get(field) as File | null
      if (file && file.size > 0) {
        const doc = await uploadAndEncrypt(file, field)
        if (doc) {
          return { type: docType as DocumentType, encryptedBlobUrl: doc.encryptedBlobUrl }
        }
      }
      return null
    })

    const uploadResults = await Promise.all(uploadPromises)

    for (const res of uploadResults) {
      if (res) {
        docEntries.push(res)
        uploadedUrls.push(res.encryptedBlobUrl)
      }
    }

    if (!docEntries.find(d => d.type === "KTP") || !docEntries.find(d => d.type === "KK")) {
      throw new Error("Dokumen KTP dan Kartu Keluarga wajib diunggah")
    }

    await prisma.$transaction(async (tx) => {
      // Re-verify existing profile under transactional lock to avoid double submit crashes
      const txExisting = await tx.sellerProfile.findUnique({
        where: { userId: session.user.id }
      })
      if (txExisting) {
        throw new Error("Anda sudah terdaftar sebagai penjual.")
      }

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          role: "SELLER",
          name: result.data.fullName,
          phone: result.data.phone,
        },
      })
      await tx.sellerProfile.create({
        data: {
          userId: session.user.id!,
          businessName: result.data.businessName,
          type: result.data.businessType as SellerType,
          status: "PENDING",
          documents: {
            create: docEntries,
          },
        },
      })
    })

    return { success: true, message: "Pendaftaran penjual berhasil diajukan!" }
  } catch (e) {
    console.error("completeSellerProfile Error:", e)
    for (const url of uploadedUrls) {
      try { await del(url) } catch {}
    }
    return { message: e instanceof Error ? e.message : "Gagal mengunggah dokumen" }
  }
}