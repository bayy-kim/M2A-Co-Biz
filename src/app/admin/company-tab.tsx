import { prisma } from "@/lib/db"
import { CompanyProfileForm } from "./company-form"

export async function AdminCompanyTab() {
  const profile = await prisma.companyProfile.findFirst()

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
      <h3 className="text-headline-md text-on-surface font-bold mb-lg">Company Profile</h3>
      <CompanyProfileForm profile={profile} />
    </div>
  )
}
