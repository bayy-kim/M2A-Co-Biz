"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Search } from "lucide-react"

interface PublicHeaderProps {
  session?: {
    user?: {
      role?: string
    }
  } | null
  showSearch?: boolean
  searchQuery?: string
}

export function PublicHeader({ session, showSearch = false, searchQuery = "" }: PublicHeaderProps) {
  const pathname = usePathname()

  const getDashboardHref = () => {
    if (!session?.user?.role) return "/login"
    const role = session.user.role
    if (role === "ADMIN") return "/admin"
    if (role === "BENDAHARA") return "/bendahara"
    if (role === "KETUA") return "/ketua"
    if (role === "SELLER") return "/seller"
    if (role === "BUYER") return "/pesanan-saya"
    return "/catalog"
  }

  const isBerandaActive = pathname === "/"
  const isKatalogActive = pathname.startsWith("/catalog")

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs">
      <div className="flex items-center gap-xl">
        <Logo size="sm" />
        
        {showSearch && (
          <form action="/catalog" method="GET" className="hidden md:flex relative items-center w-80">
            <Search className="absolute left-3 w-4 h-4 text-primary" />
            <input 
              className="w-full bg-surface-container-low border-none rounded-xl pl-9 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
              defaultValue={searchQuery} 
              name="q" 
              placeholder="Cari produk & jasa..." 
              type="text" 
            />
          </form>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-xxl" aria-label="Navigasi Publik Desktop">
        <Link 
          href="/" 
          className={`py-1 text-body-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md ${
            isBerandaActive 
              ? "text-primary font-bold border-b-2 border-primary" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Beranda
        </Link>
        
        <Link 
          href="/catalog" 
          className={`py-1 text-body-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md ${
            isKatalogActive 
              ? "text-primary font-bold border-b-2 border-primary" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Katalog
        </Link>
        
        <Link 
          href="/#about" 
          className="py-1 text-body-md text-on-surface-variant hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          Tentang
        </Link>
        
        <Link 
          href="/#location" 
          className="py-1 text-body-md text-on-surface-variant hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          Kontak
        </Link>
      </nav>

      <div className="flex items-center gap-md">
        {session?.user ? (
          <Link 
            href={getDashboardHref()} 
            className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 active:scale-95 transition-all text-label-md font-bold shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Dasbor
          </Link>
        ) : (
          <Link 
            href="/login" 
            className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 active:scale-95 transition-all text-label-md font-bold shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Masuk
          </Link>
        )}
      </div>
    </header>
  )
}
