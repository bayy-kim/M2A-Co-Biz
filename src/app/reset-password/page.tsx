"use client"

import { useActionState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, CheckCircle, KeyRound, ArrowLeft } from "lucide-react"
import { resetPassword, type ResetState } from "./actions"
import { Logo } from "@/components/logo"

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {})

  return (
    <div className="clay-lg p-6 md:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/login" className="inline-flex items-center gap-1 text-xs btn-clay-outline !px-3 !py-1.5" aria-label="Kembali ke login">
          <ArrowLeft className="w-3.5 h-3.5" /> Masuk
        </Link>
      </div>
      <h1 className="text-xl font-extrabold mt-4 mb-1" style={{ color: "var(--color-primary)" }}>Atur Ulang Kata Sandi</h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-on-surface-variant)" }}>
        Masukkan kata sandi baru Anda (minimal 8 karakter).
      </p>

      {state.success ? (
        <div className="clay-sm p-4 flex items-start gap-3" style={{ border: "1px solid var(--color-success)" }}>
          <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-success font-semibold">{state.message}</p>
            <Link href="/login" className="btn-clay text-sm mt-3 inline-flex">Ke Halaman Masuk</Link>
          </div>
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="text-sm font-medium mb-1.5 block" htmlFor="password">Kata Sandi Baru</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-outline)" }} />
              <input id="password" name="password" type="password" required minLength={8} placeholder="Min. 8 karakter" className="clay-input w-full pl-10 pr-4 py-3 text-sm font-inter" />
            </div>
          </div>
          {!token && <p className="text-error text-sm font-inter">Tautan tidak valid. Mintalah tautan baru.</p>}
          {state.message && !state.success && <p className="text-error text-sm font-inter">{state.message}</p>}
          {token && (
            <button type="submit" disabled={pending} className="btn-clay w-full justify-center py-3">
              {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {pending ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            </button>
          )}
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-clay-bg)" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6"><Logo size="md" /></div>
        <Suspense fallback={<div className="clay-lg p-8" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
