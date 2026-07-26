import Link from "next/link"
import { SearchSlash, Home, Store, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-gutter">
      <div className="max-w-md mx-auto text-center space-y-lg">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <SearchSlash className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-display-lg text-primary font-bold">404</h1>
        <p className="text-headline-md text-on-surface font-semibold">Halaman Tidak Ditemukan</p>
        <p className="text-body-md text-on-surface-variant">
          Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak tersedia.
        </p>
        <div className="flex flex-col sm:flex-row gap-md justify-center pt-md">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white rounded-xl text-label-md font-bold hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 border border-outline-variant text-on-surface rounded-xl text-label-md font-bold hover:bg-surface-container-higher active:scale-[0.98] transition-all"
          >
            <Store className="w-4 h-4" />
            Katalog
          </Link>
        </div>
        <Link
          href="javascript:history.back()"
          className="inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary transition-colors mt-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke halaman sebelumnya
        </Link>
      </div>
    </div>
  )
}
