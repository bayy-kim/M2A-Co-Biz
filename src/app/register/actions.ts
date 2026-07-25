"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { put } from "@vercel/blob"
import { encrypt } from "@/lib/encryption"
import type { SellerType, DocumentType } from "@prisma/client"

const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]
const MAX_FILE_SIZE = 5 * 1024 * 1024

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size === 0 || ACCEPTED_FILE_TYPES.includes(f.type), "Only JPG, PNG, or PDF files are accepted")
  .refine((f) => f.size <= MAX_FILE_SIZE, "Max file size is 5MB")
  .optional()
  .nullable()

const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Invalid phone number"),
  businessType: z.enum(["UMKM", "JASA"]),
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ktp: fileSchema,
  kartuKeluarga: fileSchema,
  izinUsaha: fileSchema,
  consent: z.string().refine((v) => v === "on", "You must agree to the terms"),
})

export type RegisterState = {
  errors?: Record<string, string[]>
  message?: string
}

async function uploadAndEncrypt(file: File, prefix: string): Promise<{ encryptedBlobUrl: string } | null> {
  if (!file || file.size === 0) return null

  const serverMime = file.type
  if (!ACCEPTED_FILE_TYPES.includes(serverMime)) {
    throw new Error(`Invalid file type: ${serverMime}`)
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${file.size} bytes`)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString("base64")
  const encrypted = encrypt(base64)

  const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.enc`
  const blob = await put(uniqueName, encrypted, {
    access: "private",
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

  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors, message: "Please fix the errors above." }
  }

  const data = result.data

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    return { errors: { email: ["Email is already registered"] }, message: "Email already in use." }
  }

  const hashed = await bcrypt.hash(data.password, 12)

  try {
    const docEntries: { type: DocumentType; encryptedBlobUrl: string }[] = []

    for (const [field, docType] of [["ktp", "KTP"], ["kartuKeluarga", "KK"], ["izinUsaha", "IZIN_USAHA"]] as const) {
      const file = formData.get(field) as File | null
      if (file && file.size > 0) {
        const doc = await uploadAndEncrypt(file, field)
        if (doc) {
          docEntries.push({ type: docType as DocumentType, encryptedBlobUrl: doc.encryptedBlobUrl })
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
    const message = e instanceof Error ? e.message : "Upload failed"
    return { message }
  }

  return { message: "Registration submitted successfully! Redirecting..." }
}
