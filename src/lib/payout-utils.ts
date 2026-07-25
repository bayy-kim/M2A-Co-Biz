import { prisma } from "@/lib/db"
import { createDisbursement } from "@/lib/xendit"

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

  const channelCode = seller.bankName === "BCA" ? "BCA" : seller.bankName === "BNI" ? "BNI" : seller.bankName === "MANDIRI" ? "MANDIRI" : seller.bankName === "BRI" ? "BRI" : seller.bankName?.toUpperCase().replace(/\s+/g, "_") || "BCA"

  try {
    const disbursement = await createDisbursement({
      idempotencyKey: payout.id,
      referenceId: payout.id,
      amount: payout.amountRupiah,
      channelCode,
      accountNumber: seller.bankAccountNo,
      accountHolderName: seller.bankAccountName,
      description: `Payout ${payout.id.slice(0, 8)}`,
    })

    await prisma.$transaction([
      prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: "PAID",
          xenditDisbursementId: disbursement.id,
        },
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
          metadata: { xenditDisbursementId: disbursement.id, status: "PAID" },
        },
      }),
    ])

    return { success: true, xenditId: disbursement.id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Disbursement failed"

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
