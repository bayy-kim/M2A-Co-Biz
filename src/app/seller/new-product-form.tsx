"use client"

import { useActionState, useState, useRef } from "react"
import { Plus, Loader2, Lightbulb, Upload, X } from "lucide-react"
import { createProduct, proposeCategory } from "./actions"

interface CategoryOption {
  id: string
  name: string
}

export function NewProductForm({ 
  categories = [], 
  sellerType = "UMKM" 
}: { 
  categories?: CategoryOption[]
  sellerType?: "UMKM" | "JASA"
}) {
  const [state, action, pending] = useActionState(createProduct, null)
  const [showPropose, setShowPropose] = useState(false)
  const [proposeState, proposeAction, proposePending] = useActionState(proposeCategory, null)
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const isJasa = sellerType === "JASA"

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...urls].slice(0, 5))
  }

  const removePreview = (idx: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== idx))
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-lg">
      <div className="flex flex-col gap-xs md:col-span-2">
        <label className="text-label-md text-on-surface" htmlFor="title">
          {isJasa ? "Nama Layanan Jasa" : "Nama Produk"}
        </label>
        <input 
          className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all text-body-md" 
          id="title" 
          name="title" 
          placeholder={isJasa ? "Contoh: Jasa Servis Motor Matic / Editing Video / Pijat Refleksi" : "Contoh: Keripik Singkong Pedas"} 
          required 
          type="text" 
        />
      </div>
      <div className="flex flex-col gap-xs md:col-span-2">
        <label className="text-label-md text-on-surface" htmlFor="description">
          {isJasa ? "Deskripsi Layanan & Ketentuan" : "Deskripsi"}
        </label>
        <textarea 
          className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all text-body-md" 
          id="description" 
          name="description" 
          placeholder={isJasa ? "Jelaskan estimasi pengerjaan, garansi, fasilitas, atau ketentuan panggilan..." : "Deskripsikan produk Anda..."} 
          required 
          rows={3} 
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-label-md text-on-surface block mb-xs">
          {isJasa ? "Foto Layanan / Banner Portofolio" : "Gambar Produk"}
        </label>
        <div className="flex flex-wrap gap-3 items-start">
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
            <Upload className="w-5 h-5 text-on-surface-variant" />
            <span className="text-label-sm text-on-surface-variant mt-1">Upload</span>
            <input ref={fileRef} className="hidden" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} />
          </label>
          {previews.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-outline-variant group">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removePreview(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="priceRupiah">
          {isJasa ? "Tarif / Biaya Jasa (Rupiah)" : "Harga (Rupiah)"}
        </label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all text-body-md" id="priceRupiah" name="priceRupiah" placeholder="50000" required type="number" min="1" />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="variants">
          Varian {isJasa ? "Layanan" : "Produk"} <span className="text-on-surface-variant font-normal text-label-sm">(Opsional)</span>
        </label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all text-body-md" id="variants" name="variants" placeholder="Contoh: Merah, Biru, Hijau atau S, M, L" type="text" />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="stock">
          Stok Awal <span className="text-on-surface-variant font-normal text-label-sm">(Default: 10)</span>
        </label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all text-body-md" id="stock" name="stock" defaultValue="10" type="number" min="0" />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="categoryId">Kategori</label>
        <div className="flex gap-2">
          <select className="flex-1 rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="categoryId" name="categoryId">
            <option value="">Tanpa kategori</option>
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
          <p className="text-label-md font-bold text-on-surface mb-md">Usulkan Kategori Baru</p>
          <div className="flex gap-2">
            <input className="flex-1 rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="categoryNameInput" name="categoryName" placeholder="Nama kategori..." required />
            <button type="button" className="px-xl py-md bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-2" disabled={proposePending} onClick={async () => {
              const input = document.getElementById("categoryNameInput") as HTMLInputElement
              if (!input.value.trim()) return
              const fd = new FormData()
              fd.set("categoryName", input.value)
              await proposeAction(fd)
              input.value = ""
            }}>
              {proposePending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Kirim
            </button>
          </div>
          {proposeState && 'error' in proposeState && <p className="mt-md text-label-sm text-error">{proposeState.error}</p>}
          {proposeState && 'success' in proposeState && proposeState.success === true && (
            <p className="mt-md text-label-sm text-success">Kategori diusulkan! Admin akan meninjaunya.</p>
          )}
        </div>
      )}
      <div className="md:col-span-2 flex justify-end pt-md">
        <button className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-50" disabled={pending} type="submit">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {pending ? "Menambahkan..." : "Tambah Produk"}
        </button>
      </div>
      {state && 'error' in state && typeof state.error === 'string' && (
        <div className="md:col-span-2 p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{state.error}</div>
      )}
    </form>
  )
}
