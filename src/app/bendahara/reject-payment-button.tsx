"use client"

import { useActionState } from "react"
import { rejectPayment } from "./actions"
import { Loader2, XCircle, CheckCircle2 } from "lucide-react"

export function RejectPaymentButton({ orderId }: { orderId: string }) {
  const boundAction = rejectPayment.bind(null, orderId)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <form
      action={async () => {
        if (window.confirm("Tolak pembayaran ini? Stok akan dikembalikan dan pesanan ditandai gagal.")) {
          await boundAction()
        }
      }}
      className="inline-flex"
    >
      <button
        className="flex items-center gap-1 px-md py-1.5 bg-error/10 text-error rounded-lg text-label-sm hover:bg-error/20 transition-colors disabled:opacity-50"
        disabled={pending}
        type="submit"
        aria-label="Tolak pembayaran"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        {pending ? "Menolak..." : "Tolak"}
      </button>
      {state && "success" in state && state.success && (
        <span className="inline-flex items-center gap-1 ml-2 text-label-sm text-success"><CheckCircle2 className="w-3.5 h-3.5" /> Ditolak</span>
      )}
      {state && "error" in state && typeof state.error === "string" && (
        <span className="inline-flex items-center gap-1 ml-2 text-label-sm text-error">{state.error}</span>
      )}
    </form>
  )
}
