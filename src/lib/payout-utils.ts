import { prisma } from "@/lib/db"

export async function processPayoutById(payoutId: string, actorId: string) {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  })
  if (!payout || payout.status !== "PENDING") {
    return { error: "Invalid payout" }
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: payout.sellerId },
  })
  if (!seller || !seller.bankName || !seller.bankAccountNo || !seller.bankAccountName) {
    return { error: "Seller bank info incomplete" }
  }

  try {
    await prisma.$transaction([
      prisma.payout.update({
        where: { id: payoutId },
        data: { status: "PAID" },
      }),
      prisma.ledgerEntry.create({
        data: {
          type: "OUT",
          amountRupiah: payout.amountRupiah,
          relatedPayoutId: payoutId,
        },
      }),
      prisma.activityLog.create({
        data: {
          actorId,
          action: `Payout ${payoutId.slice(0, 8)} processed — Rp${payout.amountRupiah.toLocaleString("id-ID")} to seller ${seller.businessName}`,
          targetType: "Payout",
          targetId: payoutId,
          metadata: { status: "PAID" },
        },
      }),
    ])

    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to process payout"

    await prisma.$transaction([
      prisma.payout.update({
        where: { id: payoutId },
        data: { status: "FAILED" },
      }),
      prisma.activityLog.create({
        data: {
          actorId,
          action: `Payout ${payoutId.slice(0, 8)} failed — ${msg}`,
          targetType: "Payout",
          targetId: payoutId,
          metadata: { error: msg },
        },
      }),
    ])

    return { error: msg }
  }
}
