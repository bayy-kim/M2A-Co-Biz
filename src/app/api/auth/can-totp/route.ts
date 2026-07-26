import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { checkRateLimit, checkIpRateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!checkIpRateLimit(ip)) {
    return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 })
  }

  try {
    const { email } = await req.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ totp: false })
    }

    const rl = await checkRateLimit(`can-totp:${email}`, true)
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { twoFactorSecret: true },
    })

    return NextResponse.json({ totp: !!user?.twoFactorSecret })
  } catch {
    return NextResponse.json({ totp: false })
  }
}
