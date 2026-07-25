import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { decrypt } from "@/lib/encryption"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { id } = await params

  const doc = await prisma.sellerDocument.findUnique({
    where: { id },
    include: { seller: { select: { businessName: true } } },
  })
  if (!doc) return new NextResponse("Not found", { status: 404 })

  await prisma.activityLog.create({
    data: {
      actorId: session.user.id,
      action: `Viewed document ${doc.type} for ${doc.seller?.businessName || "unknown"}`,
      targetType: "SellerDocument",
      targetId: doc.id,
    },
  })

  try {
    const resp = await fetch(doc.encryptedBlobUrl)
    if (!resp.ok) return new NextResponse("Failed to fetch document", { status: 500 })

    const encryptedText = await resp.text()
    const base64 = decrypt(encryptedText)
    const buffer = Buffer.from(base64, "base64")

    const ext = doc.type === "KTP" || doc.type === "KK" ? "image/jpeg" : "application/pdf"
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": ext,
        "Content-Disposition": `inline; filename="${doc.type}-${doc.id.slice(0, 8)}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return new NextResponse("Failed to decrypt document", { status: 500 })
  }
}
