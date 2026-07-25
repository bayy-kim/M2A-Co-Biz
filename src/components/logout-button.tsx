"use client"

import { signOut } from "next-auth/react"
import { LogOut, Loader2 } from "lucide-react"
import { useState } from "react"

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  return (
    <button
      onClick={async () => {
        setLoading(true)
        await signOut({ callbackUrl: "/login" })
      }}
      disabled={loading}
      className="flex items-center gap-2 px-md py-2.5 rounded-lg text-label-md text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors w-full disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      {loading ? "Keluar..." : "Keluar"}
    </button>
  )
}
