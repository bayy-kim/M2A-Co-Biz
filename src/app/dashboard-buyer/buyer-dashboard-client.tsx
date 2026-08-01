"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {
  Package, ShoppingBag, Store, LogOut, HelpCircle, X, ChevronRight, Clock, CheckCircle,
  XCircle, ArrowUpRight, Loader2, Sparkles, RefreshCw, Truck, Check, Wallet, Star, ShoppingCart, Upload,
  User as UserIcon,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Logo } from "@/components/logo"
import { PublicBottomBar } from "@/components/public-bottom-bar"
import { NotificationBell } from "@/components/notification-bell"
import { requestBecomeSeller, cancelSellerRequest, type BecomeSellerState } from "./actions"
import { formatRupiah } from "@/lib/utils"

type OrderItem = { qty: number; priceRupiah: number; title: string; image: string | null }
type RecentOrder = {
  id: string; totalRupiah: number; paymentMethod: string; paymentStatus: string
  fulfillmentStatus: string; createdAt: string; items: OrderItem[]
}
type RecommendedProduct = {
  id: string; title: string; priceRupiah: number; image: string | null
  businessName: string; categoryName: string
}

interface Props {
  user: any
  stats: { totalSpent: number; activeOrders: number; pendingPayments: number; totalReviews: number }
  recentOrders: RecentOrder[]
  recommendedProducts: RecommendedProduct[]
  sellerStatus: string | null
}

const paymentLabel: Record<string, string> = {
  PENDING: "Menunggu Pembayaran", PAID: "Lunas", FAILED: "Gagal", EXPIRED: "Kedaluwarsa",
}
const fulfillmentLabel: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi", PROCESSING: "Sedang Diproses", IN_TRANSIT: "Dalam Pengiriman", COMPLETED: "Selesai", CANCELLED: "Dibatalkan",
}
const fulfillmentColor: Record<string, string> = {
  PENDING: "!bg-warning/10 !text-warning", PROCESSING: "!bg-primary/10 !text-primary",
  IN_TRANSIT: "!bg-accent-gold/10 !text-accent-gold", COMPLETED: "!bg-success/10 !text-success", CANCELLED: "!bg-error/10 !text-error",
}
const fulfillmentIcon: Record<string, any> = {
  PENDING: Clock, PROCESSING: RefreshCw, IN_TRANSIT: Truck, COMPLETED: Check, CANCELLED: XCircle,
}

const steps = [
  { key: "PENDING", label: "Konfirmasi" },
  { key: "PROCESSING", label: "Proses" },
  { key: "IN_TRANSIT", label: "Kirim" },
  { key: "COMPLETED", label: "Selesai" },
]

function stepperIndex(status: string): number {
  const idx = ["PENDING", "PROCESSING", "IN_TRANSIT", "COMPLETED"].indexOf(status)
  return idx < 0 ? 0 : idx
}

export function BuyerDashboardClient({ user, stats, recentOrders, recommendedProducts, sellerStatus }: Props) {
  const { update } = useSession()
  const router = useRouter()
  const [showSellForm, setShowSellForm] = useState(false)
  const [becomeState, formAction, pending] = useActionState<BecomeSellerState, FormData>(requestBecomeSeller, {})

  const isSeller = user.role === "SELLER"
  const isPendingSeller = isSeller && sellerStatus === "PENDING"
  const isApprovedSeller = isSeller && sellerStatus === "APPROVED"
  const initial = (user.name || "B").slice(0, 2).toUpperCase()

  const handleCancelRequest = async () => {
    const res = await cancelSellerRequest()
    if (res.success) {
      await update()
      router.refresh()
    }
  }

  // Refresh data when restored from browser back/forward cache (bfcache) to avoid stale personal data
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) router.refresh()
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [router])

  const quickActions = [
    { label: "Belanja", href: "/catalog", icon: ShoppingBag, desc: "Jelajahi produk" },
    { label: "Pesanan", href: "/dashboard-buyer/pesanan-saya", icon: Package, desc: "Lihat pesanan" },
    { label: "AI Chat", href: "/dashboard-buyer/ai-chat", icon: HelpCircle, desc: "Konsultasi bisnis" },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-clay-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 mt-3 mx-4 clay-pill px-4 py-2.5 flex items-center justify-between max-w-5xl lg:mx-auto" style={{ boxShadow: "var(--shadow-clay-md)" }}>
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-bold text-sm hidden sm:inline" style={{ color: "var(--color-primary)" }}>Dashboard Saya</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/catalog" className="btn-clay-outline !px-4 !py-1.5 text-xs">Belanja</Link>
          <NotificationBell />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-surface-container transition-all"
            style={{ color: "var(--color-on-surface-variant)" }}
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6 pb-32">
        {/* Hero */}
        <section className="clay-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--color-accent-gold), transparent 70%)" }} />
          <div className="flex items-center justify-between gap-4 relative">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-on-surface-variant)" }}>
                {isSeller ? "Pembeli & Mitra" : "Pembeli"}
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold truncate" style={{ color: "var(--color-primary)" }}>
                Halo, {user.name || "Buyer"}!
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                Selamat datang di akun M2A Co-Biz Anda. Kelola pesanan & kegiatan belanja di sini.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center text-xl md:text-2xl font-extrabold"
                style={{ background: "var(--color-primary)", color: "var(--color-on-primary)", boxShadow: "var(--shadow-clay-md)" }}>
                {initial}
              </div>
              <Link href="/dashboard-buyer/profil" className="text-[11px] font-bold inline-flex items-center gap-1 px-3 py-1 rounded-full hover:underline"
                style={{ color: "var(--color-primary)", background: "var(--color-primary-container)" }}>
                <UserIcon className="w-3 h-3" /> Edit Profil
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="clay-lite p-5">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Total Belanja</span>
            </div>
            <p className="text-lg md:text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>{formatRupiah(stats.totalSpent)}</p>
          </div>
          <div className="clay-lite p-5">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Pesanan Aktif</span>
            </div>
            <p className="text-lg md:text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>{stats.activeOrders}</p>
          </div>
          <div className="clay-lite p-5">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" style={{ color: "var(--color-accent-gold)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Menunggu Bayar</span>
            </div>
            <p className="text-lg md:text-xl font-extrabold" style={{ color: "var(--color-accent-gold)" }}>{stats.pendingPayments}</p>
          </div>
          <div className="clay-lite p-5">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4" style={{ color: "var(--color-accent-gold)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-on-surface-variant)" }}>Ulasan</span>
            </div>
            <p className="text-lg md:text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>{stats.totalReviews}</p>
          </div>
        </section>

        {/* Become seller / status */}
        {!isSeller && !showSellForm && (
          <section className="clay-lg p-6 md:p-7" style={{ border: "2px solid var(--color-accent-gold)" }}>
            <div className="flex items-start gap-4 flex-col md:flex-row md:items-center">
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-gold)", color: "#1A150E", boxShadow: "var(--shadow-clay-sm)" }}>
                <Store className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Ingin Jualan?</h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                  Jual produk atau jasa Anda di M2A Co-Biz! Daftar sekarang, lalu tunggu konfirmasi Admin/Ketua/Bendahara.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs font-inter" style={{ color: "var(--color-on-surface-variant)" }}>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" />Gratis</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" />Mudah</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" />Komisi Transparan</span>
                </div>
              </div>
              <button onClick={() => setShowSellForm(true)} className="btn-clay text-sm shrink-0">
                <Sparkles className="w-4 h-4" /> Daftar Jadi Penjual
              </button>
            </div>
          </section>
        )}

        {isPendingSeller && (
          <section className="clay-lg p-6 md:p-7" style={{ border: "2px solid var(--color-accent-gold)" }}>
            <div className="flex items-start gap-4 flex-col md:flex-row md:items-center">
              <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-gold)", color: "#1A150E", boxShadow: "var(--shadow-clay-sm)" }}>
                <Clock className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Menunggu Persetujuan</h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
                  Permohonan Anda sebagai penjual sedang ditinjau Admin/Ketua/Bendahara. Akses dashboard penjual dibuka setelah disetujui.
                </p>
              </div>
              <button onClick={handleCancelRequest} className="btn-clay-outline text-sm shrink-0">Batalkan</button>
            </div>
          </section>
        )}

        {isApprovedSeller && (
          <section className="clay-lg p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0" style={{ background: "var(--color-primary-container)", boxShadow: "var(--shadow-clay-sm)" }}>
                  <Store className="w-7 h-7" style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Dashboard Penjual</h2>
                  <p className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>Kelola produk, pantau penjualan, dan ajukan pencairan.</p>
                </div>
              </div>
              <Link href="/seller" className="btn-clay text-sm shrink-0"><ArrowUpRight className="w-4 h-4" /> Buka</Link>
            </div>
          </section>
        )}

        {/* Become seller form */}
        {showSellForm && !isSeller && (
          <section className="clay-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold" style={{ color: "var(--color-primary)" }}>Daftar Sebagai Penjual</h3>
              <button
                onClick={() => { setShowSellForm(false); if (becomeState.success) window.location.reload() }}
                className="w-9 h-9 rounded-full clay-sm flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form action={formAction} className="space-y-5 max-w-xl">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--color-on-surface)" }}>Nama Usaha / Jasa</label>
                <input name="businessName" type="text" placeholder="Contoh: Dapur Haliza" className="clay-input w-full px-4 py-3 text-sm font-inter" required />
                {becomeState.errors?.businessName && <p className="text-error text-xs mt-1 font-inter">{becomeState.errors.businessName[0]}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--color-on-surface)" }}>Jenis</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2.5 clay-sm px-4 py-3 flex-1 cursor-pointer">
                    <input type="radio" name="businessType" value="UMKM" defaultChecked className="accent-[var(--color-primary)]" />
                    <span className="text-sm font-medium">UMKM <span className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>(Produk)</span></span>
                  </label>
                  <label className="flex items-center gap-2.5 clay-sm px-4 py-3 flex-1 cursor-pointer">
                    <input type="radio" name="businessType" value="JASA" className="accent-[var(--color-primary)]" />
                    <span className="text-sm font-medium">Jasa <span className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>(Layanan)</span></span>
                  </label>
                </div>
                {becomeState.errors?.businessType && <p className="text-error text-xs mt-1 font-inter">{becomeState.errors.businessType[0]}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "var(--color-on-surface)" }}>
                  Dokumen Identitas <span className="text-xs" style={{ color: "var(--color-on-surface-variant)" }}>(wajib, JPG/PNG/PDF maks 5MB)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="clay-sm p-3 cursor-pointer block">
                    <span className="flex items-center gap-2 text-sm font-medium mb-1"><Upload className="w-4 h-4" style={{ color: "var(--color-primary)" }} /> KTP</span>
                    <input name="ktp" type="file" accept="image/jpeg,image/png,application/pdf" required className="text-xs w-full" />
                  </label>
                  <label className="clay-sm p-3 cursor-pointer block">
                    <span className="flex items-center gap-2 text-sm font-medium mb-1"><Upload className="w-4 h-4" style={{ color: "var(--color-primary)" }} /> Kartu Keluarga</span>
                    <input name="kartuKeluarga" type="file" accept="image/jpeg,image/png,application/pdf" required className="text-xs w-full" />
                  </label>
                </div>
                {becomeState.errors?.ktp && <p className="text-error text-xs mt-1 font-inter">{becomeState.errors.ktp[0]}</p>}
                {becomeState.errors?.kartuKeluarga && <p className="text-error text-xs mt-1 font-inter">{becomeState.errors.kartuKeluarga[0]}</p>}
              </div>
              <label className="flex items-center gap-3 clay-sm p-4 cursor-pointer">
                <input type="checkbox" name="consent" required className="w-5 h-5 rounded accent-[var(--color-primary)]" />
                <span className="text-sm" style={{ color: "var(--color-on-surface-variant)" }}>
                  Saya setuju dengan <Link href="/terms" className="font-bold text-primary hover:underline">Ketentuan</Link> M2A Co-Biz
                </span>
              </label>
              {becomeState.errors?.consent && <p className="text-error text-xs font-inter">{becomeState.errors.consent[0]}</p>}
              {becomeState.message && !becomeState.success && <p className="text-error text-sm font-inter">{becomeState.message}</p>}
              {becomeState.success && <p className="text-success text-sm font-inter font-bold">{becomeState.message}</p>}
              {!becomeState.success && (
                <button type="submit" disabled={pending} className="btn-clay w-full justify-center">
                  {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {pending ? "Mengirim..." : "Kirim Permohonan"}
                </button>
              )}
            </form>
          </section>
        )}

        {/* Quick actions */}
        <section className="grid grid-cols-3 gap-4">
          {quickActions.map((a) => {
            const Icon = a.icon
            return (
              <Link key={a.label} href={a.href} className="clay-sm p-5 hover:-translate-y-0.5 hover:shadow-clay-md transition-all group">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                  style={{ background: "var(--color-primary-container)", boxShadow: "var(--shadow-clay-sm)" }}>
                  <Icon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <p className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{a.desc}</p>
              </Link>
            )
          })}
        </section>

        {/* Recent orders */}
        <section className="clay-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-extrabold" style={{ color: "var(--color-primary)" }}>Pesanan Terbaru</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>Pantau status pesanan Anda</p>
            </div>
            <Link href="/dashboard-buyer/pesanan-saya" className="text-sm font-bold inline-flex items-center gap-1 hover:underline" style={{ color: "var(--color-primary)" }}>
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full clay flex items-center justify-center mx-auto mb-4" style={{ boxShadow: "var(--shadow-clay-sm)" }}>
                <ShoppingCart className="w-8 h-8" style={{ color: "var(--color-outline)" }} />
              </div>
              <p className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>Belum Ada Pesanan</p>
              <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-on-surface-variant)" }}>Yuk mulai belanja produk UMKM Banjarwaringin!</p>
              <Link href="/catalog" className="btn-clay text-sm inline-flex">Mulai Belanja</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const FulfillIcon = fulfillmentIcon[order.fulfillmentStatus] || Clock
                const isPaid = order.paymentStatus === "PAID"
                const stepIdx = stepperIndex(order.fulfillmentStatus)
                const firstItem = order.items[0]
                return (
                  <Link key={order.id} href="/dashboard-buyer/pesanan-saya" className="block clay-sm p-4 hover:shadow-clay-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0" style={{ background: "var(--color-clay-surface-variant)" }}>
                        {firstItem?.image ? (
                          <Image src={firstItem.image} alt={firstItem.title} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5" style={{ color: "var(--color-outline)" }} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold truncate">
                            {order.items.map(i => i.title).join(", ")}
                          </p>
                          <span className="text-sm font-extrabold shrink-0" style={{ color: "var(--color-primary)" }}>{formatRupiah(order.totalRupiah)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {isPaid && (
                            <span className={`chip-clay text-[10px] font-bold flex items-center gap-1 ${fulfillmentColor[order.fulfillmentStatus]}`}>
                              <FulfillIcon className="w-3 h-3" />
                              {fulfillmentLabel[order.fulfillmentStatus]}
                            </span>
                          )}
                          {!isPaid && (
                            <span className="chip-clay text-[10px] font-bold !bg-warning/10 !text-warning flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {paymentLabel[order.paymentStatus]}
                            </span>
                          )}
                          <span className="text-[10px] font-inter" style={{ color: "var(--color-on-surface-variant)" }}>
                            {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        {/* Mini stepper */}
                        {isPaid && order.fulfillmentStatus !== "CANCELLED" && (
                          <div className="flex items-center gap-1 mt-3">
                            {steps.map((s, i) => {
                              const done = i <= stepIdx
                              return (
                                <div key={s.key} className="flex-1 flex flex-col items-center">
                                  <div className="w-full h-1 rounded-full" style={{ background: done ? "var(--color-primary)" : "var(--color-outline-variant)", opacity: done ? 1 : 0.5 }} />
                                  <span className={`text-[9px] mt-1 ${i <= stepIdx ? "font-bold" : ""}`} style={{ color: i <= stepIdx ? "var(--color-primary)" : "var(--color-on-surface-variant)" }}>
                                    {s.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* Recommended products */}
        {recommendedProducts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold" style={{ color: "var(--color-primary)" }}>Rekomendasi Untukmu</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>Produk terbaru dari mitra UMKM</p>
              </div>
              <Link href="/catalog" className="text-sm font-bold inline-flex items-center gap-1 hover:underline" style={{ color: "var(--color-primary)" }}>
                Katalog <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map((p) => (
                <Link key={p.id} href={`/catalog/${p.id}`} className="prod-card hover:-translate-y-0.5 hover:shadow-clay-md transition-all">
                  <div className="aspect-square relative overflow-hidden" style={{ background: "var(--color-clay-surface-variant)" }}>
                    {p.image ? (
                      <Image src={p.image} alt={p.title} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8" style={{ color: "var(--color-outline)" }} /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="chip-clay text-[9px] px-2 py-0.5 inline-block mb-1.5">{p.categoryName}</span>
                    <h4 className="font-bold text-sm truncate" style={{ color: "var(--color-on-surface)" }}>{p.title}</h4>
                    <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>{p.businessName}</p>
                    <p className="font-extrabold mt-1.5" style={{ color: "var(--color-primary)" }}>{formatRupiah(p.priceRupiah)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom nav */}
      <PublicBottomBar isLoggedIn role={user.role} />
    </div>
  )
}
