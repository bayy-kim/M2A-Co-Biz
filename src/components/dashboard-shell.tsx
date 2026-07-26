"use client"

import Link from "next/link"
import { 
  ChevronRight, Store, Menu, X, User, LayoutDashboard, Clock, Tag, Users, Building2, List, 
  Activity, CreditCard, Percent, Wallet, BookOpen, Package, ShoppingCart, Bell, type LucideIcon 
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { Logo } from "@/components/logo"
import { useState, ComponentType } from "react"

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (item: SidebarItem) => {
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

  const mobileNavItems = [...sidebarItems, getNotificationItem()]

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <aside 
        className="w-64 bg-surface-container-low border-r border-outline-variant/30 hidden lg:flex flex-col shrink-0"
        aria-label="Navigasi Utama"
      >
        <div className="p-lg border-b border-outline-variant/30">
          <Logo showSubtitle subtitleText={title} />
        </div>

        {userName && (
          <div className="p-lg mx-md mt-lg rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-label-md font-bold text-on-surface truncate">{userName}</p>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary capitalize">
                {displayRole}
              </span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-md space-y-1.5 overflow-y-auto mt-md" aria-label="Navigasi Dashboard">
          {sidebarItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-md py-3 rounded-xl text-label-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {renderIcon(item.icon)}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-lg border-t border-outline-variant/30 space-y-2">
          <Link
            href="/catalog"
            className="flex items-center gap-3 px-md py-3 rounded-xl text-label-md text-primary font-bold hover:bg-primary/5 transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Store className="w-5 h-5" />
            Lihat Produk
          </Link>
          <LogoutButton />
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
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Buka menu navigasi"
                type="button"
              >
                <Menu className="w-6 h-6" />
              </button>
              <span className="text-label-md font-bold text-on-surface">{title}</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            {extraHeader}
          </div>
        </header>

        <main className="flex-1 p-lg space-y-lg overflow-auto">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <aside className="fixed inset-y-0 left-0 w-72 bg-surface-container-low flex flex-col shadow-2xl z-50 animate-slide-in">
            <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
              <Logo size="sm" showSubtitle subtitleText={displayRole} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Tutup menu navigasi"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {userName && (
              <div className="p-lg border-b border-outline-variant/30 flex items-center gap-3 bg-surface-container-high/50">
                <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-label-md font-bold text-on-surface truncate">{userName}</p>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary capitalize">
                    {displayRole}
                  </span>
                </div>
              </div>
            )}

            <nav className="flex-1 p-lg space-y-md overflow-y-auto" aria-label="Navigasi Menu Mobile">
              {sidebarItems.map((item) => {
                const active = isActive(item)
  const getNotificationItem = (): SidebarItem => {
    if (roleLabel === "admin") return { label: "Notifikasi", href: "/admin?tab=approvals", icon: "Bell" }
    if (roleLabel === "bendahara") return { label: "Notifikasi", href: "/bendahara?tab=payments", icon: "Bell" }
    if (roleLabel === "ketua") return { label: "Notifikasi", href: "/ketua?tab=activity", icon: "Bell" }
    if (roleLabel === "seller") return { label: "Notifikasi", href: "/seller?tab=sales", icon: "Bell" }
    return { label: "Notifikasi", href: "/pesanan-saya", icon: "Bell" }
  }

  // Combine sidebar items with notification item for mobile bottom bar
  const mobileNavItems = [...sidebarItems, getNotificationItem()]

  return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-lg py-3.5 rounded-2xl text-label-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active
                        ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {renderIcon(item.icon)}
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="p-lg border-t border-outline-variant/30 space-y-3 bg-surface-container-high/20">
              <Link
                href="/catalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 px-lg py-3.5 rounded-2xl text-label-md text-primary font-bold hover:bg-primary/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Store className="w-5 h-5" />
                Lihat Produk
              </Link>
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      <nav 
        className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigasi Bawah Mobile"
      >
        <div className="flex items-center justify-around mx-auto max-w-lg overflow-x-auto no-scrollbar">
          {mobileNavItems.map((item) => {
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
