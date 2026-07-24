"use client"

import { useActionState } from "react"
import { requestPayout } from "./actions"
import { Loader2, Wallet } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

export function RequestPayoutForm({ availableBalance }: { availableBalance: number }) {
  const [state, action, pending] = useActionState(requestPayout, null)

  return (
    <form action={action} className="space-y-lg">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-md flex items-center gap-3">
        <Wallet className="w-6 h-6 text-primary flex-shrink-0" />
        <div>
          <p className="text-label-sm text-on-surface-variant">Available Balance</p>
          <p className="text-display-md font-bold text-primary">{formatRupiah(availableBalance)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="amountRupiah">Amount to Withdraw</label>
        <input
          className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all"
          id="amountRupiah"
          name="amountRupiah"
          placeholder="50000"
          required
          type="number"
          min="1"
          max={availableBalance}
        />
      </div>

      <button
        className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-50"
        disabled={pending || availableBalance <= 0}
        type="submit"
      >
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
        {pending ? "Requesting..." : "Request Payout"}
      </button>

      {state && "success" in state && state.success && (
        <div className="p-md bg-success/10 text-success rounded-lg text-label-sm">Payout requested successfully. Waiting for approval.</div>
      )}
      {state && "error" in state && typeof state.error === "string" && (
        <div className="p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{state.error}</div>
      )}
    </form>
  )
}