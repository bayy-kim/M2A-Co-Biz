import { Search, ChevronLeft, ChevronRight, ShoppingBag, MessageCircle, Sparkles, Star } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { CatalogFilterSort } from "./filter-sort"
import { PublicBottomBar } from "@/components/public-bottom-bar"
import { Logo } from "@/components/logo"
import Image from "next/image"
import { PublicHeader } from "@/components/public-header"
import { AnimateStagger, AnimateItem, AnimateCard } from "@/components/animate-section"

const ITEMS_PER_PAGE = 8

type SortOption = "newest" | "price_asc" | "price_desc"

async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; search?: string; category?: string; page?: string; sort?: string; minPrice?: string; maxPrice?: string }> }) {
  const params = await searchParams
  const query = params.search || params.q || ""
  const categoryFilter = params.category || ""
  const sortParam = (params.sort || "newest") as SortOption
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined
  const currentPage = Math.max(1, Number(params.page) || 1)

  const dbCategories = await prisma.category.findMany({ where: { status: "APPROVED" }, orderBy: { name: "asc" } })
  const allCategories = ["Semua Kategori", ...dbCategories.map((c) => c.name)]

  const where: Record<string, unknown> = { status: "ACTIVE" }
  if (query) where.title = { contains: query, mode: "insensitive" }
  if (categoryFilter && categoryFilter !== "Semua Kategori") {
    const cat = await prisma.category.findFirst({ where: { name: categoryFilter } })
    if (cat) where.categoryId = cat.id
  }
  if (minPrice !== undefined) where.priceRupiah = { ...(where.priceRupiah as object || {}), gte: minPrice }
  if (maxPrice !== undefined) where.priceRupiah = { ...(where.priceRupiah as object || {}), lte: maxPrice }

  const orderBy: Record<string, string> =
    sortParam === "price_asc" ? { priceRupiah: "asc" } :
    sortParam === "price_desc" ? { priceRupiah: "desc" } :
    { createdAt: "desc" }

  // Perform standard query
  let products = await prisma.product.findMany({
    where,
    include: { 
      seller: { select: { businessName: true } },
      reviews: { select: { rating: true } }
    },
    orderBy,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  })

  let total = await prisma.product.count({ where })
  let isFuzzyResult = false

  // Fallback to fuzzy pg_trgm similarity search if standard search returns no results
  if (products.length === 0 && query.trim().length > 0) {
    try {
      // Find similar active products using raw SQL trigram similarity threshold (0.2)
      const fuzzyProducts = await prisma.$queryRaw<any[]>`
        SELECT p.*, s."businessName" as "sellerName"
        FROM "Product" p
        JOIN "SellerProfile" s ON p."sellerId" = s.id
        WHERE p.status = 'ACTIVE'
        AND similarity(p.title, ${query}) > 0.2
        ORDER BY similarity(p.title, ${query}) DESC
        LIMIT ${ITEMS_PER_PAGE};
      `

      if (fuzzyProducts.length > 0) {
        // Fetch reviews for fuzzy products
        const fuzzyIds = fuzzyProducts.map(p => p.id)
        const reviews = await prisma.review.findMany({
          where: { productId: { in: fuzzyIds } },
          select: { productId: true, rating: true }
        })

        products = fuzzyProducts.map((p) => ({
          id: p.id,
          sellerId: p.sellerId,
          categoryId: p.categoryId,
          title: p.title,
          description: p.description,
          priceRupiah: p.priceRupiah,
          images: p.images,
          status: p.status,
          variants: p.variants || [],
          createdAt: p.createdAt,
          seller: { businessName: p.sellerName },
          reviews: reviews.filter(r => r.productId === p.id)
        }))
        total = fuzzyProducts.length
        isFuzzyResult = true
      }
    } catch (e) {
      console.error("Fuzzy search error:", e)
    }
  }

  const [company] = await Promise.all([
    prisma.companyProfile.findFirst(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  const recommendationWhere: Record<string, unknown> = {
    status: "ACTIVE",
    id: { notIn: products.map((p) => p.id) },
  }
  if (categoryFilter && categoryFilter !== "Semua Kategori") {
    const cat = await prisma.category.findFirst({ where: { name: categoryFilter } })
    if (cat) recommendationWhere.categoryId = cat.id
  }
  const recommendations = await prisma.product.findMany({
    where: recommendationWhere,
    include: { seller: { select: { businessName: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  })

  const session = await auth()

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const qs: Record<string, string> = {}
    if (query && overrides.search !== "" && overrides.q !== "") qs.search = query
    if (categoryFilter && overrides.category !== "") qs.category = categoryFilter
    if (sortParam !== "newest") qs.sort = sortParam
    if (minPrice !== undefined) qs.minPrice = String(minPrice)
    if (maxPrice !== undefined) qs.maxPrice = String(maxPrice)
    if (currentPage > 1) qs.page = String(currentPage)
    Object.entries(overrides).forEach(([k, v]) => { if (v !== undefined) qs[k] = v })
    return `/catalog?${new URLSearchParams(qs).toString()}`
  }

  return (
    <>
      <PublicHeader session={session} showSearch={true} searchQuery={query} />

      <main className="pt-20 pb-24 md:pb-8 px-gutter min-h-screen" style={{background:"var(--color-clay-bg)"}}>
        <div className="md:hidden mb-lg">
          <h2 className="text-headline-lg text-primary mb-sm">Katalog</h2>
          <form action="/catalog" method="GET" className="relative items-center flex">
            <label htmlFor="mobileSearchInput" className="sr-only">Cari produk dan jasa</label>
            <Search className="absolute left-3 w-5 h-5 text-primary" />
            <input id="mobileSearchInput" className="clay-input w-full pl-10 pr-4 py-3 text-body-md font-inter" defaultValue={query} name="search" placeholder="Cari produk..." type="text" />
          </form>
        </div>

        <section className="space-y-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg">
            <div>
              <h2 className="hidden md:block text-display-md text-on-surface mb-xs">Katalog Produk</h2>
              <p className="text-on-surface-variant text-body-md">Temukan produk dan jasa terbaik dari komunitas kami.</p>
            </div>
            <CatalogFilterSort
              sortParam={sortParam}
              minPrice={minPrice}
              maxPrice={maxPrice}
              query={query}
              categoryFilter={categoryFilter}
            />
          </div>

          {allCategories.length > 1 && (
            <div className="flex items-center gap-sm overflow-x-auto pb-1 no-scrollbar">
              {allCategories.map((cat) => (
                <Link
                  key={cat}
                  href={buildQuery({ category: cat === "Semua Kategori" ? "" : cat, page: undefined })}
                  className={`${categoryFilter === cat || (!categoryFilter && cat === "Semua Kategori")
                      ? "chip-clay active"
                      : "chip-clay"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          <div className="h-px clay-lite" />
        </section>

        {isFuzzyResult && (
          <div className="mb-lg p-lg bg-primary/5 border border-primary/20 rounded-2xl text-body-md text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold shrink-0" />
            <span>Pencarian tepat tidak ditemukan. Menampilkan hasil kemiripan ejaan untuk <strong>&quot;{query}&quot;</strong>:</span>
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl text-center">
            <ShoppingBag className="w-16 h-16 text-primary mb-lg" />
            <p className="text-headline-md text-on-surface-variant">Produk tidak ditemukan</p>
            <p className="text-body-md text-on-surface-variant">Coba ubah kata kunci atau filter pencarian.</p>
          </div>
        ) : (
          <AnimateStagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-gutter">
            {products.map((product) => (
              <AnimateItem key={product.id}>
                <AnimateCard>
                  <Link href={`/catalog/${product.id}`} className="clay-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-36 sm:h-44 overflow-hidden bg-surface-container-high flex items-center justify-center">
                      {product.images.length > 0 ? (
                        <Image alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.images[0]} width={400} height={400} loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                      )}
                    </div>
                    <div className="p-md sm:p-lg flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-sm">
                        <h3 className="text-label-md sm:text-body-lg font-semibold text-on-surface leading-tight line-clamp-2">{product.title}</h3>
                      </div>
                      
                      {/* Rating Star Badge under title */}
                      {product.reviews && product.reviews.length > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3.5 h-3.5 text-accent-gold fill-accent-gold" />
                          <span className="text-[11px] font-bold text-on-surface">
                            {(product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length).toFixed(1)}
                          </span>
                          <span className="text-[11px] text-on-surface-variant">
                            ({product.reviews.length})
                          </span>
                        </div>
                      )}

                      <div className="mt-auto">
                        <p className="text-on-surface-variant text-label-xs sm:text-label-sm mb-xs truncate">
                          by <span className="text-primary font-bold truncate">{product.seller.businessName}</span>
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-body-lg sm:text-headline-md font-bold text-primary truncate">{formatRupiah(product.priceRupiah)}</span>
                          <span className="btn-clay text-label-sm sm:text-label-md !px-3 !py-2 sm:!px-md sm:!py-2 whitespace-nowrap min-h-[44px]">
                            Detail
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimateCard>
              </AnimateItem>
            ))}
          </AnimateStagger>
        )}

        {totalPages > 1 && (
          <div className="mt-xxl flex items-center justify-center gap-sm">
            {currentPage > 1 && (
              <Link href={buildQuery({ page: String(currentPage - 1) })} className="w-10 h-10 clay-pill flex items-center justify-center text-on-surface-variant">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Link key={pageNum} href={buildQuery({ page: String(pageNum) })} className={`w-10 h-10 text-label-md flex items-center justify-center ${pageNum === currentPage ? "clay-pill bg-primary text-on-primary" : "clay-pill text-on-surface-variant"}`}>
                  {pageNum}
                </Link>
              )
            })}
            {currentPage < totalPages && (
              <Link href={buildQuery({ page: String(currentPage + 1) })} className="w-10 h-10 clay-pill flex items-center justify-center text-on-surface-variant">
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}

        <section className="mt-xxl pt-xxl border-t border-outline-variant/20">
          <div className="max-w-2xl mx-auto clay-lg p-lg md:p-xl text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-md">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-headline-md text-primary font-bold mb-sm">Butuh Bantuan?</h3>
            <p className="text-body-md text-on-surface-variant mb-lg max-w-md mx-auto">
              Ada pertanyaan tentang produk atau pesanan? Tim kami siap membantu Anda.
            </p>
            {company?.whatsappNumber && (
              <a
                href={`https://wa.me/${company.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-clay px-xl py-3 text-label-md font-bold !bg-success !text-white hover:brightness-110 active:scale-[0.97] transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Hubungi via WhatsApp
              </a>
            )}
          </div>
        </section>

        {recommendations.length > 0 && (
          <section className="mt-xxl pt-xxl border-t border-outline-variant/20" id="rekomendasi">
            <div className="flex items-center gap-2 mb-lg">
              <Sparkles className="w-5 h-5 text-accent-gold" />
              <h3 className="text-headline-md text-on-surface font-bold">Produk Lainnya untuk Kamu</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-gutter">
              {recommendations.map((product) => (
                <Link href={`/catalog/${product.id}`} className="clay-sm overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="relative h-36 sm:h-44 overflow-hidden bg-surface-container-high flex items-center justify-center">
                    {product.images.length > 0 ? (
                      <Image alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.images[0]} width={400} height={400} loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" />
                    ) : (
                      <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    )}
                  </div>
                  <div className="p-md sm:p-lg flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-sm">
                      <h3 className="text-label-md sm:text-body-lg font-semibold text-on-surface leading-tight line-clamp-2">{product.title}</h3>
                    </div>
                    <div className="mt-auto">
                      <p className="text-on-surface-variant text-label-xs sm:text-label-sm mb-xs truncate">
                        by <span className="text-primary font-bold truncate">{product.seller.businessName}</span>
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-body-lg sm:text-headline-md font-bold text-primary truncate">{formatRupiah(product.priceRupiah)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicBottomBar isLoggedIn={!!session?.user} role={session?.user?.role} isSeller={session?.user?.role === "SELLER"} />
    </>
  )
}

export default CatalogPage
