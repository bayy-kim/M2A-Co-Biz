"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingBag, Package, User } from "lucide-react"

interface Props {
  isLoggedIn?: boolean
  isSeller?: boolean
  role?: string
}

export function PublicBottomBar({ isLoggedIn, role }: Props) {
  const pathname = usePathname()

  const getDashboardHref = () => {
    if (!isLoggedIn) return "/login"
    if (role === "ADMIN") return "/admin"
    if (role === "BENDAHARA") return "/bendahara"
    if (role === "KETUA") return "/ketua"
    if (role === "SELLER") return "/seller"
    return "/dashboard-buyer"
  }

  const items = [
    {
      label: "Katalog",
      href: "/catalog",
      icon: ShoppingBag,
    },
    {
      label: "Pesanan",
      href: isLoggedIn ? (role === "BUYER" ? "/dashboard-buyer/pesanan-saya" : "/pesanan-saya") : "/login",
      icon: Package,
    },
    {
      label: "Saya",
      href: getDashboardHref(),
      icon: User,
    },
  ]

  const isItemActive = (label: string) => {
    // "Katalog" aktif di halaman utama maupun katalog
    if (label === "Katalog") return pathname === "/" || pathname.startsWith("/catalog")
    if (label === "Pesanan") return pathname === "/pesanan-saya" || pathname.startsWith("/dashboard-buyer/pesanan-saya")
    if (label === "Saya") {
      if (!isLoggedIn) return pathname === "/login"
      if (role === "ADMIN") return pathname.startsWith("/admin")
      if (role === "BENDAHARA") return pathname.startsWith("/bendahara")
      if (role === "KETUA") return pathname.startsWith("/ketua")
      if (role === "SELLER") return pathname.startsWith("/seller")
      return pathname.startsWith("/dashboard-buyer")
    }
    return false
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 w-full z-50 pb-[env(safe-area-inset-bottom)]"
      style={{background:"var(--color-clay-bg)"}}
      aria-label="Navigasi Publik Mobile"
    >
      <div className="clay-pill flex items-center justify-around mx-4 -mt-5 mb-2 px-2 py-1.5 max-w-lg" style={{boxShadow:"var(--shadow-clay-md)"}}>
        {items.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.label)
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
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center max-w-full truncate">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
