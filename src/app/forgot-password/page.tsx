"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Loader2, CheckCircle, ArrowLeft, Mail } from "lucide-react"
import { requestPasswordReset, type ForgotState } from "./actions"
import { Logo } from "@/components/logo"

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, {})

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-clay-bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6"><Logo size="md" /></div>
        <div className="clay-lg p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/login" className="inline-flex items-center gap-1 text-xs btn-clay-outline !px-3 !py-1.5" aria-label="Kembali ke login">
              <ArrowLeft className="w-3.5 h-3.5" /> Masuk
            </Link>
          </div>
          <h1 className="text-xl font-extrabold mt-4 mb-1" style={{ color: "var(--color-primary)" }}>Lupa Kata Sandi</h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
            Masukkan email terdaftar Anda. Kami akan mengirim tautan untuk mengatur ulang kata sandi.
          </p>

          {state.success ? (
            <div className="clay-sm p-4 flex items-start gap-3" style={{ border: "1px solid var(--color-success)" }}>
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <p className="text-sm text-success font-semibold">{state.message}</p>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="email">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-outline)" }} />
                  <input id="email" name="email" type="email" required placeholder="nama@email.com" className="clay-input w-full pl-10 pr-4 py-3 text-sm font-inter" />
                </div>
              </div>
              {state.message && !state.success && <p className="text-error text-sm font-inter">{state.message}</p>}
              <button type="submit" disabled={pending} className="btn-clay w-full justify-center py-3">
                {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {pending ? "Mengirim..." : "Kirim Tautan Reset"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
