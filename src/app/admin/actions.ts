"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { Prisma, SellerStatus } from "@prisma/client"
import { z } from "zod"

export async function updateSellerStatus(sellerId: string, status: SellerStatus) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Sesi tidak memiliki akses admin" }

  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerId },
      include: { user: true },
    })
    if (!seller) return { error: "Seller tidak ditemukan" }

    await prisma.sellerProfile.update({ where: { id: sellerId }, data: { status } })

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: status === "APPROVED" ? "Approved seller" : status === "REJECTED" ? "Rejected seller" : "Suspended seller",
        targetType: "SellerProfile",
        targetId: sellerId,
        metadata: { businessName: seller.businessName, email: seller.user.email },
      },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengupdate status seller" }
  }
}

export async function updateCategoryStatus(categoryId: string, status: "APPROVED" | "REJECTED") {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Sesi tidak memiliki akses admin" }

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) return { error: "Kategori tidak ditemukan" }

    await prisma.category.update({ where: { id: categoryId }, data: { status } })

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: status === "APPROVED" ? `Approved category "${category.name}"` : `Rejected category "${category.name}"`,
        targetType: "Category",
        targetId: categoryId,
      },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengupdate kategori" }
  }
}

export async function toggleUserStatus(userId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Sesi tidak memiliki akses admin" }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { sellerProfile: true } })
    if (!user) return { error: "User tidak ditemukan" }
    if (user.role === "ADMIN" && user.id !== session.user.id) return { error: "Tidak dapat menonaktifkan admin lain" }

    const newStatus = !user.isActive

    await prisma.user.update({ where: { id: userId }, data: { isActive: newStatus } })

    if (user.sellerProfile) {
      await prisma.sellerProfile.update({
        where: { userId },
        data: { status: newStatus ? "APPROVED" : "SUSPENDED" },
      })
    }

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: newStatus ? `Reactivated user ${user.name}` : `Suspended user ${user.name}`,
        targetType: "User",
        targetId: userId,
      },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengubah status user" }
  }
}

const companySchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  mapEmbedUrl: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountName: z.string().optional().nullable(),
  bankAccountNo: z.string().optional().nullable(),
  qrisImageUrl: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
})

export async function updateCompanyProfile(prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Sesi tidak memiliki akses admin" }

  try {
    const raw = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      latitude: formData.get("latitude") as string || null,
      longitude: formData.get("longitude") as string || null,
      mapEmbedUrl: formData.get("mapEmbedUrl") as string || null,
      bankName: formData.get("bankName") as string || null,
      bankAccountName: formData.get("bankAccountName") as string || null,
      bankAccountNo: formData.get("bankAccountNo") as string || null,
      qrisImageUrl: formData.get("qrisImageUrl") as string || null,
      whatsappNumber: formData.get("whatsappNumber") as string || null,
    }

    const result = companySchema.safeParse(raw)
    if (!result.success) return { error: "Harap perbaiki kesalahan form" }

    const existing = await prisma.companyProfile.findFirst()
    const data = result.data as Prisma.CompanyProfileCreateInput
    if (existing) {
      await prisma.companyProfile.update({ where: { id: existing.id }, data })
    } else {
      await prisma.companyProfile.create({ data })
    }

    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        action: "Updated company profile",
        targetType: "CompanyProfile",
        targetId: existing?.id || "new",
      },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal mengupdate profil" }
  }
}
