"use client"

import { useState, useRef, type KeyboardEvent, FormEvent, Suspense, useEffect } from "react"
import { Lock, Mail, Key, ArrowRight, ArrowLeft, ShieldCheck, Verified, HelpCircle, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")
  
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (urlError === "OAuthAccountNotLinked") {
      setError("Akun email ini sudah terdaftar. Silakan masuk menggunakan Email dan Kata Sandi.")
    } else if (urlError === "AccessDenied") {
      setError("Akses ditolak. Staf Admin dan Bendahara wajib masuk menggunakan Email, Kata Sandi, dan kode keamanan 2FA.")
    } else if (urlError === "Configuration") {
      setError("Terjadi kesalahan konfigurasi server login. Silakan hubungi admin.")
    } else if (urlError) {
      setError("Terjadi kesalahan sistem saat mencoba masuk dengan Google. Silakan coba kembali.")
    }
  }, [urlError])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value.replace(/[^0-9]/g, "")
    setCode(newCode)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setPending(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setPending(false)

    if (result?.error) {
      const res = await fetch("/api/auth/can-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.totp) {
        setStep(2)
      } else {
        setError("Email atau kata sandi salah")
      }
      return
    }

    if (result?.ok) {
      router.push("/")
      router.refresh()
    }
  }

  const handleTotpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setPending(true)

    const totp = code.join("")
    if (totp.length !== 6) {
      setError("Masukkan kode 6 digit yang lengkap")
      setPending(false)
      return
    }

    const result = await signIn("credentials", {
      email,
      password,
      totp,
      redirect: false,
    })

    setPending(false)

    if (result?.error) {
      setError("Kode verifikasi salah. Silakan coba lagi.")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      return
    }

    if (result?.ok) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-gutter relative" style={{ background: 'var(--color-clay-bg)' }}>
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-md font-bold text-on-surface hover:bg-surface-container hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>

      <div className="w-full max-w-[440px] flex flex-col items-center mt-12 sm:mt-0">
        <div className="mb-xxl text-center flex justify-center">
          <Logo size="lg" showSubtitle subtitleText="Pusat Komunitas Bisnis" />
        </div>

        <div className="w-full clay-lg p-xxl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />

          {step === 1 ? (
            <div>
              <div className="flex items-center gap-sm mb-xl">
                <Lock className="text-primary w-6 h-6" />
                <h2 className="text-headline-md text-on-surface">Masuk dengan Aman</h2>
              </div>
              {error && (
                <div className="mb-lg p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{error}</div>
              )}
              <form className="space-y-xl" onSubmit={handleLogin}>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant px-1" htmlFor="email">Alamat Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input
                      className="clay-input w-full pl-10"
                      id="email"
                      placeholder="name@business.com"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-xs">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-label-md text-on-surface-variant" htmlFor="password">Kata Sandi</label>
                    <a className="text-label-sm text-primary hover:underline" href="https://wa.me/6281234567890?text=Halo%20Admin%20M2A%20Co-Biz,%20saya%20butuh%20bantuan%20reset%20kata%20sandi" target="_blank" rel="noopener noreferrer">Lupa kata sandi?</a>
                  </div>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input
                      className="clay-input w-full pl-10"
                      id="password"
                      placeholder="••••••••"
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button className="btn-clay w-full" disabled={pending} type="submit">
                  {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {pending ? "Masuk..." : "Lanjutkan"}
                  {!pending && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              <div className="relative my-lg">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/30"></div>
                </div>
                <div className="relative flex justify-center text-label-sm uppercase">
                  <span className="bg-surface-container-lowest px-2 text-on-surface-variant">Atau masuk dengan</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPending(true)
                  signIn("google")
                }}
                disabled={pending}
                className="btn-clay-outline w-full"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Masuk dengan Google
              </button>
            </div>
          ) : (
            <div>
              <button className="mb-lg flex items-center text-primary text-label-md" onClick={() => setStep(1)} type="button">
                <ArrowLeft className="w-[18px] h-[18px]" />
                <span>Kembali ke login</span>
              </button>
              <div className="flex items-center gap-sm mb-lg">
                <ShieldCheck className="text-primary w-6 h-6" />
                <h2 className="text-headline-md text-on-surface">Verifikasi Staf</h2>
              </div>
              <p className="text-body-md text-on-surface-variant mb-xl">Kode keamanan telah dikirim ke perangkat terdaftar Anda. Masukkan kode 6 digit di bawah untuk memverifikasi identitas Anda.</p>
              {error && (
                <div className="mb-lg p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{error}</div>
              )}
              <form className="space-y-xl" onSubmit={handleTotpSubmit}>
                <div className="flex justify-between gap-1 sm:gap-sm">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el }}
                      className="clay-inset w-10 h-12 sm:w-12 sm:h-14 text-center text-headline-lg sm:text-display-md flex-1 min-w-0"
                      maxLength={1} required type="text" inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-md">
                  <button className="btn-clay-gold w-full" disabled={pending} type="submit">
                    {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {pending ? "Memverifikasi..." : "Verifikasi & Masuk"}
                    {!pending && <Verified className="w-5 h-5" />}
                  </button>
                  <p className="text-label-sm text-center text-on-surface-variant py-2">
                    Kode 6 digit selalu diperbarui otomatis di aplikasi <span className="font-bold text-primary">Authenticator</span> HP Anda.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="mt-xl flex flex-wrap justify-center gap-xl">
          <a className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="https://wa.me/6281234567890?text=Halo%20Admin%20M2A%20Co-Biz,%20saya%20butuh%20bantuan" target="_blank" rel="noopener noreferrer"><HelpCircle className="w-[16px] h-[16px]" /> Pusat Bantuan</a>
          <Link className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="/privacy"><FileText className="w-[16px] h-[16px]" /> Kebijakan Privasi</Link>
          <Link className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="/terms"><FileText className="w-[16px] h-[16px]" /> Ketentuan</Link>
        </div>

        <div className="mt-xxl flex items-center gap-sm px-4 py-2 clay-pill">
          <Verified className="text-primary w-5 h-5" />
          <span className="text-label-sm text-on-surface-variant">Enkripsi Keamanan Enterprise</span>
        </div>
      </div>
    </div>
  )
}
