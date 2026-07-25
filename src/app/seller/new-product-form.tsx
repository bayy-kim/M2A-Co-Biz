"use client"

import { useActionState, useState } from "react"
import { Plus, Loader2, Lightbulb } from "lucide-react"
import { createProduct, proposeCategory } from "./actions"

interface CategoryOption {
  id: string
  name: string
}

export function NewProductForm({ categories = [] }: { categories?: CategoryOption[] }) {
  const [state, action, pending] = useActionState(createProduct, null)
  const [showPropose, setShowPropose] = useState(false)
  const [proposeState, proposeAction, proposePending] = useActionState(proposeCategory, null)

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
        <div className="flex gap-2">
          <select className="flex-1 rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="categoryId" name="categoryId">
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => setShowPropose(!showPropose)} className="px-md py-md rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors" title="Propose new category">
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showPropose && (
        <div className="md:col-span-2 bg-surface-container-low rounded-xl p-lg border border-outline-variant/30">
          <p className="text-label-md font-bold text-on-surface mb-md">Propose New Category</p>
          <form action={proposeAction} onSubmit={(e) => { e.stopPropagation(); proposeAction(new FormData(e.currentTarget)) }} className="flex gap-2">
            <input className="flex-1 rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" name="categoryName" placeholder="Category name..." required />
            <button className="px-xl py-md bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-2" disabled={proposePending} type="submit">
              {proposePending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit
            </button>
          </form>
          {proposeState && 'error' in proposeState && <p className="mt-md text-label-sm text-error">{proposeState.error}</p>}
          {proposeState && 'success' in proposeState && proposeState.success === true && (
            <p className="mt-md text-label-sm text-success">Category proposed! Admin will review it.</p>
          )}
        </div>
      )}
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
