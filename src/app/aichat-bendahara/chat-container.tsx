"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { ArrowLeft, Send, Sparkles, User, Bot, HelpCircle, Loader2, TrendingUp, Wallet, Clock, Percent } from "lucide-react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"

export function ChatContainerBendahara() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading, error } = useChat({
    api: "/api/chat-bendahara",
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const starterQuestions = [
    {
      icon: TrendingUp,
      label: "💰 Ringkasan Keuangan",
      text: "Tolong ringkaskan kondisi keuangan M2A Co-Biz saat ini — total pemasukan, pengeluaran/komisi, profit bersih, jumlah seller aktif, dan produk yang tersedia.",
    },
    {
      icon: Clock,
      label: "⏳ Pembayaran Tertunda",
      text: "Berapa banyak pesanan yang masih pending pembayaran? Tolong tampilkan daftar pembeli yang belum upload bukti transfer.",
    },
    {
      icon: Wallet,
      label: "📋 Pencairan Seller",
      text: "Tolong cek apakah ada pengajuan pencairan dana dari seller yang masih pending? Tampilkan nama seller dan jumlahnya.",
    },
    {
      icon: Percent,
      label: "📊 Laporan Komisi",
      text: "Tolong tampilkan laporan komisi — total komisi terkumpul, aturan global, jumlah aturan per kategori, dan per seller.",
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
        <div className="flex items-center gap-sm bg-emerald-600/10 text-emerald-700 px-3 py-1.5 rounded-full text-label-sm font-bold">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Asisten Bendahara</span>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full flex flex-col mt-lg relative pb-20">
        <div className="flex-grow overflow-y-auto space-y-lg py-md pr-1">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-xxl my-auto space-y-xl">
              <div className="w-16 h-16 rounded-full bg-emerald-600/10 flex items-center justify-center shadow-lg">
                <Wallet className="w-8 h-8 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-display-md text-primary font-bold tracking-tight">Asisten Bendahara M2A</h1>
                <p className="text-body-md text-on-surface-variant mt-2 max-w-md mx-auto">
                  Hai Bendahara! Saya siap bantu Anda memantau arus keuangan, mengecek pembayaran, dan mengelola pencairan dana dengan cepat dan mudah.
                </p>
              </div>

              <div className="w-full space-y-md pt-lg">
                <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-center gap-1">
                  <HelpCircle className="w-4 h-4 text-emerald-700" /> Pertanyaan Cepat:
                </p>
                <div className="flex flex-col gap-sm max-w-md mx-auto">
                  {starterQuestions.map((q, idx) => {
                    const Icon = q.icon
                    return (
                      <button
                        key={idx}
                        onClick={() => handleStarterClick(q.text)}
                        className="w-full text-left p-lg bg-surface-container-lowest border border-outline-variant/30 hover:border-emerald-600 hover:bg-emerald-50/30 rounded-2xl text-body-md text-on-surface transition-all duration-200 active:scale-[0.98] shadow-xs cursor-pointer flex items-center gap-3"
                      >
                        <Icon className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>{q.label}</span>
                      </button>
                    )
                  })}
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
                    <div className="w-9 h-9 rounded-full bg-emerald-600/10 flex items-center justify-center shrink-0 border border-emerald-600/20 shadow-xs">
                      <Bot className="w-5 h-5 text-emerald-700" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] gap-xs">
                    <div className="text-label-sm text-on-surface-variant px-1 font-semibold">
                      {m.role === "user" ? "Anda" : "Asisten Bendahara"}
                    </div>
                    <div
                      className={`p-lg rounded-2xl border text-body-md leading-relaxed whitespace-pre-line shadow-xs ${
                        m.role === "user"
                          ? "bg-emerald-700 text-white border-emerald-700/20 rounded-tr-none"
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

              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-md justify-start items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-600/10 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex items-center gap-2 p-lg bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 rounded-2xl rounded-tl-none shadow-xs text-body-md">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                    <span>Mengakses data keuangan...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-lg bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-2xl text-body-md text-center">
                  Gagal memproses permintaan. Silakan coba lagi.
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

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
                placeholder="Tanya soal keuangan, pembayaran, pencairan..."
                type="text"
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button
                disabled={isLoading || !input.trim()}
                type="submit"
                className="absolute right-2 px-3.5 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 active:scale-95 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                aria-label="Kirim"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
