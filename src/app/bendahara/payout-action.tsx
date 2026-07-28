"use client"

import { useActionState } from "react"
import { processPayout } from "./actions"
import { Loader2, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

export function PayoutAction({ payoutId }: { payoutId: string }) {
  const boundAction = processPayout.bind(null, payoutId)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <form action={action} className="flex flex-col gap-1">
      <button className="flex items-center gap-1 px-md py-1.5 bg-primary/10 text-primary rounded-lg text-label-sm hover:bg-primary/20 transition-colors disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        {pending ? "Memproses..." : "Proses"}
      </button>
      {state && "success" in state && state.success && (
        <p className="text-label-sm text-success mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Berhasil
        </p>
      )}
      {state && "error" in state && typeof state.error === "string" && (
        <p className="text-label-sm text-error mt-1 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> {state.error}
        </p>
      )}
    </form>
  )
}
