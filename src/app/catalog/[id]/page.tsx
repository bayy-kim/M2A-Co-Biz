import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { ShoppingBag, Store, ArrowLeft, ChevronRight, ShieldCheck, Heart, Sparkles, Star } from "lucide-react"
import { PublicBottomBar } from "@/components/public-bottom-bar"
import { PublicHeader } from "@/components/public-header"
import { ShareButton } from "@/components/share-button"

async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, auth()])
  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      seller: { select: { businessName: true, type: true } }, 
      category: true,
      variants: true,
      reviews: {
        include: {
          buyer: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    },
  })

  if (!product || product.status !== "ACTIVE") notFound()

  // Calculate average rating
  const totalReviews = product.reviews.length
  const avgRating = totalReviews > 0
    ? (product.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalReviews).toFixed(1)
    : null

  return (
    <div className="min-h-screen" style={{background:"var(--color-clay-bg)"}}>
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
            <div className="clay-lg aspect-[4/3] sm:aspect-video lg:aspect-square flex items-center justify-center overflow-hidden relative group">
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
            
            {/* Gallery collection display */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-sm">
                {product.images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`clay-sm overflow-hidden ${idx === 0 ? "ring-2 ring-primary" : ""} aspect-square`}
                  >
                    <img src={img} alt={`${product.title} foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
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
              <div className="flex items-center gap-md flex-wrap">
                <span className="inline-flex items-center gap-1 text-label-sm text-success font-bold">
                  <ShieldCheck className="w-4 h-4" /> Binaan Al-Mubarok II
                </span>
                {avgRating && (
                  <span className="chip-clay gold inline-flex items-center gap-1 text-label-sm font-bold">
                    <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
                    {avgRating} &middot; {totalReviews} Ulasan
                  </span>
                )}
              </div>
            </div>

            <div className="clay-lg p-xl space-y-md">
                <p className="text-label-sm text-on-surface-variant font-medium uppercase tracking-wider">Harga Terbaik</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-display-md sm:text-display-lg text-primary font-bold">{formatRupiah(product.priceRupiah)}</p>
                </div>
                
                {/* Product Variants selector in catalog detail */}
                {product.variants && product.variants.length > 0 && (
                  <div className="pt-md border-t border-outline-variant/20">
                    <p className="text-label-sm text-on-surface font-bold mb-2">Varian Tersedia:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <span key={v.name} className="chip-clay font-semibold">
                          {v.name} {v.stock <= 3 && v.stock > 0 ? <span className="text-amber-600 font-bold">(Sisa {v.stock})</span> : v.stock === 0 ? <span className="text-error font-bold">(Habis)</span> : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            {/* Seller profile card */}
            <div className="clay-lg p-xl flex items-center justify-between">
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

            {/* Description */}
            <div className="space-y-sm">
              <h3 className="text-headline-md text-on-surface font-bold">Deskripsi Produk</h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line clay-sm p-lg">
                {product.description}
              </p>
            </div>

            {/* Product Reviews Display */}
            <div className="space-y-md pt-lg border-t border-outline-variant/20">
              <h3 className="text-headline-md text-on-surface font-bold">Ulasan Pembeli ({totalReviews})</h3>
              
              {product.reviews.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant italic">Belum ada ulasan dari pembeli asli.</p>
              ) : (
                <div className="space-y-md">
                  {product.reviews.map((rev) => {
                    const maskedName = rev.buyer.name 
                      ? `${rev.buyer.name.split(" ")[0]} ${rev.buyer.name.split(" ")[1]?.slice(0, 1) || ""}.` 
                      : "Pembeli Asli"
                    return (
                      <div key={rev.id} className="clay-sm p-md space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-label-md font-bold text-on-surface">{maskedName}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3.5 h-3.5 ${
                                   idx < Number(rev.rating)
                                    ? "text-accent-gold fill-accent-gold"
                                    : "text-outline-variant/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.comment && <p className="text-body-md text-on-surface-variant leading-relaxed">{rev.comment}</p>}
                        <p className="text-[10px] text-on-surface-variant/70 text-right">
                          {new Date(rev.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Buy / CTA Button + Share */}
            <div className="pt-4 flex gap-md">
              <Link
                href={`/checkout?productId=${product.id}`}
                className="btn-clay-gold flex-1 py-4 text-headline-md font-bold hover:brightness-110 active:scale-[0.98] transition-all duration-200 text-center flex items-center justify-center gap-sm outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
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
