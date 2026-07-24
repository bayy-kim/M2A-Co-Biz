import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email || typeof email !== "string") {
    return NextResponse.json({ totp: false })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { twoFactorSecret: true },
  })

  return NextResponse.json({ totp: !!user?.twoFactorSecret })
}
