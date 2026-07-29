"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { ArrowLeft, Send, Sparkles, User, Bot, HelpCircle, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { motion, AnimatePresence } from "framer-motion"

export function ChatContainer() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, error, reload } = useChat({
    api: "/api/chat",
  })

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const starterQuestions = [
    {
      label: "📈 Barang & Jasa Terlaris",
      text: "Apa saja barang atau jasa yang paling laris/populer di katalog M2A Co-Biz saat ini? Tolong sebutkan juga nama tokonya.",
    },
    {
      label: "💡 Konsultasi Ide Bisnis & UMKM",
      text: "Saya ingin memulai usaha kecil/UMKM di daerah Banjarwaringin tetapi bingung jualan apa. Bisa berikan beberapa rekomendasi ide bisnis yang cocok dan cara memasarkannya?",
    },
    {
      label: "🏪 Cara Daftar Jadi Penjual",
      text: "Bagaimana cara mendaftar sebagai penjual (Seller) di platform M2A Co-Biz dan apa saja berkas yang harus saya siapkan?",
    },
  ]

  const handleStarterClick = (text: string) => {
    setInput(text)
  }

  return (
    <div className="min-h-screen flex flex-col pt-16 pb-24 md:pb-8 px-gutter" style={{background:"var(--color-clay-bg)"}}>
      <header className="fixed top-0 left-0 w-full z-50 clay-pill mx-4 mt-3 px-4 py-2.5 flex items-center justify-between max-w-4xl lg:mx-auto" style={{boxShadow:"var(--shadow-clay-md)",width:"auto",left:0,right:0}}>
        <div className="flex items-center gap-md">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] btn-clay-outline text-xs min-h-[44px]"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-sm chip-clay gold text-xs">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Gemini AI</span>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full flex flex-col mt-lg relative pb-20">
        {/* Chat Messages Display */}
        <div className="flex-grow overflow-y-auto space-y-lg py-md pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-xxl my-auto space-y-xl">
              <div className="w-16 h-16 rounded-full clay flex items-center justify-center" style={{boxShadow:"var(--shadow-clay-md)"}}>
                <Bot className="w-8 h-8" style={{color:"var(--color-primary)"}} />
              </div>
              <div>
                <h1 className="text-display-md font-bold tracking-tight" style={{color:"var(--color-primary)"}}>Tanya Asisten M2A Co-Biz</h1>
                <p className="text-body-md mt-2 max-w-md mx-auto" style={{color:"var(--color-on-surface-variant)"}}>
                  Selamat datang! Saya adalah asisten kecerdasan buatan Al-Mubarok II yang siap membantu kebutuhan informasi usaha Anda.
                </p>
              </div>

              {/* Starter chips */}
              <div className="w-full space-y-md pt-lg">
                <p className="text-label-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1" style={{color:"var(--color-on-surface-variant)"}}>
                  <HelpCircle className="w-4 h-4" style={{color:"var(--color-primary)"}} /> Pilih Pertanyaan Cepat:
                </p>
                <div className="flex flex-col gap-sm max-w-md mx-auto">
                  {starterQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStarterClick(q.text)}
                      className="w-full text-left clay-sm px-5 py-4 text-body-md transition-all active:scale-[0.98] cursor-pointer font-medium"
                      style={{color:"var(--color-on-surface)"}}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-xl">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-md max-w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role !== "user" && (
                    <div className="w-9 h-9 rounded-full clay-sm flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" style={{color:"var(--color-primary)"}} />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] gap-xs">
                    <div className="text-label-sm px-1 font-semibold" style={{color:"var(--color-on-surface-variant)"}}>
                      {m.role === "user" ? "Anda" : "Asisten AI"}
                    </div>
                    <div
                      className={`p-lg rounded-2xl text-body-md leading-relaxed whitespace-pre-line ${
                        m.role === "user"
                          ? "btn-clay text-left rounded-tr-none"
                          : "clay-sm rounded-tl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="w-9 h-9 rounded-full clay-sm flex items-center justify-center shrink-0" style={{background:"var(--color-accent-gold)",color:"#1A150E"}}>
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Status Loading saat AI beraksi */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-md justify-start items-center">
                  <div className="w-9 h-9 rounded-full clay-sm flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-5 h-5" style={{color:"var(--color-primary)"}} />
                  </div>
                  <div className="flex items-center gap-2 clay-sm px-5 py-4 rounded-2xl rounded-tl-none text-body-md">
                    <Loader2 className="w-4 h-4 animate-spin" style={{color:"var(--color-primary)"}} />
                    <span style={{color:"var(--color-on-surface-variant)"}}>Menganalisis data katalog...</span>
                  </div>
                </div>
              )}

              {/* Error fallback */}
              {error && (
                <div className="clay-lg p-6 space-y-lg animate-slide-in" style={{border:"2px solid var(--color-error)"}}>
                  <div className="flex items-start gap-md">
                    <div className="p-3 rounded-xl shrink-0" style={{background:"var(--color-error)",color:"white"}}>
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-headline-md font-bold" style={{color:"var(--color-primary)"}}>Kapasitas Asisten AI Penuh</h4>
                      <p className="text-body-md mt-1" style={{color:"var(--color-on-surface-variant)"}}>
                        Mohon maaf, saat ini asisten AI kami sedang melayani kapasitas maksimal. Jangan khawatir, Anda dapat melanjutkan konsultasi langsung bersama tim kami.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-md pt-2">
                    <a
                      href="https://wa.me/6285217126862?text=Halo%20Admin%20M2A%20Co-Biz,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20usaha%20atau%20pembelian."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-clay text-sm justify-center min-h-[44px]"
                    >
                      Lanjut via WhatsApp
                    </a>
                    
                    <a
                      href="mailto:muhamadaibayu@gmail.com?subject=Konsultasi%20Bisnis%20M2A%20Co-Biz"
                      className="flex-1 btn-clay-outline text-sm justify-center min-h-[44px]"
                    >
                      Hubungi via Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Section */}
        <div className="fixed bottom-0 left-0 w-full pt-lg pb-md md:pb-xl px-gutter z-40" style={{background:"linear-gradient(to top, var(--color-clay-bg), transparent)"}}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(e)
            }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="clay-pill flex items-center px-2 py-1.5" style={{boxShadow:"var(--shadow-clay-md)"}}>
              <input
                className="w-full bg-transparent pl-4 pr-3 py-3 text-body-md focus:outline-none font-inter"
                placeholder="Tulis pertanyaan Anda di sini..."
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                style={{color:"var(--color-on-surface)"}}
              />
              <button
                disabled={isLoading || !input.trim()}
                type="submit"
                className="btn-clay rounded-full px-4 py-2.5 text-sm min-h-[44px] min-w-[44px] disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Kirim pesan"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
