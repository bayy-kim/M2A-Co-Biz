"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, ShoppingBag, Package, User } from "lucide-react"

interface Props {
  isLoggedIn?: boolean
  isSeller?: boolean
  role?: string
}

export function PublicBottomBar({ isLoggedIn, role }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab")

  const getDashboardHref = () => {
    if (!isLoggedIn) return "/login"
    if (role === "ADMIN") return "/admin"
    if (role === "BENDAHARA") return "/bendahara"
    if (role === "KETUA") return "/ketua"
    if (role === "SELLER") return "/seller"
    return "/pesanan-saya?tab=account"
  }

  const items = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
    },
    {
      label: "Katalog",
      href: "/catalog",
      icon: ShoppingBag,
    },
    {
      label: "Pesanan",
      href: isLoggedIn ? "/pesanan-saya" : "/login",
      icon: Package,
    },
    {
      label: "Saya",
      href: getDashboardHref(),
      icon: User,
    },
  ]

  const isItemActive = (label: string) => {
    if (label === "Beranda") return pathname === "/"
    if (label === "Katalog") return pathname.startsWith("/catalog")
    if (label === "Pesanan") return pathname === "/pesanan-saya" && currentTab !== "account"
    if (label === "Saya") {
      if (!isLoggedIn) return pathname === "/login"
      if (role === "ADMIN") return pathname.startsWith("/admin")
      if (role === "BENDAHARA") return pathname.startsWith("/bendahara")
      if (role === "KETUA") return pathname.startsWith("/ketua")
      if (role === "SELLER") return pathname.startsWith("/seller")
      return pathname === "/pesanan-saya" && currentTab === "account"
    }
    return false
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi Publik Mobile"
    >
      <div className="flex items-center justify-around mx-auto max-w-lg overflow-x-auto no-scrollbar">
        {items.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.label)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-0 flex-shrink-0 h-16 w-16 px-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 ${
                active ? "text-primary font-bold" : "text-on-surface-variant hover:text-on-surface"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                active ? "bg-primary text-white shadow-xs" : "hover:bg-surface-container-high text-on-surface-variant"
              }`}>
                <Icon className="w-5 h-5" />
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
  )
}
