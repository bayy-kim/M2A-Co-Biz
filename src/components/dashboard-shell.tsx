"use client"

import Link from "next/link"
import { 
  ChevronRight, Store, User, LayoutDashboard, Clock, Tag, Users, Building2, List, 
  Activity, CreditCard, Percent, Wallet, BookOpen, Package, ShoppingCart, Bell, LogOut, Bot, type LucideIcon 
} from "lucide-react"
import { signOut } from "next-auth/react"
import { ComponentType } from "react"
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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
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
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-lg h-16">
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

      <nav 
        className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigasi Bawah Mobile"
      >
        <div className="flex items-center justify-around mx-auto max-w-lg overflow-x-auto no-scrollbar">
          {mobileNavItems.map((item) => {
            if (item.label === "Keluar") {
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center gap-1 min-w-0 flex-shrink-0 h-16 w-16 px-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary text-on-surface-variant hover:text-error"
                  aria-label="Keluar"
                >
                  <div className="relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 hover:bg-error/10 text-on-surface-variant hover:text-error">
                    {renderIcon(item.icon)}
                  </div>
                  <span className="text-[10px] leading-tight text-center max-w-full truncate text-on-surface-variant">
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
                className={`flex flex-col items-center justify-center gap-1 min-w-0 flex-shrink-0 h-16 w-16 px-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                  active ? "bg-primary text-white shadow-xs" : "hover:bg-surface-container-high text-on-surface-variant"
                }`}>
                  {renderIcon(item.icon)}
                  {isNotification && (
                    <span className="absolute top-1 right-2.5 w-2.5 h-2.5 rounded-full bg-accent-gold border-2 border-primary animate-pulse" />
                  )}
                </div>
                <span className={`text-[10px] leading-tight text-center max-w-full truncate ${
                  active ? "font-bold text-primary" : "text-on-surface-variant"
                }`}>
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
