import { LandingClient } from "@/components/landing-client"
import { auth } from "@/lib/auth"

export default async function LandingPage() {
  const session = await auth()
  return <LandingClient session={session} />
}
