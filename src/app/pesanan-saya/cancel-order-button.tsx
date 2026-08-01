"use client"

import { useActionState } from "react"
import { cancelOrder, type CancelOrderState } from "./actions"
import { Loader2, XCircle, CheckCircle2 } from "lucide-react"

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const boundAction = cancelOrder.bind(null, orderId)
  const [state, action, pending] = useActionState<CancelOrderState, FormData>(boundAction, null)

  return (
    <form
      action={async () => {
        if (window.confirm("Batalkan pesanan ini? Stok akan dikembalikan ke penjual.")) {
          await boundAction()
        }
      }}
      className="inline-flex"
    >
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50"
        style={{ color: "var(--color-error)", borderColor: "var(--color-error)", background: "var(--color-clay-surface)" }}
        aria-label="Batalkan pesanan"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        Batal
      </button>
      {state?.success && (
        <span className="inline-flex items-center gap-1 ml-2 text-xs text-success font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Dibatalkan
        </span>
      )}
    </form>
  )
}
