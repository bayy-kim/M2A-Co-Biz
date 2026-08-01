import { LandingClient } from "@/components/dynamic-landing-client"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { faqCategories } from "@/data/faq"

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((cat) =>
    cat.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  ),
}

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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <LandingClient session={session} company={company} featuredProducts={featuredProducts} />
    </>
  )
}
