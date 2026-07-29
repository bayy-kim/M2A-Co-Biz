"use client"

import { useState, useActionState, useRef } from "react"
import { Badge, Group, FileText, ArrowRight, ShieldCheck, ShoppingBag, Store, Upload, Check, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Logo } from "@/components/logo"
import { completeBuyerProfile, completeSellerProfile, skipProfileCompletion, type ProfileUpdateState } from "./actions"

export function ProfileForm({ user, defaultRole }: { user: any; defaultRole: "buyer" | "seller" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update } = useSession()
  const callbackUrl = searchParams.get("callbackUrl")

  const isStaff = user.role === "ADMIN" || user.role === "BENDAHARA" || user.role === "KETUA"
  const [role, setRole] = useState<"buyer" | "seller">(defaultRole)
  const [step, setStep] = useState(1)
  const totalSteps = role === "seller" && !isStaff ? 3 : 1
  const formRef = useRef<HTMLFormElement>(null)

  const [fullName, setFullName] = useState(user.name || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [businessType, setBusinessType] = useState<"UMKM" | "JASA">("UMKM")
  const [businessName, setBusinessName] = useState("")

  const [files, setFiles] = useState<Record<string, { name: string } | null>>({})
  const [state, formAction, pending] = useActionState<ProfileUpdateState, FormData>(
    role === "seller" && !isStaff ? completeSellerProfile : completeBuyerProfile,
    {},
  )

  const [stepError, setStepError] = useState<string>("")

  const nextStep = () => {
    setStepError("")
    if (step === 1 && role === "seller") {
      if (!fullName.trim() || fullName.trim().length < 3) return setStepError("Nama lengkap minimal 3 karakter.")
      if (!phone.trim() || phone.trim().length < 8) return setStepError("Nomor telepon minimal 8 karakter.")
      if (!businessName.trim() || businessName.trim().length < 3) return setStepError("Nama usaha minimal 3 karakter.")
    } else if (step === 2 && role === "seller") {
      if (!files.ktp || !files.kartuKeluarga) return setStepError("KTP dan Kartu Keluarga wajib diunggah.")
    }
    if (step < totalSteps) setStep(step + 1)
  }
  const prevStep = () => { if (step > 1) setStep(step - 1) }

  const handleCompletionRedirect = async () => {
    // Refresh NextAuth JWT session cookie
    await update({ 
      isProfileComplete: true, 
      role: role === "seller" ? "SELLER" : "BUYER",
      phone: phone 
    })
    
    // Use the callback URL if available, otherwise use default role-based routing
    if (callbackUrl && callbackUrl !== "/login" && callbackUrl !== "/register") {
      router.push(callbackUrl)
    } else if (isStaff) {
      // Staff redirect to their own dashboard
      if (user.role === "ADMIN") router.push("/admin")
      else if (user.role === "BENDAHARA") router.push("/bendahara")
      else if (user.role === "KETUA") router.push("/ketua")
      else router.push("/")
    } else {
      router.push(role === "seller" ? "/seller" : "/catalog")
    }
    router.refresh()
  }

  const handleSkip = async () => {
    setStepError("")
    const res = await skipProfileCompletion()
    if (res.success) {
      await update({ isProfileComplete: true })
      router.push(role === "seller" ? "/seller" : "/catalog")
      router.refresh()
    } else {
      setStepError(res.message || "Gagal melewati pengisian profil.")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state.success) {
      await handleCompletionRedirect()
      return
    }
    if (step < totalSteps) return nextStep()
    const form = formRef.current
    if (!form) return
    formAction(new FormData(form))
  }

  if (state.success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-gutter">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-xl">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-display-md text-primary mb-2">Profil Berhasil Dilengkapi!</h2>
        <p className="text-body-md text-on-surface-variant text-center max-w-md mb-xl">
          {role === "buyer" 
            ? "Akun pembeli Anda kini sudah aktif dan siap digunakan."
            : "Data bisnis Anda sedang dalam proses verifikasi. Kami akan memberitahu Anda secepatnya."}
        </p>
        <button 
          onClick={handleCompletionRedirect}
          className="px-xl py-3 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:brightness-110 active:scale-95 transition-all"
        >
          Lanjutkan
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16 pb-24 px-gutter">
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-xs h-16 flex items-center justify-center">
        <Logo size="sm" />
      </header>

      <main className="flex-grow flex items-center justify-center max-w-4xl mx-auto w-full mt-xl">
        <div className="w-full">
          <div className="text-center mb-xl">
            <h1 className="text-display-md text-primary font-bold tracking-tight">Lengkapi Profil Anda</h1>
            <p className="text-body-md text-on-surface-variant mt-2">
              Satu langkah lagi untuk mulai {role === "buyer" ? "berbelanja" : "berjualan"} di M2A Co-Biz.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-xl p-1.5 bg-surface-container rounded-xl max-w-xs mx-auto">
            <button
              onClick={() => { setRole("buyer"); setStep(1); setStepError("") }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-bold transition-all ${role === "buyer" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              type="button"
            >
              <ShoppingBag className="w-4 h-4" /> Pembeli
            </button>
            <button
              onClick={() => { setRole("seller"); setStep(1); setStepError("") }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-bold transition-all ${role === "seller" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              type="button"
            >
              <Store className="w-4 h-4" /> Penjual
            </button>
          </div>

          {stepError && (
            <div className="mb-lg p-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-xl text-label-md font-medium text-center">
              {stepError}
            </div>
          )}
          {state.message && !state.success && (
            <div className="mb-lg p-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-xl text-label-md font-medium text-center">
              {state.message}
            </div>
          )}

          <div className="p-[1px] rounded-[1.5rem] bg-gradient-to-b from-outline-variant/40 to-transparent shadow-2xl">
            <form key={role} ref={formRef} onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-[calc(1.5rem-1px)] p-lg md:p-xxl border border-outline-variant/10">
              
              {role === "seller" && (
                <div className="flex justify-between items-center mb-xl px-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                          s < step ? "bg-emerald-500 text-white" : s === step ? "bg-primary text-on-primary ring-4 ring-primary-container/20" : "bg-surface-container-highest text-on-surface-variant"
                        }`}>
                          {s < step ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : s}
                        </div>
                        <span className={`text-[10px] md:text-label-sm uppercase tracking-wider ${s <= step ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                          {s === 1 ? "Bisnis" : s === 2 ? "Dokumen" : "Selesai"}
                        </span>
                      </div>
                      {s < totalSteps && (
                        <div className="flex-grow h-0.5 bg-surface-container-highest mx-2 md:mx-4 mb-6 rounded-full relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-primary transition-all duration-500" style={{ width: s < step ? "100%" : "0%" }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <section className={step !== 1 ? "hidden" : ""}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">Informasi Akun</label>
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-label-md text-on-surface">Nama Lengkap</label>
                    <input className="rounded-lg border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 px-lg py-3 bg-surface text-on-surface" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    {state.errors?.fullName && <span className="text-error text-label-sm">{state.errors.fullName[0]}</span>}
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-label-md text-on-surface">Email <span className="text-on-surface-variant font-normal">(dari Google)</span></label>
                    <input className="rounded-lg border-outline-variant/50 px-lg py-3 bg-surface-container-low text-on-surface-variant cursor-not-allowed" value={user.email || ""} disabled readOnly />
                  </div>
                  <div className="flex flex-col gap-xs md:col-span-2">
                    <label className="text-label-md text-on-surface">No. Telepon / WhatsApp</label>
                    <input className="rounded-lg border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 px-lg py-3 bg-surface text-on-surface" name="phone" placeholder="+62 812 XXXX XXXX" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    {state.errors?.phone && <span className="text-error text-label-sm">{state.errors.phone[0]}</span>}
                  </div>

                  {role === "seller" && (
                    <>
                      <div className="flex flex-col gap-xs md:col-span-2 mt-md">
                        <label className="text-label-sm font-bold text-on-surface uppercase tracking-wider">Identifikasi Bisnis</label>
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-label-md text-on-surface">Jenis Usaha</label>
                        <select className="rounded-lg border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 px-lg py-3 bg-surface text-on-surface" name="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value as any)}>
                          <option value="UMKM">UMKM (Produk Fisik)</option>
                          <option value="JASA">Jasa (Layanan)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-label-md text-on-surface">Nama Toko / Usaha</label>
                        <input className="rounded-lg border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 px-lg py-3 bg-surface text-on-surface" name="businessName" placeholder="Nama brand usaha Anda" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required={role === "seller"} />
                        {state.errors?.businessName && <span className="text-error text-label-sm">{state.errors.businessName[0]}</span>}
                      </div>
                    </>
                  )}
                </div>
              </section>

              {role === "seller" && (
                <section className={step !== 2 ? "hidden" : ""}>
                  <div className="bg-sky-500/10 border border-sky-500/20 text-sky-800 p-md rounded-xl mb-xl text-label-md flex gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>Seluruh dokumen KTP dan Kartu Keluarga Anda <strong>dienkripsi secara otomatis (AES-256)</strong> sebelum disimpan ke server. Data ini dijamin kerahasiaannya.</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    <div className={`flex flex-col items-center justify-center p-xl border-2 ${files.ktp ? "border-primary bg-primary/5" : "border-dashed border-outline-variant"} rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative`}>
                      <input className="absolute inset-0 opacity-0 cursor-pointer" name="ktp" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, ktp: e.target.files?.[0] ? { name: e.target.files[0].name } : null }))} />
                      {files.ktp ? (
                        <div className="text-center pointer-events-none">
                          <Upload className="text-primary w-8 h-8 mx-auto mb-2" />
                          <span className="text-label-sm font-bold text-primary truncate max-w-full">{files.ktp.name}</span>
                        </div>
                      ) : (
                        <div className="text-center pointer-events-none">
                          <Badge className="text-primary-container w-10 h-10 mb-3 mx-auto" />
                          <p className="text-label-md font-bold text-on-surface">KTP</p>
                          <p className="text-[10px] text-on-surface-variant uppercase mt-1">Wajib</p>
                        </div>
                      )}
                    </div>

                    <div className={`flex flex-col items-center justify-center p-xl border-2 ${files.kartuKeluarga ? "border-primary bg-primary/5" : "border-dashed border-outline-variant"} rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative`}>
                      <input className="absolute inset-0 opacity-0 cursor-pointer" name="kartuKeluarga" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, kartuKeluarga: e.target.files?.[0] ? { name: e.target.files[0].name } : null }))} />
                      {files.kartuKeluarga ? (
                        <div className="text-center pointer-events-none">
                          <Upload className="text-primary w-8 h-8 mx-auto mb-2" />
                          <span className="text-label-sm font-bold text-primary truncate max-w-full">{files.kartuKeluarga.name}</span>
                        </div>
                      ) : (
                        <div className="text-center pointer-events-none">
                          <Group className="text-primary-container w-10 h-10 mb-3 mx-auto" />
                          <p className="text-label-md font-bold text-on-surface">Kartu Keluarga</p>
                          <p className="text-[10px] text-on-surface-variant uppercase mt-1">Wajib</p>
                        </div>
                      )}
                    </div>

                    <div className={`flex flex-col items-center justify-center p-xl border-2 ${files.izinUsaha ? "border-primary bg-primary/5" : "border-dashed border-outline-variant"} rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative`}>
                      <input className="absolute inset-0 opacity-0 cursor-pointer" name="izinUsaha" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, izinUsaha: e.target.files?.[0] ? { name: e.target.files[0].name } : null }))} />
                      {files.izinUsaha ? (
                        <div className="text-center pointer-events-none">
                          <Upload className="text-primary w-8 h-8 mx-auto mb-2" />
                          <span className="text-label-sm font-bold text-primary truncate max-w-full">{files.izinUsaha.name}</span>
                        </div>
                      ) : (
                        <div className="text-center pointer-events-none">
                          <FileText className="text-on-surface-variant w-10 h-10 mb-3 mx-auto" />
                          <p className="text-label-md font-bold text-on-surface">Izin Usaha</p>
                          <p className="text-[10px] text-on-surface-variant uppercase mt-1">Opsional</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section className={role === "buyer" || step === 3 ? "" : "hidden"}>
                <div className="mt-xl pt-lg border-t border-outline-variant/30 flex items-start gap-md">
                  <input className="mt-1 w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer" id="consent" name="consent" type="checkbox" required />
                  <label htmlFor="consent" className="text-body-md text-on-surface">
                    Saya menyatakan bahwa informasi ini benar dan menyetujui <a href="/terms" className="text-primary font-bold hover:underline">Ketentuan Layanan</a> serta <a href="/privacy" className="text-primary font-bold hover:underline">Kebijakan Privasi</a> M2A Co-Biz.
                  </label>
                </div>
                {state.errors?.consent && <p className="text-error text-label-sm mt-1 ml-9">{state.errors.consent[0]}</p>}
              </section>

              <div className="flex items-center justify-between mt-xl pt-xl border-t border-outline-variant/30">
                {role === "seller" && step > 1 ? (
                  <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl text-label-md font-bold text-on-surface-variant hover:bg-surface-container transition-all">
                    Kembali
                  </button>
                ) : !isStaff && step >= totalSteps ? (
                  <button type="button" onClick={handleSkip} className="border border-outline-variant hover:bg-surface-container text-on-surface-variant font-bold px-6 py-3 rounded-xl min-h-[44px] transition-all">
                    Isi Nanti
                  </button>
                ) : <div />}

                {step < totalSteps ? (
                  <button type="button" onClick={nextStep} className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold shadow-md hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2">
                    Selanjutnya <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" disabled={pending} className="px-8 py-3 bg-accent-gold text-on-primary-fixed rounded-xl font-bold shadow-md shadow-accent-gold/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70">
                    {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {pending ? "Menyimpan..." : role === "seller" ? "Kirim Pengajuan" : "Selesai"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}