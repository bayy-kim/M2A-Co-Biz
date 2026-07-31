"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { Search, Menu, X } from "lucide-react"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDashboardHref = () => {
    if (!session?.user?.role) return "/login"
    const role = session.user.role
    if (role === "ADMIN") return "/admin"
    if (role === "BENDAHARA") return "/bendahara"
    if (role === "KETUA") return "/ketua"
    if (role === "SELLER") return "/seller"
    if (role === "BUYER") return "/dashboard-buyer"
    return "/catalog"
  }

  const isBerandaActive = pathname === "/"
  const isKatalogActive = pathname.startsWith("/catalog")

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-[var(--header-height)] bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-xs relative">
      <div className="flex items-center gap-xl">
        <Logo size="sm" />
        
        {showSearch && (
          <form action="/catalog" method="GET" className="hidden md:flex relative items-center w-80">
            <Search className="absolute left-3 w-4 h-4 text-on-surface-variant" />
            <input 
              className="clay-input w-full pl-9 pr-4 py-2 text-body-md font-inter" 
              defaultValue={searchQuery} 
              name="search" 
              placeholder="Cari produk & jasa..." 
              type="text" 
            />
          </form>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-lg clay-pill px-2 py-1.5" aria-label="Navigasi Publik Desktop" style={{boxShadow:"var(--shadow-clay-sm)"}}>
        <Link 
          href="/" 
          aria-label="Halaman Beranda M2A Co-Biz"
          className={`px-4 py-1.5 text-body-md font-medium transition-all duration-200 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isBerandaActive 
              ? "bg-primary text-on-primary font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.15)]" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Beranda
        </Link>
        
        <Link 
          href="/catalog" 
          aria-label="Katalog Produk dan Jasa"
          className={`px-4 py-1.5 text-body-md font-medium transition-all duration-200 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isKatalogActive 
              ? "bg-primary text-on-primary font-bold shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.15)]" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Katalog
        </Link>
        
        <Link 
          href="/#about" 
          aria-label="Tentang Al-Mubarok II"
          className="px-4 py-1.5 text-body-md text-on-surface-variant hover:text-primary font-medium transition-all duration-200 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Tentang
        </Link>
        
        <Link 
          href="/#location" 
          aria-label="Kontak dan Lokasi Kami"
          className="px-4 py-1.5 text-body-md text-on-surface-variant hover:text-primary font-medium transition-all duration-200 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Kontak
        </Link>
      </nav>

      <div className="flex items-center gap-md">
        {session?.user ? (
          <Link 
            href={getDashboardHref()} 
            className="btn-clay text-sm px-5 py-2.5 min-h-[44px]"
          >
            Dasbor
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="btn-clay-outline text-sm min-h-[44px]"
            >
              Daftar
            </Link>
            <Link 
              href="/login" 
              className="btn-clay text-sm min-h-[44px]"
            >
              Masuk
            </Link>
          </>
        )}

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-[14px] text-on-surface-variant hover:bg-clay-surface transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{background:"var(--color-clay-surface)"}}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-clay-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-lg md:hidden z-50 animate-slide-in">
          <nav className="flex flex-col px-lg py-md gap-xs">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-[14px] text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Beranda</Link>
            <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-[14px] text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Katalog</Link>
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-[14px] text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Tentang</Link>
            <Link href="/#location" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-[14px] text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Kontak</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
