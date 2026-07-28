import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ChatContainer } from "./chat-container"

export default async function AIChatPage() {
  const session = await auth()
  
  // Enforce authentication to prevent API key usage abuse/brute force
  if (!session?.user) {
    redirect("/login?callbackUrl=/aichat")
  }

  return <ChatContainer />
}
