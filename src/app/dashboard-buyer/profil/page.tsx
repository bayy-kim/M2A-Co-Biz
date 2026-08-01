import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProfileSettings } from "@/components/profile-settings"

export default async function DashboardBuyerProfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard-buyer/profil")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { sellerProfile: true },
  })
  if (!user) redirect("/login")

  const seller = user.sellerProfile
    ? {
        businessName: user.sellerProfile.businessName,
        type: user.sellerProfile.type,
        bankName: user.sellerProfile.bankName,
        bankAccountNo: user.sellerProfile.bankAccountNo,
        bankAccountName: user.sellerProfile.bankAccountName,
      }
    : null

  return (
    <ProfileSettings
      user={{ name: user.name, phone: user.phone }}
      seller={seller}
      backHref="/dashboard-buyer"
      backLabel="Kembali ke dashboard buyer"
    />
  )
}
