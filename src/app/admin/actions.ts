"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { SellerStatus } from "@prisma/client"

export async function updateSellerStatus(sellerId: string, status: SellerStatus) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerId },
    include: { user: true },
  })
  if (!seller) return { error: "Seller not found" }

  await prisma.sellerProfile.update({
    where: { id: sellerId },
    data: { status },
  })

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
}
