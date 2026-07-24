"use client"

import { useActionState } from "react"
import { Plus, Loader2, ArrowRight } from "lucide-react"
import { createProduct } from "./actions"

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProduct, null)

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-lg">
      <div className="flex flex-col gap-xs md:col-span-2">
        <label className="text-label-md text-on-surface" htmlFor="title">Product Title</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="title" name="title" placeholder="e.g. Keripik Singkong Pedas" required type="text" />
      </div>
      <div className="flex flex-col gap-xs md:col-span-2">
        <label className="text-label-md text-on-surface" htmlFor="description">Description</label>
        <textarea className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="description" name="description" placeholder="Describe your product..." required rows={3} />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="priceRupiah">Price (Rupiah)</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="priceRupiah" name="priceRupiah" placeholder="50000" required type="number" min="1" />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="categoryId">Category</label>
        <select className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="categoryId" name="categoryId">
          <option value="">No category</option>
        </select>
      </div>
      <div className="md:col-span-2 flex justify-end pt-md">
        <button className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-50" disabled={pending} type="submit">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {pending ? "Adding..." : "Add Product"}
        </button>
      </div>
      {state && 'error' in state && typeof state.error === 'string' && (
        <div className="md:col-span-2 p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{state.error}</div>
      )}
    </form>
  )
}
