"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const commissionSchema = z.object({
  scope: z.enum(["GLOBAL", "CATEGORY", "SELLER"]),
  refId: z.string().optional().nullable(),
  percent: z.coerce.number().min(0).max(100),
})

type CommissionState = { error?: string; success?: boolean } | null

export async function setCommissionRule(prevState: CommissionState, formData: FormData): Promise<CommissionState> {
  const session = await auth()
  if (!session?.user || (session.user.role !== "SEKRETARIS" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" }
  }

  const raw = {
    scope: formData.get("scope") as string,
    refId: formData.get("refId") as string || null,
    percent: formData.get("percent") as string,
  }

  const result = commissionSchema.safeParse(raw)
  if (!result.success) return { error: "Invalid values" }

  await prisma.commissionRule.create({
    data: {
      scope: result.data.scope as any,
      refId: result.data.refId || null,
      percent: result.data.percent,
      updatedBy: session.user.id,
    },
  })

  await prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: `Set ${result.data.scope} commission to ${result.data.percent}%`,
      targetType: "CommissionRule",
      targetId: result.data.scope,
      metadata: { refId: result.data.refId, percent: result.data.percent },
    },
  })

  revalidatePath("/sekretaris")
  return { success: true }
}

type PayoutState = { error?: string; success?: boolean } | null

export async function processPayout(payoutId: string, prevState: PayoutState, formData?: FormData): Promise<PayoutState> {
  const session = await auth()
  if (!session?.user || (session.user.role !== "SEKRETARIS" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" }
  }

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  })
  if (!payout || payout.status !== "PENDING") return { error: "Invalid payout" }

  await prisma.$transaction([
    prisma.payout.update({
      where: { id: payoutId },
      data: { status: "PROCESSING" },
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
        actorId: session.user.id,
        action: `Processed payout of ${payout.amountRupiah} to seller ${payout.sellerId.slice(0, 8)}`,
        targetType: "Payout",
        targetId: payoutId,
      },
    }),
  ])

  revalidatePath("/sekretaris")
  return { success: true }
}
