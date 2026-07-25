import { LandingClient } from "@/components/landing-client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function LandingPage() {
  const [session, company] = await Promise.all([
    auth(),
    prisma.companyProfile.findFirst({ select: { whatsappNumber: true } }),
  ])
  return <LandingClient session={session} whatsappNumber={company?.whatsappNumber} />
}
