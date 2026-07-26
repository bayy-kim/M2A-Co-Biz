import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { ShoppingBag, Store, ArrowLeft, ChevronRight, ShieldCheck, Heart, Sparkles } from "lucide-react"
import { PublicBottomBar } from "@/components/public-bottom-bar"
import { PublicHeader } from "@/components/public-header"
import { ShareButton } from "@/components/share-button"

async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, auth()])
  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: { select: { businessName: true, type: true } }, category: true },
  })

  if (!product || product.status !== "ACTIVE") notFound()

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader session={session} />
      <main className="px-gutter pt-20 py-lg max-w-6xl mx-auto pb-32 lg:pb-16">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-lg overflow-x-auto no-scrollbar py-1">
          <Link href="/" className="hover:text-primary transition-colors whitespace-nowrap">Beranda</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <Link href="/catalog" className="hover:text-primary transition-colors whitespace-nowrap">Katalog</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{product.category.name}</span>
            </>
          )}
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-on-surface font-bold truncate max-w-[150px] sm:max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-xxl">
          {/* Images Section */}
          <div className="lg:col-span-7 space-y-md">
            <div className="bg-surface-container-high rounded-3xl aspect-[4/3] sm:aspect-video lg:aspect-square flex items-center justify-center overflow-hidden border border-outline-variant/20 shadow-xs relative group">
              {product.images.length > 0 ? (
                <img 
                  alt={product.title} 
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                  src={product.images[0]} 
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <ShoppingBag className="w-20 h-20 text-outline-variant" />
                  <span className="text-label-sm text-on-surface-variant font-medium">Tidak ada foto</span>
                </div>
              )}
              {product.category && (
                <div className="absolute top-4 left-4 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-full text-label-sm font-bold shadow-xs">
                  {product.category.name}
                </div>
              )}
            </div>
            
            {/* Gallery thumbnails fallback (jika ada lebih dari 1 gambar) */}
            {product.images.length > 1 && (
              <div className="flex gap-sm overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${idx === 0 ? "border-primary" : "border-outline-variant/30"}`}
                  >
                    <img src={img} alt={`${product.title} preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Details Section */}
          <div className="lg:col-span-5 space-y-xl">
            <div className="space-y-sm">
              <h1 className="text-display-md sm:text-display-lg text-on-surface font-bold tracking-tight leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-label-sm text-success font-bold">
                  <ShieldCheck className="w-4 h-4" /> Binaan Al-Mubarok II
                </span>
              </div>
            </div>

            <div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
              <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-lowest p-xl border border-outline-variant/10 shadow-xs space-y-md">
                <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Harga Terbaik</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-display-md sm:text-display-lg text-primary font-bold">{formatRupiah(product.priceRupiah)}</p>
                </div>
              </div>
            </div>

            {/* Seller profile card */}
            <div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
              <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-low p-xl border border-outline-variant/10 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface leading-snug">{product.seller.businessName}</p>
                    <p className="text-label-sm text-on-surface-variant">{product.seller.type === "UMKM" ? "UMKM Mitra" : "Penyedia Jasa Mitra"}</p>
                  </div>
                </div>
                <Link 
                  href={`/catalog?search=${encodeURIComponent(product.seller.businessName)}`}
                  className="text-label-sm text-primary font-bold hover:underline"
                >
                  Lihat Toko
                </Link>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-sm">
              <h3 className="text-headline-md text-on-surface font-bold">Deskripsi Produk</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface-container-lowest p-lg rounded-2xl border border-outline-variant/10">
                {product.description}
              </p>
            </div>

            {/* Buy / CTA Button + Share */}
            <div className="pt-4 flex gap-md">
              <Link
                href={`/checkout?productId=${product.id}`}
                className="flex-1 py-4 bg-accent-gold text-white rounded-2xl text-headline-md font-bold shadow-lg shadow-accent-gold/20 hover:brightness-110 active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center gap-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
              >
                <Sparkles className="w-5 h-5" />
                Beli Sekarang
              </Link>
              <ShareButton />
            </div>
          </div>
        </div>
      </main>
      <PublicBottomBar isLoggedIn={!!session?.user} isSeller={session?.user?.role === "SELLER"} role={session?.user?.role} />
    </div>
  )
}

export default ProductDetailPage
