"use client"

import { useState, useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Package, ShoppingBag, Store, LogOut, HelpCircle, X, ChevronRight, Clock, CheckCircle, XCircle, Banknote, CreditCard, ArrowUpRight, Loader2, Sparkles, ShoppingCart, RefreshCw, Truck, Check } from "lucide-react"
import { signOut } from "next-auth/react"
import { Logo } from "@/components/logo"
import { requestBecomeSeller, cancelSellerRequest, type BecomeSellerState } from "./actions"

function formatRupiah(n: number) { return "Rp" + n.toLocaleString("id-ID") }

const paymentLabel: Record<string, string> = {
  PENDING: "Menunggu Pembayaran", PAID: "Lunas", FAILED: "Gagal", EXPIRED: "Kedaluwarsa",
}
const fulfillmentLabelMap: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi", PROCESSING: "Sedang Diproses", IN_TRANSIT: "Dikirim", COMPLETED: "Selesai", CANCELLED: "Batal",
}

export default function BuyerDashboard() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [showSellForm, setShowSellForm] = useState(false)
  const [becomeState, formAction, pending] = useActionState<BecomeSellerState, FormData>(requestBecomeSeller, {})

  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    fetch("/api/buyer/recent-orders")
      .then(r => r.json())
      .then(d => { setRecentOrders(d.orders); setOrdersLoading(false) })
      .catch(() => setOrdersLoading(false))
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:"var(--color-clay-bg)"}}>
        <Loader2 className="w-8 h-8 animate-spin" style={{color:"var(--color-primary)"}} />
      </div>
    )
  }

  const user = session?.user as any
  if (!user) {
    if (typeof window !== "undefined") router.push("/login?callbackUrl=/dashboard-buyer")
    return null
  }

  const isSeller = user.role === "SELLER"
  const isPendingSeller = isSeller && user.sellerStatus === "PENDING"

  const tabs = [
    { label: "Pesanan Saya", href: "/pesanan-saya" },
    { label: "Katalog", href: "/catalog" },
    { label: "AI Chat", href: "/aichat" },
  ]

  const handleCancelRequest = async () => {
    const res = await cancelSellerRequest()
    if (res.success) {
      await update()
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen" style={{background:"var(--color-clay-bg)"}}>
      {/* Header */}
      <header className="sticky top-0 z-50 clay-pill mx-4 mt-3 px-4 py-2.5 flex items-center justify-between max-w-4xl lg:mx-auto" style={{boxShadow:"var(--shadow-clay-md)"}}>
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="font-bold text-sm hidden sm:inline">Dashboard Saya</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-error px-3 py-1.5 rounded-full hover:bg-surface-container transition-all">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome Card */}
        <div className="clay-lg p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold" style={{color:"var(--color-primary)"}}>Halo, {user.name || "Buyer"}!</h1>
              <p className="text-sm mt-1" style={{color:"var(--color-on-surface-variant)"}}>Selamat datang di akun M2A Co-Biz Anda.</p>
            </div>
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-lg font-bold shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.5)]" style={{background:"var(--color-primary)",color:"var(--color-on-primary)"}}>
              {(user.name || "B").slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link href="/pesanan-saya" className="btn-clay text-sm px-5 py-2.5"><Package className="w-4 h-4" /> Pesanan Saya</Link>
            <Link href="/catalog" className="btn-clay-outline text-sm"><ShoppingBag className="w-4 h-4" /> Belanja</Link>
          </div>
        </div>

        {/* Ingin Jualan? Section */}
        {!isSeller && !showSellForm && (
          <div className="clay-lg p-6 md:p-8" style={{border:"2px solid var(--color-accent-gold)"}}>
            <div className="flex items-start gap-4 flex-col md:flex-row md:items-center">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0" style={{background:"var(--color-accent-gold)",color:"#1A150E"}}>
                <Store className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold" style={{color:"var(--color-primary)"}}>Ingin Jualan?</h2>
                <p className="text-sm mt-1" style={{color:"var(--color-on-surface-variant)"}}>
                  Jual produk atau jasa Anda di M2A Co-Biz! Daftar sekarang, lalu tunggu konfirmasi dari Admin/Ketua/Bendahara.
                </p>
              </div>
              <button onClick={() => setShowSellForm(true)} className="btn-clay text-sm shrink-0"><Sparkles className="w-4 h-4" /> Daftar Jadi Penjual</button>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs font-inter" style={{color:"var(--color-on-surface-variant)"}}>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" />GRatis</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" />Mudah</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-success" />Komisi Transparan</span>
            </div>
          </div>
        )}

        {/* Status pending seller */}
        {isPendingSeller && (
          <div className="clay-lg p-6 md:p-8" style={{border:"2px solid var(--color-accent-gold)"}}>
            <div className="flex items-start gap-4 flex-col md:flex-row md:items-center">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0" style={{background:"var(--color-accent-gold)",color:"#1A150E"}}>
                <Clock className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold" style={{color:"var(--color-primary)"}}>Menunggu Persetujuan</h2>
                <p className="text-sm mt-1" style={{color:"var(--color-on-surface-variant)"}}>
                  Permohonan Anda sebagai penjual sedang ditinjau oleh Admin/Ketua/Bendahara. Anda akan mendapat akses dashboard penjual begitu disetujui.
                </p>
              </div>
              <button onClick={handleCancelRequest} className="btn-clay-outline shrink-0">Batalkan</button>
            </div>
          </div>
        )}

        {/* Seller yang sudah approved — link ke seller dashboard */}
        {isSeller && !isPendingSeller && (
          <div className="clay-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[16px] flex items-center justify-center shrink-0" style={{background:"var(--color-primary-container)"}}>
                  <Store className="w-7 h-7" style={{color:"var(--color-primary)"}} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold" style={{color:"var(--color-primary)"}}>Dashboard Penjual</h2>
                  <p className="text-sm" style={{color:"var(--color-on-surface-variant)"}}>Kelola produk, lihat penjualan, dan ajukan pencairan.</p>
                </div>
              </div>
              <Link href="/seller" className="btn-clay text-sm"><ArrowUpRight className="w-4 h-4" /> Buka</Link>
            </div>
          </div>
        )}

        {/* Form daftar jadi penjual */}
        {showSellForm && !isSeller && (
          <div className="clay-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{color:"var(--color-primary)"}}>Daftar Sebagai Penjual</h3>
              <button onClick={() => { setShowSellForm(false); if (becomeState.success) window.location.reload() }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-all"><X className="w-4 h-4" /></button>
            </div>
            <form action={formAction} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nama Usaha / Jasa</label>
                <input name="businessName" type="text" placeholder="Contoh: Dapur Haliza" className="clay-input w-full px-4 py-3 text-sm font-inter" required />
                {becomeState.errors?.businessName && <p className="text-error text-xs mt-1 font-inter">{becomeState.errors.businessName[0]}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Jenis</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 clay-sm px-4 py-3 flex-1 cursor-default"><input type="radio" name="businessType" value="UMKM" defaultChecked className="accent-[var(--color-primary)]" /> <span className="text-sm font-medium">UMKM (Produk)</span></label>
                  <label className="flex items-center gap-2 clay-sm px-4 py-3 flex-1 cursor-default"><input type="radio" name="businessType" value="JASA" className="accent-[var(--color-primary)]" /> <span className="text-sm font-medium">Jasa</span></label>
                </div>
                {becomeState.errors?.businessType && <p className="text-error text-xs mt-1 font-inter">{becomeState.errors.businessType[0]}</p>}
              </div>
              <label className="flex items-center gap-3 clay-sm p-3 cursor-default">
                <input type="checkbox" name="consent" required className="w-5 h-5 rounded accent-[var(--color-primary)]" />
                <span className="text-sm" style={{color:"var(--color-on-surface-variant)"}}>Saya setuju dengan <Link href="/terms" className="font-bold text-primary hover:underline">Ketentuan</Link> M2A Co-Biz</span>
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
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabs.map((t) => (
            <Link key={t.label} href={t.href} className="clay-sm p-4 hover:shadow-clay-md transition-all">
              <p className="font-bold text-sm" style={{color:"var(--color-primary)"}}>{t.label}</p>
              <ChevronRight className="w-4 h-4 mt-2" style={{color:"var(--color-on-surface-variant)"}} />
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="clay-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold" style={{color:"var(--color-primary)"}}>Pesanan Terbaru</h3>
            <Link href="/pesanan-saya" className="text-sm font-bold" style={{color:"var(--color-primary)"}}>Lihat Semua</Link>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" style={{color:"var(--color-primary)"}} />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3" style={{color:"var(--color-outline)"}} />
              <p className="text-sm" style={{color:"var(--color-on-surface-variant)"}}>Belum ada pesanan.</p>
              <Link href="/catalog" className="btn-clay text-sm mt-3 inline-flex">Mulai Belanja</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => {
                const FulfillIcon = order.fulfillmentStatus === "PROCESSING" ? RefreshCw
                  : order.fulfillmentStatus === "IN_TRANSIT" ? Truck
                  : order.fulfillmentStatus === "COMPLETED" ? Check
                  : Clock
                return (
                  <Link key={order.id} href="/pesanan-saya" className="block clay-sm p-4 hover:shadow-clay-md transition-all">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">
                          {order.items.map((i: any) => i.title).join(", ")}
                        </p>
                        <p className="text-xs mt-0.5 font-inter" style={{color:"var(--color-on-surface-variant)"}}>
                          {formatRupiah(order.totalRupiah)} &middot; {new Date(order.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Payment badge */}
                        <span className={`chip-clay text-[10px] font-bold ${order.paymentStatus === "PAID" ? "!bg-success/10 !text-success" : "!bg-warning/10 !text-warning"}`}>
                          {paymentLabel[order.paymentStatus] || order.paymentStatus}
                        </span>
                        {/* Fulfillment badge */}
                        {order.paymentStatus === "PAID" && (
                          <span className="chip-clay text-[10px] font-bold flex items-center gap-1">
                            <FulfillIcon className="w-3 h-3" />
                            {fulfillmentLabelMap[order.fulfillmentStatus] || order.fulfillmentStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom)]" style={{background:"var(--color-clay-bg)"}}>
        <div className="clay-pill flex items-center justify-around mx-4 -mt-5 mb-2 px-2 py-1.5 max-w-lg" style={{boxShadow:"var(--shadow-clay-md)"}}>
          <Link href="/dashboard-buyer" className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full clay-sm font-bold" style={{background:"var(--color-clay-surface)",boxShadow:"var(--shadow-clay-sm)"}}><Package className="w-5 h-5" /><span className="text-[10px]">Dashboard</span></Link>
          <Link href="/catalog" className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all"><ShoppingBag className="w-5 h-5" /><span className="text-[10px]">Katalog</span></Link>
          <Link href="/pesanan-saya" className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all"><Package className="w-5 h-5" /><span className="text-[10px]">Pesanan</span></Link>
          <Link href="/aichat" className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface transition-all"><HelpCircle className="w-5 h-5" /><span className="text-[10px]">AI Chat</span></Link>
        </div>
      </nav>
    </div>
  )
}
