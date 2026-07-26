"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Store, ShoppingBag, Bell } from "lucide-react"

interface Props {
  isLoggedIn?: boolean
  isSeller?: boolean
  role?: string
}

export function PublicBottomBar({ isLoggedIn, isSeller, role }: Props) {
  const pathname = usePathname()

  // Dynamic notification target based on role
  const getNotificationHref = () => {
    if (!isLoggedIn) return "/login"
    if (role === "ADMIN") return "/admin?tab=approvals"
    if (role === "BENDAHARA") return "/bendahara?tab=payments"
    if (role === "KETUA") return "/ketua?tab=activity"
    if (role === "SELLER") return "/seller?tab=sales"
    return "/pesanan-saya"
  }

  const items = [
    {
      label: "Beranda",
      href: "/catalog", // Diretas langsung ke katalog sesuai permintaan user
      icon: LayoutGrid,
    },
    {
      label: "Notifikasi",
      href: getNotificationHref(),
      icon: Bell,
      hasBadge: true,
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
    <nav 
      className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigasi Publik Mobile"
    >
      <div className="flex items-center justify-around mx-auto max-w-lg overflow-x-auto no-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/catalog" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-0 flex-shrink-0 h-16 w-16 px-1 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className={`relative flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 ${
                active ? "bg-primary-container text-primary" : "hover:bg-surface-container-high"
              }`}>
                <Icon className="w-5 h-5" />
                {item.hasBadge && (
                  <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-error animate-pulse" />
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
  )
}
