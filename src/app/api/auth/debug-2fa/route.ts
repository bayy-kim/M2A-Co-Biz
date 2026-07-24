import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@m2acobiz.com" },
    select: { twoFactorSecret: true },
  })

  return NextResponse.json({
    secret: admin?.twoFactorSecret,
    isTargetSecret: admin?.twoFactorSecret === "HR5EOSAVEBWTYLJZ",
  })
}
