import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

type CommissionResult = {
  percent: number
  scope: "GLOBAL" | "CATEGORY" | "SELLER"
}

export async function resolveCommission(
  sellerId: string,
  categoryId: string | null
): Promise<CommissionResult> {
  const sellerRule = await prisma.commissionRule.findFirst({
    where: { scope: "SELLER", refId: sellerId },
    orderBy: { createdAt: "desc" },
  })
  if (sellerRule) {
    return { percent: Number(sellerRule.percent), scope: "SELLER" }
  }

  if (categoryId) {
    const categoryRule = await prisma.commissionRule.findFirst({
      where: { scope: "CATEGORY", refId: categoryId },
      orderBy: { createdAt: "desc" },
    })
    if (categoryRule) {
      return { percent: Number(categoryRule.percent), scope: "CATEGORY" }
    }
  }

  const globalRule = await prisma.commissionRule.findFirst({
    where: { scope: "GLOBAL" },
    orderBy: { createdAt: "desc" },
  })
  if (globalRule) {
    return { percent: Number(globalRule.percent), scope: "GLOBAL" }
  }

  return { percent: 0, scope: "GLOBAL" }
}

export function calculateCommission(
  priceRupiah: number,
  qty: number,
  percent: number
): { commissionRupiah: number; sellerNetRupiah: number } {
  const totalPrice = priceRupiah * qty
  const commissionRupiah = Math.round((totalPrice * percent) / 100)
  const sellerNetRupiah = totalPrice - commissionRupiah
  return { commissionRupiah, sellerNetRupiah }
}
