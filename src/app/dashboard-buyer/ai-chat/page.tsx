import { Suspense } from "react"
import { ChatContainer } from "@/components/dynamic-chat-client"

export default function DashboardBuyerAIChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-clay-bg)" }}>
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    }>
      <ChatContainer />
    </Suspense>
  )
}
