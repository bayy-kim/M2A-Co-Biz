import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ChatContainerBendahara } from "./chat-container"

export default async function AIChatBendaharaPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/aichat-bendahara")
  }

  if (session.user.role !== "BENDAHARA" && session.user.role !== "ADMIN") {
    redirect("/")
  }

  return <ChatContainerBendahara />
}
