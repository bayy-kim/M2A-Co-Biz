"use client"

import { useActionState } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { updateSellerStatus } from "./actions"

export function ApproveButton({ sellerId }: { sellerId: string }) {
  const approve = updateSellerStatus.bind(null, sellerId, "APPROVED")
  const [state, action, pending] = useActionState(approve, undefined)

  return (
    <form action={action}>
      <button className="flex items-center gap-1 px-md py-1.5 bg-success/10 text-success rounded-lg text-label-sm hover:bg-success/20 transition-colors disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Setujui
      </button>
    </form>
  )
}

export function RejectButton({ sellerId }: { sellerId: string }) {
  const reject = updateSellerStatus.bind(null, sellerId, "REJECTED")
  const [state, action, pending] = useActionState(reject, undefined)

  return (
    <form action={action}>
      <button className="flex items-center gap-1 px-md py-1.5 bg-error/10 text-error rounded-lg text-label-sm hover:bg-error/20 transition-colors disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        Tolak
      </button>
    </form>
  )
}
