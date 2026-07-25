"use client"

import { useActionState } from "react"
import { Ban, CheckCircle2, Loader2 } from "lucide-react"
import { toggleUserStatus } from "./actions"

export function ToggleUserStatusButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  const toggle = toggleUserStatus.bind(null, userId)
  const [state, action, pending] = useActionState(toggle, undefined)

  return (
    <form action={action}>
      <button className={`flex items-center gap-1 px-md py-1.5 rounded-lg text-label-sm transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-error/10 text-error hover:bg-error/20"
          : "bg-success/10 text-success hover:bg-success/20"
      }`} disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        {isActive ? "Suspend" : "Reactivate"}
      </button>
    </form>
  )
}
