"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Loader2, ArrowRight, User, Phone, Package, CheckCircle } from "lucide-react"
import { createCheckout } from "./actions"

export function CheckoutForm({
  productId,
  buyerId,
  defaultName,
  defaultPhone,
}: {
  productId: string
  buyerId?: string
  defaultName?: string
  defaultPhone?: string
}) {
  const router = useRouter()

  const checkout = async (_prev: unknown, formData: FormData) => {
    formData.set("productId", productId)
    if (buyerId) formData.set("buyerId", buyerId)
    const result = await createCheckout(formData)
    if (result?.success) {
      router.push(`/checkout?orderId=${result.orderId}`)
    }
    return result
  }

  const [state, action, pending] = useActionState(checkout, null)

  return (
    <form action={action} className="space-y-lg">
      {defaultName && defaultPhone ? (
        <div className="p-md bg-surface-container-low rounded-lg border border-outline-variant/30 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div className="text-label-sm text-on-surface-variant">
            Pesanan atas nama <span className="font-bold text-on-surface">{defaultName}</span> ({defaultPhone}).
            <input type="hidden" name="buyerName" value={defaultName} />
            <input type="hidden" name="buyerPhone" value={defaultPhone} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface" htmlFor="buyerName">Nama Lengkap</label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
              <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" id="buyerName" name="buyerName" placeholder="Nama lengkap Anda" required type="text" />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-label-md text-on-surface" htmlFor="buyerPhone">Nomor Telepon</label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
              <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" id="buyerPhone" name="buyerPhone" placeholder="+62 812 XXXX XXXX" required type="tel" />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="qty">Jumlah / Qty</label>
        <div className="relative group">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
          <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" defaultValue="1" id="qty" min="1" name="qty" required type="number" />
        </div>
      </div>

      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="serviceNotes">
          Catatan / Alamat Lokasi Pengerjaan <span className="text-on-surface-variant font-normal text-label-sm">(Opsional khusus Jasa)</span>
        </label>
        <textarea 
          className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" 
          id="serviceNotes" 
          name="serviceNotes" 
          placeholder="Contoh: Alamat rumah untuk pengerjaan servis AC/Motor, atau catatan spesifikasi pesanan..." 
          rows={2} 
        />
      </div>

      <div className="bg-warning/5 border border-warning/20 rounded-lg p-md text-label-sm text-on-surface flex items-start gap-2">
        <CreditCard className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <span>Pembayaran melalui QRIS atau transfer bank. Petunjuk pembayaran akan muncul setelah pesanan dibuat.</span>
      </div>

      {state && 'error' in state && typeof state.error === 'string' && (
        <div className="p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{state.error}</div>
      )}

      <button className="w-full py-3.5 bg-accent-gold text-white rounded-xl text-headline-md font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50" disabled={pending} type="submit">
        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        {pending ? "Memproses..." : "Buat Pesanan"}
      </button>
    </form>
  )
}
