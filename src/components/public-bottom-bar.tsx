"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, ShoppingBag, LayoutGrid } from "lucide-react"

interface Props {
  isLoggedIn?: boolean
  isSeller?: boolean
}

export function PublicBottomBar({ isLoggedIn, isSeller }: Props) {
  const pathname = usePathname()

  const items = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
    },
    {
      label: "Katalog",
      href: "/catalog",
      icon: LayoutGrid,
    },
    {
      label: isSeller ? "Dashboard" : "Daftar Jual",
      href: isSeller ? "/seller" : "/register?role=seller",
      icon: Store,
      hideWhen: isLoggedIn && !isSeller,
    },
    {
      label: "Pesanan",
      href: isLoggedIn ? "/pesanan-saya" : "/login",
      icon: ShoppingBag,
    },
  ]

  const visibleItems = items.filter((item) => !item.hideWhen)

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="flex items-center justify-around mx-auto max-w-lg overflow-x-auto no-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-shrink-0 h-16 w-16 px-1 transition-all ${
                active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                active ? "bg-primary-container text-primary" : ""
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[11px] leading-tight text-center max-w-full truncate ${
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
