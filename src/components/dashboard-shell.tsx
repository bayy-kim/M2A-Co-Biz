"use client"

import Link from "next/link"
import { 
  ChevronRight, Store, User, LayoutDashboard, Clock, Tag, Users, Building2, List, 
  Activity, CreditCard, Percent, Wallet, BookOpen, Package, ShoppingCart, Bell, LogOut, Bot, HelpCircle, X, type LucideIcon 
} from "lucide-react"
import { signOut } from "next-auth/react"
import { ComponentType, useState } from "react"
import { Logo } from "@/components/logo"

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Clock,
  Tag,
  Users,
  Building2,
  List,
  Activity,
  CreditCard,
  Percent,
  Wallet,
  BookOpen,
  Package,
  ShoppingCart,
  Store,
  Bell,
  Bot,
  HelpCircle,
}

interface SidebarItem {
  label: string
  href: string
  icon?: LucideIcon | string
}

interface DashboardShellProps {
  sidebarItems: SidebarItem[]
  title: string
  roleLabel: string
  tab: string
  children: React.ReactNode
  extraHeader?: React.ReactNode
  userName?: string | null
}

export function DashboardShell({
  sidebarItems,
  title,
  roleLabel,
  tab,
  children,
  extraHeader,
  userName,
}: DashboardShellProps) {
  const [showGuide, setShowGuide] = useState(false)

  const isActive = (item: SidebarItem) => {
    if (item.label === "Notifikasi") {
      return tab === "approvals" || tab === "payments" || tab === "activity" || tab === "sales"
    }
    if (item.href === `/${roleLabel}`) {
      return tab === "overview" || tab === ""
    }
    return item.href.includes(tab)
  }

  const displayRole = {
    admin: "Administrator",
    bendahara: "Bendahara",
    ketua: "Ketua",
    seller: "Penjual",
    buyer: "Pembeli",
  }[roleLabel] || roleLabel

  const renderIcon = (icon?: LucideIcon | string) => {
    if (!icon) return null
    if (typeof icon === "string") {
      const Comp = ICON_MAP[icon]
      return Comp ? <Comp className="w-5 h-5 shrink-0" /> : null
    }
    const Comp = icon as ComponentType<{ className?: string }>
    return <Comp className="w-5 h-5 shrink-0" />
  }

  const getNotificationItem = (): SidebarItem => {
    if (roleLabel === "admin") return { label: "Notifikasi", href: "/admin?tab=approvals", icon: "Bell" }
    if (roleLabel === "bendahara") return { label: "Notifikasi", href: "/bendahara?tab=payments", icon: "Bell" }
    if (roleLabel === "ketua") return { label: "Notifikasi", href: "/ketua?tab=activity", icon: "Bell" }
    if (roleLabel === "seller") return { label: "Notifikasi", href: "/seller?tab=sales", icon: "Bell" }
    return { label: "Notifikasi", href: "/pesanan-saya", icon: "Bell" }
  }

  const mobileNavItems = [...sidebarItems, getNotificationItem(), { label: "Keluar", href: "#", icon: "LogOut" }]

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{background:"var(--color-clay-bg)"}}>
      <aside 
        className="w-64 bg-gradient-to-b from-[#12263A] to-[#004343] text-white border-r border-white/10 hidden lg:flex flex-col shrink-0 py-xl shadow-lg z-50"
        aria-label="Navigasi Utama"
      >
        <div className="px-lg mb-xxl">
          <Logo showSubtitle subtitleText={title} />
        </div>

        {userName && (
          <div className="mx-2 mb-md">
            <div className="p-[1px] rounded-lg bg-gradient-to-b from-white/20 to-transparent">
              <div className="rounded-[calc(0.5rem-1px)] bg-white/5 flex items-center gap-3 p-md">
                <div className="w-10 h-10 bg-accent-gold text-on-primary-fixed font-bold rounded-full flex items-center justify-center shrink-0 shadow-xs text-label-md">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-label-md font-bold text-white truncate">{userName}</p>
                  <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-accent-gold uppercase tracking-wider">
                    {roleLabel}
                  </span>
                  <Link
                    href="/lengkapi-profil"
                    className="block text-[10px] text-white/60 hover:text-accent-gold transition-colors mt-0.5"
                  >
                    Edit Profil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1" aria-label="Navigasi Dashboard">
          {sidebarItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 mx-2 px-4 py-3 rounded-lg font-label-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-gold ${
                  active
                    ? "bg-[#0f5c5c] text-[#90d2d1] font-bold shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {renderIcon(item.icon)}
                <span>{item.label}</span>
                {item.label.includes("Antrian") && (
                  <span className="ml-auto bg-accent-gold text-[#002020] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    12
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-2 space-y-2">
          <Link
            href="/catalog"
            className="flex items-center gap-3 text-accent-gold hover:bg-white/10 mx-2 px-4 py-3 transition-all rounded-lg font-label-md font-bold"
          >
            <Store className="w-5 h-5" />
            <span>Lihat Produk</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 mx-2 px-4 py-3 rounded-lg font-label-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-accent-gold text-white/80 hover:bg-white/10 hover:text-error w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-40 bg-clay-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-lg h-16">
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">{displayRole}</span>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              <span className="text-label-sm font-bold text-on-surface capitalize">{tab.replace(/-/g, " ") || "Ringkasan"}</span>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <span className="text-label-md font-bold text-on-surface">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-lg">
            {extraHeader}

            {/* Guide Button with Glass Effect Modal */}
            <button
              onClick={() => setShowGuide(true)}
              className="w-9 h-9 rounded-[14px] clay-sm flex items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{background:"var(--color-clay-surface)",boxShadow:"var(--shadow-clay-sm)"}}
              aria-label="Panduan Penggunaan"
              type="button"
            >
              <HelpCircle className="w-5 h-5 text-on-surface-variant" />
            </button>

            {userName && (
              <div className="hidden sm:flex items-center gap-3 pl-md border-l border-outline-variant/30">
                <div className="flex flex-col items-end">
                  <span className="text-label-md font-bold text-on-surface leading-none">{userName}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1">
                    {roleLabel}
                  </span>
                </div>
                <div className="w-9 h-9 bg-primary text-on-primary font-bold rounded-full flex items-center justify-center text-label-md shadow-xs shrink-0 ring-2 ring-primary/20">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-lg space-y-lg overflow-auto">
          {children}
        </main>
      </div>

      {/* Glass Effect Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-gutter" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowGuide(false)} />
          
          <div className="relative bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-2xl p-lg md:p-xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slide-in">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 flex items-center justify-center text-on-surface-variant hover:bg-white/80 hover:text-primary transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
              type="button"
              aria-label="Tutup panduan"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-lg">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-headline-md font-bold text-on-surface">Panduan <span className="text-primary capitalize">{roleLabel}</span></h3>
                  <p className="text-label-sm text-on-surface-variant">Cara cepat menggunakan dashboard ini</p>
                </div>
              </div>

              <div className="space-y-md">
                {roleLabel === "admin" && (
                  <>
                    <GuideItem icon={LayoutDashboard} title="Ringkasan" desc="Lihat statistik umum: jumlah seller pending, produk aktif, dan aktivitas terbaru." />
                    <GuideItem icon={Clock} title="Antrian Persetujuan" desc="Tinjau & setujui/tolak pendaftaran seller baru. Klik 'Review Documents' untuk lihat KTP/KK." />
                    <GuideItem icon={Tag} title="Kategori" desc="Atur kategori produk. Kategorinya bisa di-approve atau ditolak." />
                    <GuideItem icon={Users} title="Pengguna" desc="Lihat daftar semua pengguna yang terdaftar di platform." />
                    <GuideItem icon={Building2} title="Profil Perusahaan" desc="Atur informasi perusahaan: alamat, rekening bank, nomor WhatsApp, QRIS." />
                    <GuideItem icon={List} title="Log Aktivitas" desc="Semua aktivitas penting tercatat otomatis di sini untuk audit trail." />
                  </>
                )}

                {roleLabel === "bendahara" && (
                  <>
                    <GuideItem icon={LayoutDashboard} title="Ringkasan" desc="Pantau total pemasukan, pengeluaran, komisi, dan pending payout." />
                    <GuideItem icon={CreditCard} title="Pembayaran" desc="Konfirmasi pembayaran dari pembeli. Pastikan cek bukti transfer dulu sebelum klik 'Konfirmasi'." />
                    <GuideItem icon={Percent} title="Aturan Komisi" desc="Atur persentase komisi: Global (default) > per Kategori > per Seller." />
                    <GuideItem icon={Wallet} title="Pencairan" desc="Proses pencairan dana seller. Cek saldo seller dulu sebelum approve." />
                    <GuideItem icon={BookOpen} title="Buku Besar" desc="Semua transaksi IN (pemasukan) dan OUT (pengeluaran) tercatat di sini." />
                  </>
                )}

                {roleLabel === "ketua" && (
                  <>
                    <GuideItem icon={LayoutDashboard} title="Ringkasan" desc="Lihat gambaran umum performa platform: total seller, produk, pemasukan & komisi." />
                    <GuideItem icon={Activity} title="Feed Aktivitas" desc="Pantau aktivitas terkini: pendaftaran baru, pembayaran, payout, dan perubahan komisi." />
                  </>
                )}

                {roleLabel === "seller" && (
                  <>
                    <GuideItem icon={LayoutDashboard} title="Ringkasan" desc="Lihat total penjualan, pendapatan bersih, produk aktif, dan saldo yang bisa dicairkan." />
                    <GuideItem icon={Package} title="Produk" desc="Tambah produk/jasa baru, lengkap dengan foto, kategori, dan varian (ukuran/warna/rasa) + stok awal." />
                    <GuideItem icon={ShoppingCart} title="Penjualan" desc="Lihat riwayat penjualan. Update status pengerjaan pesanan di sini. Klik 'Cetak' untuk cetak struk." />
                    <GuideItem icon={Wallet} title="Pencairan" desc="Ajukan pencairan saldo ke Bendahara. Pastikan data rekening sudah diisi di profil." />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav 
        className="lg:hidden fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom)]"
        style={{background:"var(--color-clay-bg)"}}
        aria-label="Navigasi Bawah Mobile"
      >
        <div className="clay-pill flex items-center justify-around mx-4 -mt-5 mb-2 px-1 py-1.5 max-w-lg" style={{boxShadow:"var(--shadow-clay-md)"}}>
          {mobileNavItems.map((item) => {
            if (item.label === "Keluar") {
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-shrink-0 px-4 py-1.5 rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary text-on-surface-variant hover:text-error"
                  aria-label="Keluar"
                >
                  <div className="flex items-center justify-center w-6 h-6 text-current">
                    {renderIcon(item.icon)}
                  </div>
                  <span className="text-[10px] leading-tight text-center max-w-full truncate">
                    {item.label}
                  </span>
                </button>
              )
            }

            const active = isActive(item)
            const isNotification = item.label === "Notifikasi"
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-shrink-0 px-4 py-1.5 rounded-full transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active 
                    ? "clay-sm shadow-[3px_3px_8px_rgba(0,0,0,0.05),-3px_-3px_8px_rgba(255,255,255,0.5)] font-bold" 
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                style={active ? {background: "var(--color-clay-surface)"} : {}}
                aria-current={active ? "page" : undefined}
              >
                <div className="relative flex items-center justify-center w-6 h-6">
                  {renderIcon(item.icon)}
                  {isNotification && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent-gold border-2 border-clay-surface animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] leading-tight text-center max-w-full truncate font-medium">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function GuideItem({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-md rounded-xl bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-colors">
      <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-label-md font-bold text-on-surface">{title}</p>
        <p className="text-label-sm text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
