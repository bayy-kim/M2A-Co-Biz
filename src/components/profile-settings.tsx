"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, ArrowLeft, User as UserIcon, Phone, Store, Landmark } from "lucide-react"
import { updateProfile, type ProfileSettingsState } from "@/app/profil/actions"

interface SellerData {
  businessName: string | null
  type: string | null
  bankName: string | null
  bankAccountNo: string | null
  bankAccountName: string | null
}

interface ProfileSettingsProps {
  user: { name: string | null; phone: string | null }
  seller: SellerData | null
  backHref: string
  backLabel: string
}

export function ProfileSettings({ user, seller, backHref, backLabel }: ProfileSettingsProps) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ProfileSettingsState, FormData>(updateProfile, {})

  return (
    <div className="min-h-screen" style={{ background: "var(--color-clay-bg)" }}>
      <header className="sticky top-0 z-50 mt-3 mx-4 clay-pill px-4 py-2.5 flex items-center justify-between max-w-2xl lg:mx-auto" style={{ boxShadow: "var(--shadow-clay-md)" }}>
        <Link href={backHref} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] btn-clay-outline text-xs" aria-label={backLabel}>
          <ArrowLeft className="w-4 h-4" /> <span>Kembali</span>
        </Link>
        <div className="flex-1 text-center text-headline-md font-bold" style={{ color: "var(--color-primary)" }}>
          Pengaturan Profil
        </div>
        <div className="w-8" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32">
        <form action={formAction} className="clay-lg p-6 md:p-8 space-y-6">
          {state.success && (
            <div className="clay-sm p-4 flex items-center gap-3" style={{ border: "1px solid var(--color-success)" }}>
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <p className="text-sm text-success font-semibold">{state.message}</p>
            </div>
          )}
          {state.message && !state.success && (
            <div className="clay-sm p-4 text-sm text-error">{state.message}</div>
          )}

          <div>
            <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
              <UserIcon className="w-5 h-5" /> Data Pribadi
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="fullName">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-outline)" }} />
                  <input id="fullName" name="fullName" defaultValue={user.name || ""} required className="clay-input w-full pl-10 pr-4 py-3 text-sm font-inter" />
                </div>
                {state.errors?.fullName && <p className="text-error text-xs mt-1 font-inter">{state.errors.fullName[0]}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="phone">No. Telepon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-outline)" }} />
                  <input id="phone" name="phone" defaultValue={user.phone || ""} required className="clay-input w-full pl-10 pr-4 py-3 text-sm font-inter" />
                </div>
                {state.errors?.phone && <p className="text-error text-xs mt-1 font-inter">{state.errors.phone[0]}</p>}
              </div>
            </div>
          </div>

          {seller && (
            <div className="pt-4" style={{ borderTop: "1px solid var(--color-outline)" }}>
              <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
                <Store className="w-5 h-5" /> Data Usaha
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block" htmlFor="businessName">Nama Usaha</label>
                  <input id="businessName" name="businessName" defaultValue={seller.businessName || ""} className="clay-input w-full px-4 py-3 text-sm font-inter" />
                  {state.errors?.businessName && <p className="text-error text-xs mt-1 font-inter">{state.errors.businessName[0]}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" htmlFor="businessType">Jenis Usaha</label>
                  <select id="businessType" name="businessType" defaultValue={seller.type || "UMKM"} className="clay-input w-full px-4 py-3 text-sm font-inter">
                    <option value="UMKM">UMKM (Produk)</option>
                    <option value="JASA">Jasa (Layanan)</option>
                  </select>
                </div>
              </div>

              <h4 className="text-base font-bold mt-6 mb-4 flex items-center gap-2" style={{ color: "var(--color-on-surface)" }}>
                <Landmark className="w-4 h-4" style={{ color: "var(--color-primary)" }} /> Rekening Bank (untuk Pencairan)
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block" htmlFor="bankName">Nama Bank</label>
                  <input id="bankName" name="bankName" defaultValue={seller.bankName || ""} placeholder="BRI / BSI / BCA" className="clay-input w-full px-4 py-3 text-sm font-inter" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" htmlFor="bankAccountNo">No. Rekening</label>
                  <input id="bankAccountNo" name="bankAccountNo" defaultValue={seller.bankAccountNo || ""} placeholder="1234567890" className="clay-input w-full px-4 py-3 text-sm font-inter" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" htmlFor="bankAccountName">Atas Nama</label>
                  <input id="bankAccountName" name="bankAccountName" defaultValue={seller.bankAccountName || ""} placeholder="Nama pemilik rekening" className="clay-input w-full px-4 py-3 text-sm font-inter" />
                </div>
              </div>
              <p className="text-xs mt-2 font-inter" style={{ color: "var(--color-on-surface-variant)" }}>
                Data rekening wajib diisi agar bisa mengajukan pencairan saldo.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={pending} className="btn-clay w-full justify-center py-3.5">
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {pending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            {state.success && (
              <button type="button" onClick={() => router.push(backHref)} className="btn-clay-outline w-full justify-center mt-3">
                Kembali ke Dashboard
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
