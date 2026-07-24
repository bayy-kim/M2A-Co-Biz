"use client"

import { useActionState } from "react"
import { processPayout } from "./actions"
import { Loader2, ArrowRight } from "lucide-react"

export function PayoutAction({ payoutId }: { payoutId: string }) {
  const boundAction = processPayout.bind(null, payoutId)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <form action={action}>
      <button className="flex items-center gap-1 px-md py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm hover:bg-primary/20 transition-colors disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        {pending ? "Processing..." : "Process"}
      </button>
    </form>
  )
}
