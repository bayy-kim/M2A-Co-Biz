"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"
import { deleteProduct } from "./actions"

export function ProductDeleteButton({ productId, productTitle }: { productId: string; productTitle: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Hapus produk "${productTitle}"? Tindakan ini tidak bisa dibatalkan.`)) return
    setPending(true)
    const res = await deleteProduct(productId)
    setPending(false)
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || "Gagal menghapus produk.")
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
      style={{ color: "var(--color-error)", background: "var(--color-error)/10" }}
      aria-label={`Hapus ${productTitle}`}
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      Hapus
    </button>
  )
}
