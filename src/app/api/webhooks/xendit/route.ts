import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN
  if (!webhookToken) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const token = req.headers.get("x-callback-token")
  if (token !== webhookToken) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const body = await req.json()

  if (body.status === "PAID" && body.external_id) {
    const order = await prisma.order.findUnique({
      where: { id: body.external_id },
    })
    if (order && order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: { id: body.external_id },
        data: {
          paymentStatus: "PAID",
          xenditInvoiceId: body.id,
        },
      })

      await prisma.activityLog.create({
        data: {
          actorId: "system",
          action: "Payment received",
          targetType: "Order",
          targetId: body.external_id,
          metadata: { xenditInvoiceId: body.id, amount: body.amount },
        },
      })
    }
  }

  if (body.status === "EXPIRED" && body.external_id) {
    await prisma.order.update({
      where: { id: body.external_id },
      data: { paymentStatus: "EXPIRED" },
    })
  }

  return NextResponse.json({ received: true })
}
