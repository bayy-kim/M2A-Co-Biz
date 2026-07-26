"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { put, del } from "@vercel/blob"
import { encrypt } from "@/lib/encryption"
import { checkRateLimit } from "@/lib/rate-limit"
import type { SellerType, DocumentType } from "@prisma/client"

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size === 0 || ACCEPTED_FILE_TYPES.includes(f.type), "Hanya file JPG, PNG, atau PDF yang diterima")
  .refine((f) => f.size <= MAX_FILE_SIZE, "Ukuran maksimal file 5MB")
  .optional()
  .nullable()

const registerSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor telepon tidak valid"),
  businessType: z.enum(["UMKM", "JASA"]),
  businessName: z.string().min(3, "Nama usaha minimal 3 karakter"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  ktp: fileSchema,
  kartuKeluarga: fileSchema,
  izinUsaha: fileSchema,
  consent: z.string().refine((v) => v === "on", "Anda harus menyetujui ketentuan"),
})

export type RegisterState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

async function uploadAndEncrypt(file: File, prefix: string): Promise<{ encryptedBlobUrl: string } | null> {
  if (!file || file.size === 0) return null

  const serverMime = file.type
  if (!ACCEPTED_FILE_TYPES.includes(serverMime)) {
    throw new Error(`Tipe file tidak valid: ${serverMime}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar: ${file.size} bytes`)
  }

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

export async function register(prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    businessType: formData.get("businessType") as string,
    businessName: formData.get("businessName") as string,
    password: formData.get("password") as string,
    ktp: formData.get("ktp") as File | null,
    kartuKeluarga: formData.get("kartuKeluarga") as File | null,
    izinUsaha: formData.get("izinUsaha") as File | null,
    consent: formData.get("consent") as string,
  }

  const rl = await checkRateLimit(`register:seller:${raw.email}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan. Silakan coba lagi nanti." }

  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Perbaiki isian di atas." }
  }

  const data = result.data

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return { errors: { email: ["Email sudah terdaftar"] }, message: "Email sudah digunakan." }
  }

  const hashed = await bcrypt.hash(data.password, 12)

  const uploadedUrls: string[] = []

  try {
    const docEntries: { type: DocumentType; encryptedBlobUrl: string }[] = []

    for (const [field, docType] of [["ktp", "KTP"], ["kartuKeluarga", "KK"], ["izinUsaha", "IZIN_USAHA"]] as const) {
      const file = formData.get(field) as File | null
      if (file && file.size > 0) {
        const doc = await uploadAndEncrypt(file, field)
        if (doc) {
          docEntries.push({ type: docType as DocumentType, encryptedBlobUrl: doc.encryptedBlobUrl })
          uploadedUrls.push(doc.encryptedBlobUrl)
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          role: "SELLER",
          email: data.email,
          passwordHash: hashed,
          name: data.fullName,
          phone: data.phone,
          sellerProfile: {
            create: {
              businessName: data.businessName,
              type: data.businessType as SellerType,
              documents: {
                create: docEntries,
              },
            },
          },
        },
      })
      return user
    })
  } catch (e) {
    for (const url of uploadedUrls) {
      try { await del(url) } catch { }
    }
    const message = e instanceof Error ? e.message : "Gagal mengunggah dokumen"
    return { message }
  }

  return { success: true, message: "Akun berhasil dibuat! Mengarahkan..." }
}

const buyerRegisterSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(8, "Nomor telepon tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  consent: z.string().refine((v) => v === "on", "Anda harus menyetujui ketentuan"),
})

export async function registerBuyer(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    password: formData.get("password") as string,
    consent: formData.get("consent") as string,
  }

  const rl = await checkRateLimit(`register:buyer:${raw.email}`)
  if (!rl.allowed) return { message: "Terlalu banyak permintaan. Silakan coba lagi nanti." }

  const result = buyerRegisterSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Perbaiki isian di atas." }
  }

  const data = result.data

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return { errors: { email: ["Email sudah terdaftar"] }, message: "Email sudah digunakan." }
  }

  const hashed = await bcrypt.hash(data.password, 12)

  try {
    await prisma.user.create({
      data: {
        role: "BUYER",
        email: data.email,
        passwordHash: hashed,
        name: data.fullName,
        phone: data.phone,
      },
    })
  } catch (e) {
    return { message: e instanceof Error ? e.message : "Gagal mendaftar" }
  }

  return { success: true, message: "Pendaftaran berhasil! Mengarahkan..." }
}
