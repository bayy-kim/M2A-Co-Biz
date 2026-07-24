"use client"

import { useActionState } from "react"
import { confirmPayment } from "./actions"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ConfirmPaymentButton({ orderId }: { orderId: string }) {
  const boundAction = confirmPayment.bind(null, orderId)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <form action={action}>
      <button
        className="flex items-center gap-1 px-md py-1.5 bg-success/10 text-success rounded-lg text-label-sm hover:bg-success/20 transition-colors disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {pending ? "Confirming..." : "Confirm Payment"}
      </button>
      {state && "success" in state && state.success && (
        <p className="text-label-sm text-success mt-1">Confirmed</p>
      )}
      {state && "error" in state && typeof state.error === "string" && (
        <p className="text-label-sm text-error mt-1">{state.error}</p>
      )}
    </form>
  )
}