"use client"

import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Runtime error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-gutter">
      <div className="w-full max-w-md mx-auto text-center space-y-lg">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-error/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-error" />
        </div>
        <h1 className="text-headline-lg sm:text-display-md text-on-surface font-bold">
          Terjadi Kesalahan
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau kembali ke beranda.
        </p>
        {error.digest && (
          <p className="text-label-sm text-outline">
            Kode error: <code className="font-mono bg-surface-container-high px-2 py-0.5 rounded">{error.digest}</code>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white rounded-xl text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-md focus-visible:outline-2 focus-visible:outline-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 border border-outline-variant text-on-surface rounded-xl text-label-md font-bold hover:bg-surface-container-higher active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
