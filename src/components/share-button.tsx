"use client"

import { Share2 } from "lucide-react"
import { useState } from "react"

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement("input")
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-12 h-12 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary active:scale-[0.95] transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-primary"
      aria-label={copied ? "Tersalin" : "Bagikan tautan"}
    >
      {copied ? (
        <span className="text-label-sm text-success font-bold">OK</span>
      ) : (
        <Share2 className="w-5 h-5" />
      )}
    </button>
  )
}
