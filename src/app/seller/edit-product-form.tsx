"use client"

import { useActionState, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, X } from "lucide-react"
import { updateProduct } from "./actions"

interface EditProductFormProps {
  productId: string
  title: string
  description: string
  priceRupiah: number
  categoryId: string | null
  categories: { id: string; name: string }[]
}

type State = { error?: string | Record<string, string[]>; success?: boolean } | null

export function EditProductForm({ productId, title, description, priceRupiah, categoryId, categories }: EditProductFormProps) {
  const router = useRouter()
  const boundAction = updateProduct.bind(null, productId)
  const [state, action, pending] = useActionState<State, FormData>(boundAction, null)
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div className="clay-lite p-lg mb-lg">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-headline-md text-on-surface font-bold">Edit Produk</h3>
        <button
          type="button"
          onClick={() => { setShow(false); router.push("/seller?tab=products") }}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-all"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form action={action} className="space-y-md">
        <div>
          <label className="text-label-sm font-medium block mb-1" htmlFor="edit-title">Judul</label>
          <input id="edit-title" name="title" defaultValue={title} required className="clay-input w-full px-lg py-md text-body-md" />
        </div>
        <div>
          <label className="text-label-sm font-medium block mb-1" htmlFor="edit-desc">Deskripsi</label>
          <textarea id="edit-desc" name="description" defaultValue={description} required rows={3} className="clay-input w-full px-lg py-md text-body-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <div>
            <label className="text-label-sm font-medium block mb-1" htmlFor="edit-price">Harga (Rp)</label>
            <input id="edit-price" name="priceRupiah" type="number" min="1" defaultValue={priceRupiah} required className="clay-input w-full px-lg py-md text-body-md" />
          </div>
          <div>
            <label className="text-label-sm font-medium block mb-1" htmlFor="edit-category">Kategori</label>
            <select id="edit-category" name="categoryId" defaultValue={categoryId || ""} className="clay-input w-full px-lg py-md text-body-md">
              <option value="">Tanpa Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-label-sm font-medium block mb-1" htmlFor="edit-images">Tambah Foto (opsional, JPG/PNG/WebP)</label>
          <input id="edit-images" name="images" type="file" multiple accept="image/jpeg,image/png,image/webp" className="text-label-sm w-full" />
          <p className="text-label-sm text-on-surface-variant mt-1">Foto lama tetap dipertahankan; foto baru ditambahkan.</p>
        </div>

        {typeof state?.error === "string" && <p className="text-error text-label-sm">{state.error}</p>}
        {state?.success && <p className="text-success text-label-sm font-bold">Produk berhasil diperbarui.</p>}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={pending} className="btn-clay text-sm">
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button type="button" onClick={() => { setShow(false); router.push("/seller?tab=products") }} className="btn-clay-outline text-sm">Batal</button>
        </div>
      </form>
    </div>
  )
}
