"use client"

import { useActionState } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { updateCategoryStatus } from "./actions"

export function ApproveCategoryButton({ categoryId }: { categoryId: string }) {
  const approve = updateCategoryStatus.bind(null, categoryId, "APPROVED")
  const [state, action, pending] = useActionState(approve, undefined)

  return (
    <form action={action}>
      <button className="flex items-center gap-1 px-md py-1.5 bg-success/10 text-success rounded-lg text-label-sm hover:bg-success/20 transition-colors disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Approve
      </button>
    </form>
  )
}

export function RejectCategoryButton({ categoryId }: { categoryId: string }) {
  const reject = updateCategoryStatus.bind(null, categoryId, "REJECTED")
  const [state, action, pending] = useActionState(reject, undefined)

  return (
    <form action={action}>
      <button className="flex items-center gap-1 px-md py-1.5 bg-error/10 text-error rounded-lg text-label-sm hover:bg-error/20 transition-colors disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        Reject
      </button>
    </form>
  )
}
