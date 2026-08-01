"use client"

import { useActionState } from "react"
import { confirmReceipt } from "./actions"
import { Loader2, PackageCheck, CheckCircle2 } from "lucide-react"

export function ConfirmReceiptButton({ orderId }: { orderId: string }) {
  const boundAction = confirmReceipt.bind(null, orderId)
  const [state, action, pending] = useActionState(boundAction, null)

  return (
    <form
      action={async () => {
        if (window.confirm("Konfirmasi bahwa Anda sudah menerima barang/jasa? Ulasan akan terbuka setelah ini.")) {
          await boundAction()
        }
      }}
      className="inline-flex"
    >
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
        style={{ color: "var(--color-success)", background: "var(--color-success)/10" }}
        aria-label="Terima pesanan"
      >
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PackageCheck className="w-3.5 h-3.5" />}
        Terima Pesanan
      </button>
      {state?.success && (
        <span className="inline-flex items-center gap-1 ml-2 text-xs text-success font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
        </span>
      )}
    </form>
  )
}
