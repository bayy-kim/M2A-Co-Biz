import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ProfileForm } from "./profile-form"
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"

export default async function LengkapiProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>
}) {
  const session = await auth()
  
  // If not logged in at all, redirect to login
  if (!session?.user) redirect("/login")
  
  // If user profile is already complete, redirect away
  // @ts-expect-error custom session prop
  if (session.user.isProfileComplete) {
    if (session.user.role === "SELLER") redirect("/seller")
    if (session.user.role === "ADMIN") redirect("/admin")
    redirect("/catalog")
  }

  const params = await searchParams
  const defaultRole = params.role === "seller" ? "seller" : "buyer"

  return (
    <SessionProvider session={session}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <ProfileForm user={session.user} defaultRole={defaultRole} />
      </Suspense>
    </SessionProvider>
  )
}