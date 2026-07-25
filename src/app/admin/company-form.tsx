"use client"

import { useActionState } from "react"
import { Save, Loader2 } from "lucide-react"
import { updateCompanyProfile } from "./actions"

interface CompanyProfileData {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  mapEmbedUrl: string | null
  bankName: string | null
  bankAccountName: string | null
  bankAccountNo: string | null
  qrisImageUrl: string | null
  whatsappNumber: string | null
}

export function CompanyProfileForm({ profile }: { profile: CompanyProfileData | null }) {
  const [state, action, pending] = useActionState(updateCompanyProfile, null)

  return (
    <form action={action} className="max-w-2xl space-y-lg">
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="name">Nama Perusahaan</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="name" name="name" defaultValue={profile?.name || "M2A Co-Biz"} required type="text" />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="address">Alamat</label>
        <textarea className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="address" name="address" required rows={3} defaultValue={profile?.address || ""} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="flex flex-col gap-xs">
          <label className="text-label-md text-on-surface" htmlFor="latitude">Latitude</label>
          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="latitude" name="latitude" type="number" step="any" defaultValue={profile?.latitude ?? ""} />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-label-md text-on-surface" htmlFor="longitude">Longitude</label>
          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="longitude" name="longitude" type="number" step="any" defaultValue={profile?.longitude ?? ""} />
        </div>
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="mapEmbedUrl">URL Embed Google Maps</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="mapEmbedUrl" name="mapEmbedUrl" type="url" defaultValue={profile?.mapEmbedUrl || ""} />
      </div>

      <hr className="border-outline-variant/30" />

      <h4 className="text-headline-md text-on-surface font-bold">Informasi Pembayaran</h4>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="bankName">Nama Bank</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="bankName" name="bankName" defaultValue={profile?.bankName || ""} />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="bankAccountName">Nama Pemilik Rekening</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="bankAccountName" name="bankAccountName" defaultValue={profile?.bankAccountName || ""} />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="bankAccountNo">Nomor Rekening</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="bankAccountNo" name="bankAccountNo" defaultValue={profile?.bankAccountNo || ""} />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="qrisImageUrl">URL Gambar QRIS</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="qrisImageUrl" name="qrisImageUrl" type="url" defaultValue={profile?.qrisImageUrl || ""} />
      </div>

      <hr className="border-outline-variant/30" />

      <h4 className="text-headline-md text-on-surface font-bold">Dukungan Pelanggan</h4>
      <div className="flex flex-col gap-xs">
        <label className="text-label-md text-on-surface" htmlFor="whatsappNumber">Nomor WhatsApp</label>
        <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="whatsappNumber" name="whatsappNumber" placeholder="+6281234567890" type="tel" defaultValue={profile?.whatsappNumber || ""} />
        <p className="text-label-sm text-on-surface-variant">Nomor untuk tombol &ldquo;Hubungi via WhatsApp&rdquo; di katalog dan landing page.</p>
      </div>

      <div className="flex justify-end pt-md">
        <button className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all flex items-center gap-2 disabled:opacity-50" disabled={pending} type="submit">
          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {pending ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
      {state && 'error' in state && typeof state.error === 'string' && (
        <div className="p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{state.error}</div>
      )}
      {state && 'success' in state && state.success === true && (
        <div className="p-md bg-success/10 text-success rounded-lg text-label-sm">Profil perusahaan diperbarui.</div>
      )}
    </form>
  )
}
