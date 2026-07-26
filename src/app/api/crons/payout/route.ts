import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { processPayoutById } from "@/lib/payout-utils"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expected = process.env.CRON_SECRET
  if (!expected) {
    console.error("[cron/payout] CRON_SECRET not set — payout cron disabled")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pendingPayouts = await prisma.payout.findMany({
    where: { status: "PENDING" },
  })

  const results: { payoutId: string; status: string }[] = []

  for (const payout of pendingPayouts) {
    const result = await processPayoutById(payout.id, "cron")
    results.push({
      payoutId: payout.id,
      status: result.success ? "PAID" : "FAILED",
    })
  }

  return NextResponse.json({
    processed: results.length,
    results,
  })
}
