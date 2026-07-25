"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bell, User } from "lucide-react"

interface Props {
  isLoggedIn?: boolean
}

export function PublicBottomBar({ isLoggedIn }: Props) {
  const pathname = usePathname()

  const items = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
    },
    {
      label: "Notifikasi",
      href: isLoggedIn ? "/admin" : "/login",
      icon: Bell,
    },
    {
      label: "Saya",
      href: isLoggedIn ? "/pesanan-saya" : "/login",
      icon: User,
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface border-t border-outline-variant/30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="flex items-center justify-around mx-auto max-w-lg">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-16 px-1 transition-all ${
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
