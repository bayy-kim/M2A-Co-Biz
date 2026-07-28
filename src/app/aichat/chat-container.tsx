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
    <div className="min-h-screen bg-background flex flex-col pt-16 pb-24 md:pb-8 px-gutter">
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-xs h-16 flex items-center justify-between px-lg border-b border-outline-variant/30">
        <div className="flex items-center gap-md">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-label-sm font-bold text-on-surface hover:bg-surface-container hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px]"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <Logo size="sm" />
        </div>
        <div className="flex items-center gap-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full text-label-sm font-bold">
          <Sparkles className="w-4 h-4 text-accent-gold animate-pulse" />
          <span>Gemini AI Assistant</span>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full flex flex-col mt-lg relative pb-20">
        {/* Chat Messages Display */}
        <div className="flex-grow overflow-y-auto space-y-lg py-md pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-xxl my-auto space-y-xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shadow-lg">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-display-md text-primary font-bold tracking-tight">Tanya Asisten M2A Co-Biz</h1>
                <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
                  Selamat datang! Saya adalah asisten kecerdasan buatan Al-Mubarok II yang siap membantu kebutuhan informasi usaha Anda.
                </p>
              </div>

              {/* Starter chips */}
              <div className="w-full space-y-md pt-lg">
                <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-center gap-1">
                  <HelpCircle className="w-4 h-4 text-primary" /> Pilih Pertanyaan Cepat:
                </p>
                <div className="flex flex-col gap-sm max-w-md mx-auto">
                  {starterQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStarterClick(q.text)}
                      className="w-full text-left p-lg bg-surface-container-lowest border border-outline-variant/30 hover:border-primary hover:bg-primary/5 rounded-2xl text-body-md text-on-surface transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer"
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
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] gap-xs">
                    <div className="text-label-sm text-on-surface-variant px-1 font-semibold">
                      {m.role === "user" ? "Anda" : "Asisten AI"}
                    </div>
                    <div
                      className={`p-lg rounded-2xl border text-body-md leading-relaxed whitespace-pre-line shadow-xs ${
                        m.role === "user"
                          ? "bg-primary text-on-primary border-primary/20 rounded-tr-none"
                          : "bg-surface-container-lowest text-on-surface border-outline-variant/20 rounded-tl-none"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="w-9 h-9 rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0 border border-accent-gold/20 shadow-xs">
                      <User className="w-5 h-5 text-accent-gold" />
                    </div>
                  )}
                </div>
              ))}

              {/* Status Loading saat AI beraksi */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-md justify-start items-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 p-lg bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 rounded-2xl rounded-tl-none shadow-xs text-body-md">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Menganalisis data katalog...</span>
                  </div>
                </div>
              )}

              {/* Error fallback & Graceful Downgrade to WhatsApp/Email */}
              {error && (
                <div className="p-xl bg-surface-container-lowest border border-rose-500/30 rounded-2xl shadow-lg space-y-lg animate-slide-in">
                  <div className="flex items-start gap-md">
                    <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 shrink-0">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-headline-md text-primary font-bold">Kapasitas Asisten AI Penuh</h4>
                      <p className="text-body-md text-on-surface-variant mt-1">
                        Mohon maaf, saat ini asisten AI kami sedang melayani kapasitas maksimal. Jangan khawatir, Anda dapat melanjutkan konsultasi langsung bersama tim kami.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-md pt-2">
                    <a
                      href="https://wa.me/6285217126862?text=Halo%20Admin%20M2A%20Co-Biz,%20saya%20ingin%20berkonsultasi%20mengenai%20layanan%20usaha%20atau%20pembelian."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-lg bg-emerald-600 text-white rounded-xl text-label-md font-bold shadow-md hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Bot className="w-5 h-5" />
                      Lanjut via WhatsApp
                    </a>
                    
                    <a
                      href="mailto:muhamadaibayu@gmail.com?subject=Konsultasi%20Bisnis%20M2A%20Co-Biz"
                      className="flex-1 py-3 px-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant rounded-xl text-label-md font-bold hover:bg-surface-container-high active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
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
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-background via-background to-transparent pt-lg pb-md md:pb-xl px-gutter z-40">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(e)
            }}
            className="max-w-3xl mx-auto w-full"
          >
            <div className="relative flex items-center shadow-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
              <input
                className="w-full bg-transparent pl-5 pr-14 py-4 text-body-md focus:outline-none placeholder-outline"
                placeholder="Tulis pertanyaan Anda di sini..."
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                disabled={isLoading || !input.trim()}
                type="submit"
                className="absolute right-2 px-3.5 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary-container hover:text-primary active:scale-95 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
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
