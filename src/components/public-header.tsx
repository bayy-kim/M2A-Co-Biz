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
    if (role === "BUYER") return "/pesanan-saya"
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
            <Search className="absolute left-3 w-4 h-4 text-primary" />
            <input 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl pl-9 pr-4 py-2 text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
              defaultValue={searchQuery} 
              name="search" 
              placeholder="Cari produk & jasa..." 
              type="text" 
            />
          </form>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-xxl" aria-label="Navigasi Publik Desktop">
        <Link 
          href="/" 
          aria-label="Halaman Beranda M2A Co-Biz"
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
          aria-label="Katalog Produk dan Jasa"
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
          aria-label="Tentang Al-Mubarok II"
          className="py-1 text-body-md text-on-surface-variant hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          Tentang
        </Link>
        
        <Link 
          href="/#location" 
          aria-label="Kontak dan Lokasi Kami"
          className="py-1 text-body-md text-on-surface-variant hover:text-primary transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
        >
          Kontak
        </Link>
      </nav>

      <div className="flex items-center gap-md">
        {session?.user ? (
          <Link 
            href={getDashboardHref()} 
            className="p-[1px] rounded-full bg-gradient-to-b from-primary to-primary-container hover:shadow-md transition-all active:scale-95 group"
          >
            <span className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-label-md font-bold transition-all group-hover:bg-primary-container min-h-[44px]">
              Dasbor
            </span>
          </Link>
        ) : (
          <>
            <Link
              href="/register"
              className="px-5 py-2.5 text-label-md font-bold text-on-surface-variant hover:text-primary transition-all min-h-[44px] flex items-center"
            >
              Daftar
            </Link>
            <Link 
              href="/login" 
              className="p-[1px] rounded-full bg-gradient-to-b from-primary to-primary-container hover:shadow-md transition-all active:scale-95 group"
            >
              <span className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-label-md font-bold transition-all group-hover:bg-primary-container min-h-[44px]">
                Masuk
              </span>
            </Link>
          </>
        )}

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors focus-visible:ring-2 focus-visible:ring-primary outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 shadow-lg md:hidden z-50 animate-slide-in">
          <nav className="flex flex-col px-lg py-md gap-xs">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-xl text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Beranda</Link>
            <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-xl text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Katalog</Link>
            <Link href="/#about" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-xl text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Tentang</Link>
            <Link href="/#location" onClick={() => setMobileMenuOpen(false)} className="py-3 px-md rounded-xl text-body-md text-on-surface hover:bg-surface-container transition-colors min-h-[44px] flex items-center">Kontak</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
