"use client"

import { useActionState } from "react"
import { setCommissionRule } from "./actions"

export function CommissionRuleForm() {
  const [state, action, pending] = useActionState(setCommissionRule, null)

  return (
    <form action={action} className="space-y-lg">
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="scope">Cakupan</label>
        <select className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="scope" name="scope" required>
          <option value="GLOBAL">Global (semua produk)</option>
          <option value="CATEGORY">Per Kategori</option>
          <option value="SELLER">Per Penjual</option>
        </select>
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="refId">ID Referensi (opsional)</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="refId" name="refId" placeholder="ID Kategori atau Penjual (kosongkan untuk Global)" type="text" />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="percent">Persentase Komisi (0-100)</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="percent" name="percent" placeholder="10" required type="number" min="0" max="100" step="0.01" />
      </div>
      <button className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all disabled:opacity-50" disabled={pending} type="submit">
        {pending ? "Menyimpan..." : "Atur Aturan Komisi"}
      </button>
      {state && 'error' in state && typeof state.error === 'string' && (
        <div className="p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{state.error}</div>
      )}
    </form>
  )
}
