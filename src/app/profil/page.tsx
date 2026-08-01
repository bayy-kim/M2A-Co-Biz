import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ProfileSettings } from "@/components/profile-settings"

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/profil")

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

  const backHref =
    user.role === "SELLER" ? "/seller" :
    user.role === "ADMIN" ? "/admin" :
    user.role === "BENDAHARA" ? "/bendahara" :
    user.role === "KETUA" ? "/ketua" : "/dashboard-buyer"

  const requires2fa = (user.role === "ADMIN" || user.role === "BENDAHARA") && !user.twoFactorSecret

  return (
    <ProfileSettings
      user={{ name: user.name, phone: user.phone, email: user.email }}
      seller={seller}
      backHref={backHref}
      backLabel="Kembali ke dashboard"
      requires2fa={requires2fa}
    />
  )
}
