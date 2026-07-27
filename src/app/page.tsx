import { LandingClient } from "@/components/landing-client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export default async function LandingPage() {
  const [session, company, featuredProducts] = await Promise.all([
    auth(),
    prisma.companyProfile.findFirst({
      select: {
        whatsappNumber: true,
        bankAccountName: true,
        bankName: true,
      },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        seller: { select: { businessName: true, type: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ])
  return <LandingClient session={session} company={company} featuredProducts={featuredProducts} />
}
