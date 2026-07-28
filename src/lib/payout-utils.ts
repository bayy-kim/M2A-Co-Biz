import { prisma } from "@/lib/db"

export async function processPayoutById(payoutId: string, actorId: string) {
  const sellerIdData = await prisma.payout.findUnique({
    where: { id: payoutId },
    select: { sellerId: true, amountRupiah: true, status: true },
  })

  if (!sellerIdData) {
    return { error: "Invalid payout" }
  }

  const seller = await prisma.sellerProfile.findUnique({
    where: { id: sellerIdData.sellerId },
  })
  if (!seller || !seller.bankName || !seller.bankAccountNo || !seller.bankAccountName) {
    return { error: "Seller bank info incomplete" }
  }

  try {
    // Atomic status check and update within transaction to prevent double payout processing
    await prisma.$transaction(async (tx) => {
      const targetPayout = await tx.payout.findUnique({
        where: { id: payoutId },
      })

      if (!targetPayout || targetPayout.status !== "PENDING") {
        throw new Error("Payout is not pending or does not exist")
      }

      await tx.payout.update({
        where: { id: payoutId },
        data: { status: "PAID" },
      })

      await tx.ledgerEntry.create({
        data: {
          type: "OUT",
          amountRupiah: targetPayout.amountRupiah,
          relatedPayoutId: payoutId,
        },
      })

      await tx.activityLog.create({
        data: {
          actorId,
          action: `Payout ${payoutId.slice(0, 8)} processed — Rp${targetPayout.amountRupiah.toLocaleString("id-ID")} to seller ${seller.businessName}`,
          targetType: "Payout",
          targetId: payoutId,
          metadata: { status: "PAID" },
        },
      })
    })

    return { success: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to process payout"

    // If the error was that it was already paid/processed, don't mark as FAILED
    if (msg.includes("Payout is not pending")) {
      return { error: msg }
    }

    try {
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
    } catch {}

    return { error: msg }
  }
}
