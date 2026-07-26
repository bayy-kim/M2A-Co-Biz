"use client"

import { useState, useActionState, useRef, Suspense } from "react"
import { Badge, Group, FileText, ArrowLeft, ArrowRight, Check, ShieldCheck, LifeBuoy, Loader2, ShoppingBag, Store, Upload } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { register, registerBuyer, type RegisterState } from "./actions"
import { Logo } from "@/components/logo"

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") === "seller" ? "seller" : "buyer"
  const [role, setRole] = useState<"buyer" | "seller">(initialRole)
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const formRef = useRef<HTMLFormElement>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [businessType, setBusinessType] = useState<"UMKM" | "JASA">("UMKM")
  const [businessName, setBusinessName] = useState("")
  const [password, setPassword] = useState("")

  const [files, setFiles] = useState<Record<string, { name: string } | null>>({})
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    role === "seller" ? register : registerBuyer,
    {},
  )

  const [stepError, setStepError] = useState<string>("")

  const nextStep = () => {
    setStepError("")

    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        setStepError("Nama lengkap minimal 3 karakter.")
        return
      }
      if (!email.trim() || !email.includes("@")) {
        setStepError("Email tidak valid.")
        return
      }
      if (!phone.trim() || phone.trim().length < 8) {
        setStepError("Nomor telepon minimal 8 karakter.")
        return
      }
      if (!businessName.trim() || businessName.trim().length < 3) {
        setStepError("Nama toko/usaha minimal 3 karakter.")
        return
      }
      if (!password || password.length < 8) {
        setStepError("Kata sandi minimal 8 karakter.")
        return
      }
    } else if (step === 2) {
      if (!files.ktp) {
        setStepError("Dokumen KTP wajib diunggah.")
        return
      }
      if (!files.kartuKeluarga) {
        setStepError("Dokumen Kartu Keluarga wajib diunggah.")
        return
      }
    }

    if (step < totalSteps) setStep(step + 1)
  }
  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (state.success) {
      router.push("/login")
      return
    }
    if (role === "buyer") {
      const form = formRef.current
      if (!form) return
      const fd = new FormData(form)
      formAction(fd)
      return
    }
    if (step < totalSteps) {
      nextStep()
      return
    }
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    formAction(fd)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 w-full z-50 bg-surface shadow-sm h-16 flex items-center px-lg md:px-xl justify-between">
        <div className="flex items-center gap-md">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-sm font-bold text-on-surface hover:bg-surface-container hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <Logo size="sm" />
        </div>
        <div className="hidden md:block">
          <span className="text-on-surface-variant text-label-md">
            Sudah daftar?{" "}
            <Link href="/login" className="text-primary font-bold">Masuk</Link>
          </span>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-gutter flex justify-center items-start">
        <div className="w-full max-w-4xl">
              {state.success ? (
            <div className="flex flex-col items-center justify-center py-xxl">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-xl">
                <Check className="w-10 h-10 text-success" />
              </div>
              {role === "buyer" ? (
                <>
                  <h2 className="text-headline-lg text-primary mb-2">Akun Dibuat!</h2>
                  <p className="text-body-md text-on-surface-variant text-center max-w-md">
                    Akun pembeli Anda siap. Silakan masuk dan mulai berbelanja.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-headline-lg text-primary mb-2">Pendaftaran Terkirim!</h2>
                  <p className="text-body-md text-on-surface-variant text-center max-w-md">
                    Pendaftaran Anda sedang ditinjau. Kami akan memberi tahu Anda melalui email setelah disetujui.
                  </p>
                </>
              )}
              <Link href="/login" className="mt-xl w-full max-w-xs py-3 bg-primary text-on-primary rounded-lg text-label-md font-bold text-center hover:opacity-90 transition-opacity block">
                Masuk
              </Link>
            </div>
          ) : (
            <>

              <div className="flex items-center justify-center gap-2 mb-xl bg-surface-container rounded-xl p-1.5 max-w-xs mx-auto">
                <button
                  onClick={() => { setRole("buyer"); setStep(1) }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-bold transition-all ${role === "buyer" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                  type="button"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Pembeli
                </button>
                <button
                  onClick={() => { setRole("seller"); setStep(1) }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-md font-bold transition-all ${role === "seller" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                  type="button"
                >
                  <Store className="w-4 h-4" />
                  Penjual
                </button>
              </div>

              {stepError && (
                <div className="mb-lg p-lg bg-error-container text-on-error-container rounded-lg text-label-md">
                  {stepError}
                </div>
              )}

              {state.message && !state.success && (
                <div className="mb-lg p-lg bg-error-container text-on-error-container rounded-lg text-label-md">
                  {state.message}
                </div>
              )}

              <form key={role} ref={formRef} onSubmit={handleSubmit} className="bg-surface/80 backdrop-blur-md rounded-xl p-lg md:p-xxl shadow-lg border border-white/30">
                {role === "buyer" ? (
                  <>
                    <div className="mb-xl">
                      <h2 className="text-headline-lg text-primary mb-2">Buat Akun Pembeli</h2>
                      <p className="text-on-surface-variant text-body-md">Daftar cepat untuk mulai berbelanja di M2A Co-Biz.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                      <div className="flex flex-col gap-xs">
                        <label className="text-label-md text-on-surface" htmlFor="fullName">Nama Lengkap</label>
                        <input className="rounded-lg border-outline-variant focus:ring-2 focus-visible:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="fullName" name="fullName" placeholder="Nama lengkap" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        {state.errors?.fullName && <span className="text-error text-label-sm">{state.errors.fullName[0]}</span>}
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-label-md text-on-surface" htmlFor="email">Email</label>
                        <input className="rounded-lg border-outline-variant focus:ring-2 focus-visible:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="email" name="email" placeholder="nama@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        {state.errors?.email && <span className="text-error text-label-sm">{state.errors.email[0]}</span>}
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-label-md text-on-surface" htmlFor="phone">No. Telepon</label>
                        <input className="rounded-lg border-outline-variant focus:ring-2 focus-visible:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="phone" name="phone" placeholder="+62 812 XXXX XXXX" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        {state.errors?.phone && <span className="text-error text-label-sm">{state.errors.phone[0]}</span>}
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-label-md text-on-surface" htmlFor="password">Password</label>
                        <input className="rounded-lg border-outline-variant focus:ring-2 focus-visible:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="password" name="password" placeholder="Min. 8 karakter" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        {state.errors?.password && <span className="text-error text-label-sm">{state.errors.password[0]}</span>}
                      </div>
                    </div>
                    <div className="flex items-start gap-md pt-lg mt-lg border-t border-outline-variant">
                      <div className="flex h-6 items-center">
                        <input className="h-5 w-5 rounded border-outline text-primary focus:ring-primary cursor-pointer transition-all" id="consent" name="consent" type="checkbox" />
                      </div>
                      <div className="text-body-md">
                        <label className="font-medium text-on-surface" htmlFor="consent">Saya menyetujui{" "}<a className="text-primary underline" href="/terms">Ketentuan Layanan</a>{" "}dan{" "}<a className="text-primary underline" href="/privacy">Kebijakan Privasi</a>.</label>
                      </div>
                    </div>
                    {state.errors?.consent && <span className="text-error text-label-sm">{state.errors.consent[0]}</span>}
                    <div className="mt-xl">
                      <button className="w-full py-3.5 bg-accent-gold text-white rounded-xl text-headline-md font-bold shadow-lg hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-50" disabled={pending} type="submit">
                        {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        {pending ? "Mendaftarkan..." : "Daftar & Mulai Belanja"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {role === "seller" && (
                      <div className="mb-xxl">
                        <div className="flex justify-between items-center mb-4 px-2">
                          {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                              <div className="flex flex-col items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                  s < step ? "bg-success text-white" : s === step ? "bg-primary text-on-primary ring-4 ring-primary-container/20" : "bg-surface-container-highest text-on-surface-variant"
                                }`}>
                                  {s < step ? <Check className="w-[18px] h-[18px]" /> : s}
                                </div>
                                <span className={`text-label-sm ${s <= step ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                                  {s === 1 ? "Informasi" : s === 2 ? "Dokumen" : "Persetujuan"}
                                </span>
                              </div>
                              {s < totalSteps && (
                                <div className="flex-grow h-0.5 bg-surface-container-highest mx-4 mb-6 rounded-full relative overflow-hidden">
                                  <div className="absolute left-0 top-0 h-full bg-primary transition-all duration-500" style={{ width: s < step ? "100%" : "0%" }} />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <section className={step !== 1 ? "hidden" : ""}>
                      <div className="mb-xl">
                        <h2 className="text-headline-lg text-primary mb-2">Identifikasi Bisnis</h2>
                        <p className="text-on-surface-variant text-body-md">Silakan lengkapi data pribadi dan usaha Anda untuk memulai perjalanan bersama M2A Co-Biz.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md text-on-surface" htmlFor="fullName">Nama Lengkap</label>
                          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="fullName" name="fullName" placeholder="Nama sesuai KTP" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                          {state.errors?.fullName && <span className="text-error text-label-sm">{state.errors.fullName[0]}</span>}
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md text-on-surface" htmlFor="email">Email</label>
                          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="email" name="email" placeholder="name@business.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                          {state.errors?.email && <span className="text-error text-label-sm">{state.errors.email[0]}</span>}
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md text-on-surface" htmlFor="phone">No. Telepon</label>
                          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="phone" name="phone" placeholder="+62 812 XXXX XXXX" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                          {state.errors?.phone && <span className="text-error text-label-sm">{state.errors.phone[0]}</span>}
                        </div>
                        <div className="flex flex-col gap-xs">
                          <label className="text-label-md text-on-surface" htmlFor="businessType">Jenis Usaha</label>
                          <select className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="businessType" name="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value as "UMKM" | "JASA")} required>
                            <option value="UMKM">UMKM (Product)</option>
                            <option value="JASA">Jasa (Service)</option>
                          </select>
                          {state.errors?.businessType && <span className="text-error text-label-sm">{state.errors.businessType[0]}</span>}
                        </div>
                        <div className="flex flex-col gap-xs md:col-span-2">
                          <label className="text-label-md text-on-surface" htmlFor="businessName">Nama Toko / Usaha</label>
                          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="businessName" name="businessName" placeholder="Nama brand usaha Anda" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                          {state.errors?.businessName && <span className="text-error text-label-sm">{state.errors.businessName[0]}</span>}
                        </div>
                        <div className="flex flex-col gap-xs md:col-span-2">
                        <label className="text-label-md text-on-surface" htmlFor="password">Kata Sandi</label>
                          <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="password" name="password" placeholder="Min. 8 karakter" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                          {state.errors?.password && <span className="text-error text-label-sm">{state.errors.password[0]}</span>}
                        </div>
                      </div>
                    </section>

                    <section className={step !== 2 ? "hidden" : ""}>
                      <div className="mb-xl">
                        <h2 className="text-headline-lg text-primary mb-2">Verifikasi Dokumen</h2>
                        <p className="text-on-surface-variant text-body-md">Unggah dokumen resmi Anda secara aman untuk verifikasi. Format: JPG, PNG, atau PDF (Maks 5MB).</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                        <div className={`flex flex-col items-center justify-center p-xl border-2 ${files.ktp ? "border-primary bg-primary/5" : "border-dashed border-outline-variant"} rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden`}>
                          <input aria-label="Upload KTP" className="absolute inset-0 opacity-0 cursor-pointer" name="ktp" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, ktp: e.target.files?.[0] ? { name: e.target.files[0].name } : null }))} />
                          {files.ktp ? (
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                              <Upload className="text-primary w-8 h-8" />
                              <span className="text-label-sm text-primary font-bold text-center truncate max-w-full">{files.ktp.name}</span>
                            </div>
                          ) : (
                            <>
                              <Badge className="text-primary-container w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                              <span className="text-headline-md text-on-surface mb-1">KTP</span>
                              <span className="text-label-sm text-on-surface-variant text-center">KTP (Wajib)</span>
                            </>
                          )}
                        </div>
                        <div className={`flex flex-col items-center justify-center p-xl border-2 ${files.kartuKeluarga ? "border-primary bg-primary/5" : "border-dashed border-outline-variant"} rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden`}>
                          <input aria-label="Upload Kartu Keluarga" className="absolute inset-0 opacity-0 cursor-pointer" name="kartuKeluarga" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, kartuKeluarga: e.target.files?.[0] ? { name: e.target.files[0].name } : null }))} />
                          {files.kartuKeluarga ? (
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                              <Upload className="text-primary w-8 h-8" />
                              <span className="text-label-sm text-primary font-bold text-center truncate max-w-full">{files.kartuKeluarga.name}</span>
                            </div>
                          ) : (
                            <>
                              <Group className="text-primary-container w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                              <span className="text-headline-md text-on-surface mb-1">Kartu Keluarga</span>
                              <span className="text-label-sm text-on-surface-variant text-center">Kartu Keluarga (Wajib)</span>
                            </>
                          )}
                        </div>
                        <div className={`flex flex-col items-center justify-center p-xl border-2 ${files.izinUsaha ? "border-primary bg-primary/5" : "border-dashed border-outline-variant"} rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden`}>
                          <input aria-label="Upload Izin Usaha" className="absolute inset-0 opacity-0 cursor-pointer" name="izinUsaha" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setFiles((prev) => ({ ...prev, izinUsaha: e.target.files?.[0] ? { name: e.target.files[0].name } : null }))} />
                          {files.izinUsaha ? (
                            <div className="flex flex-col items-center gap-2 pointer-events-none">
                              <Upload className="text-primary w-8 h-8" />
                              <span className="text-label-sm text-primary font-bold text-center truncate max-w-full">{files.izinUsaha.name}</span>
                            </div>
                          ) : (
                            <>
                              <FileText className="text-on-surface-variant w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                              <span className="text-headline-md text-on-surface mb-1">Izin Usaha</span>
                              <span className="text-label-sm text-on-surface-variant text-center italic">Opsional</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-xl p-lg bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-lg">
                        <div className="w-16 h-16 rounded bg-surface-container-highest overflow-hidden flex items-center justify-center">
                          <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-label-md font-bold text-on-surface">Pastikan dokumen terbaca jelas</p>
                          <p className="text-label-sm text-on-surface-variant">Dokumen buram atau terpotong akan memperlambat proses persetujuan.</p>
                        </div>
                      </div>
                    </section>

                    <section className={step !== 3 ? "hidden" : ""}>
                      <div className="mb-xl">
                        <h2 className="text-headline-lg text-primary mb-2">Persetujuan Akhir</h2>
                        <p className="text-on-surface-variant text-body-md">Tinjau ketentuan kami dan berikan persetujuan untuk menyelesaikan pendaftaran penjual.</p>
                      </div>
                      <div className="space-y-lg">
                        <div className="p-lg bg-surface-container rounded-xl">
                          <h3 className="text-headline-md text-on-surface mb-lg">Perjanjian Privasi Data</h3>
                          <div className="max-h-48 overflow-y-auto text-label-md text-on-surface-variant pr-lg">
                            <p className="mb-4">M2A Co-Biz berkomitmen melindungi data pribadi Anda. Dengan melanjutkan, Anda menyetujui bahwa kami dapat mengumpulkan, menyimpan, dan memproses informasi bisnis Anda semata-mata untuk tujuan mengelola hub penjual dan menyediakan layanan komunitas keuangan.</p>
                            <p className="mb-4">Kami tidak membagikan data sensitif Anda kepada pemasar pihak ketiga. Semua unggahan dokumen dienkripsi dan disimpan di lingkungan cloud aman yang sesuai dengan standar privasi regional.</p>
                            <p>Informasi toko Anda akan terlihat oleh anggota komunitas dalam ekosistem M2A untuk memfasilitasi transaksi dan jaringan bisnis.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-md pt-4">
                          <div className="flex h-6 items-center">
                            <input className="h-5 w-5 rounded border-outline text-primary focus:ring-primary cursor-pointer transition-all" id="consent" name="consent" type="checkbox" />
                          </div>
                          <div className="text-body-md">
                            <label className="font-medium text-on-surface" htmlFor="consent">Dengan ini saya menyatakan bahwa semua informasi yang diberikan adalah benar dan saya menyetujui{" "}<a className="text-primary underline" href="/terms">Ketentuan Layanan</a>{" "}dan{" "}<a className="text-primary underline" href="/privacy">Kebijakan Privasi</a>.</label>
                          </div>
                        </div>
                        {state.errors?.consent && <span className="text-error text-label-sm ml-xl">{state.errors.consent[0]}</span>}
                      </div>
                      <div className="mt-xxl grid grid-cols-1 md:grid-cols-2 gap-lg">
                        <div className="flex items-center gap-md p-lg bg-secondary-container/30 rounded-xl">
                          <ShieldCheck className="w-6 h-6 text-secondary" />
                          <div>
                            <p className="text-label-md font-bold text-on-secondary-container">Terpercaya</p>
                            <p className="text-label-sm text-on-secondary-container/80">Diamankan dengan enkripsi tingkat enterprise.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-md p-lg bg-tertiary-container/10 rounded-xl">
                          <LifeBuoy className="w-6 h-6 text-tertiary" />
                          <div>
                            <p className="text-label-md font-bold text-on-tertiary-fixed-variant">Tinjauan Tim</p>
                            <p className="text-label-sm text-on-tertiary-fixed-variant/80">Tim kami meninjau pendaftaran dalam 48 jam.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="flex items-center justify-between pt-xl border-t border-outline-variant mt-xxl">
                      <button className={`px-xl py-lg rounded-lg text-label-md text-primary hover:bg-primary/5 transition-all flex items-center gap-2 ${step === 1 ? "invisible" : ""}`} onClick={prevStep} type="button">
                        <ArrowLeft className="w-[20px] h-[20px]" /> Kembali
                      </button>
                      <div className="flex-grow" />
                      {step < totalSteps ? (
                        <button className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all flex items-center gap-2" onClick={nextStep} type="button">
                          Langkah Berikutnya <ArrowRight className="w-[20px] h-[20px]" />
                        </button>
                      ) : (
                        <button className="px-xl py-lg bg-accent-gold text-white rounded-lg text-label-md shadow-lg hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2" disabled={pending} type="submit">
                          {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                          {pending ? "Mengirim..." : "Kirim Pendaftaran"}
                          {!pending && <ArrowRight className="w-[20px] h-[20px]" />}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </form>

              <footer className="mt-xl text-center text-on-surface-variant/60 text-label-sm">
                &copy; 2024 M2A Co-Biz. Hak cipta dilindungi. Pusat Bisnis Profesional.
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )

}
