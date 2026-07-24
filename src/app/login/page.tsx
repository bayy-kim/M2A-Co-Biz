"use client"

import { useState, useRef, useActionState, type KeyboardEvent } from "react"
import { Lock, Mail, Key, ArrowRight, ArrowLeft, ShieldCheck, Verified, HelpCircle, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPending(true)

    const result = await signIn("credentials", {
      email: emailRef.current?.value,
      password: passwordRef.current?.value,
      redirect: false,
    })

    setPending(false)

    if (result?.error) {
      setError("Invalid email or password")
      return
    }

    if (result?.ok) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-gutter bg-surface">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        <div className="mb-xxl text-center">
          <div className="w-20 h-20 mx-auto mb-lg rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-display-md font-bold text-primary">M</span>
          </div>
          <h1 className="text-display-md text-primary mb-xs">M2A Co-Biz</h1>
          <p className="text-body-md text-on-surface-variant">The Business Community Hub</p>
        </div>

        <div className="w-full bg-surface-container-lowest shadow-[0_10px_40px_-10px_rgba(15,92,92,0.1)] rounded-xl border border-outline-variant/30 p-xxl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />

          {step === 1 ? (
            <div>
              <div className="flex items-center gap-sm mb-xl">
                <Lock className="text-primary w-6 h-6" />
                <h2 className="text-headline-md text-on-surface">Secure Sign In</h2>
              </div>
              {error && (
                <div className="mb-lg p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{error}</div>
              )}
              <form className="space-y-xl" onSubmit={handleLogin}>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input ref={emailRef} className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" id="email" placeholder="name@business.com" required type="email" />
                  </div>
                </div>
                <div className="space-y-xs">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                    <Link className="text-label-sm text-primary hover:underline" href="#">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input ref={passwordRef} className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-md" id="password" placeholder="••••••••" required type="password" />
                  </div>
                </div>
                <button className="w-full py-3.5 bg-primary-container text-on-primary-container rounded-lg text-headline-md shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50" disabled={pending} type="submit">
                  {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {pending ? "Signing in..." : "Continue"}
                  {!pending && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <button className="mb-lg flex items-center text-primary text-label-md" onClick={() => setStep(1)} type="button">
                <ArrowLeft className="w-[18px] h-[18px]" />
                <span>Back to login</span>
              </button>
              <div className="flex items-center gap-sm mb-lg">
                <ShieldCheck className="text-primary w-6 h-6" />
                <h2 className="text-headline-md text-on-surface">Staff Verification</h2>
              </div>
              <p className="text-body-md text-on-surface-variant mb-xl">A security code has been sent to your registered device. Please enter the 6-digit code below to verify your identity.</p>
              <form className="space-y-xl">
                <div className="flex justify-between gap-sm">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el }}
                      className="w-12 h-14 text-center rounded-lg border border-outline-variant bg-surface-bright text-display-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      maxLength={1} required type="text" inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-md">
                  <button className="w-full py-3.5 bg-accent-gold text-on-primary-fixed text-headline-md rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-sm">
                    Verify & Enter
                    <Verified className="w-5 h-5" />
                  </button>
                  <button className="text-label-md text-on-surface-variant hover:text-primary py-2 transition-colors" type="button">
                    Didn&apos;t receive a code? <span className="font-bold">Resend</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="mt-xl flex flex-wrap justify-center gap-xl">
          <Link className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#"><HelpCircle className="w-[16px] h-[16px]" /> Support Hub</Link>
          <Link className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#"><FileText className="w-[16px] h-[16px]" /> Privacy Policy</Link>
          <Link className="text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#"><FileText className="w-[16px] h-[16px]" /> Terms</Link>
        </div>

        <div className="mt-xxl flex items-center gap-sm px-4 py-2 bg-on-primary-fixed-variant/5 rounded-full border border-outline-variant/20">
          <Verified className="text-primary w-5 h-5" />
          <span className="text-label-sm text-on-surface-variant">Enterprise Grade Security Encryption</span>
        </div>
      </div>
    </div>
  )
}
