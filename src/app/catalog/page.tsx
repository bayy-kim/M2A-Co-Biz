import { Search, ChevronLeft, ChevronRight, ShoppingBag, MessageCircle, Sparkles } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { CatalogFilterSort } from "./filter-sort"
import { PublicBottomBar } from "@/components/public-bottom-bar"

const ITEMS_PER_PAGE = 8

type SortOption = "newest" | "price_asc" | "price_desc"

async function CatalogPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; page?: string; sort?: string; minPrice?: string; maxPrice?: string }> }) {
  const params = await searchParams
  const query = params.q || ""
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

  const [total, products, company] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { seller: { select: { businessName: true } } },
      orderBy,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
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

  const buildQuery = (overrides: Record<string, string | undefined>) => {
    const qs: Record<string, string> = {}
    if (query && overrides.q !== "") qs.q = query
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
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-xl">
          <h1 className="text-display-md font-bold text-primary">M2A Co-Biz</h1>
          <form action="/catalog" method="GET" className="hidden md:flex relative items-center w-96">
            <Search className="absolute left-3 w-5 h-5 text-primary" />
            <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 transition-all text-body-md" defaultValue={query} name="q" placeholder="Cari produk..." type="text" />
          </form>
        </div>
        <div className="flex items-center gap-md">
          {session?.user ? (
            <Link href={getDashboardHref()} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all text-label-md">
              Dasbor
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all text-label-md">
              Masuk
            </Link>
          )}
        </div>
      </header>

      <main className="pt-20 pb-24 md:pb-8 px-gutter min-h-screen">
        <div className="md:hidden mb-lg">
          <h2 className="text-headline-lg text-primary mb-sm">Katalog</h2>
          <form action="/catalog" method="GET" className="relative items-center flex">
            <Search className="absolute left-3 w-5 h-5 text-primary" />
            <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-body-md" defaultValue={query} name="q" placeholder="Cari produk..." type="text" />
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
                  className={`whitespace-nowrap px-lg py-2 rounded-full text-label-md flex-shrink-0 ${
                    categoryFilter === cat || (!categoryFilter && cat === "Semua Kategori")
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary transition-colors"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          <div className="border-b border-outline-variant/20" />
        </section>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl text-center">
            <ShoppingBag className="w-16 h-16 text-primary mb-lg" />
            <p className="text-headline-md text-on-surface-variant">Produk tidak ditemukan</p>
            <p className="text-body-md text-on-surface-variant">Coba ubah kata kunci atau filter pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-gutter">
            {products.map((product) => (
              <Link key={product.id} href={`/catalog/${product.id}`} className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="relative h-36 sm:h-44 overflow-hidden bg-surface-container-high flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.images[0]} />
                  ) : (
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                  )}
                </div>
                <div className="p-md sm:p-lg flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-sm">
                    <h3 className="text-label-md sm:text-headline-md text-on-surface leading-tight line-clamp-2">{product.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-on-surface-variant text-label-xs sm:text-label-sm mb-xs truncate">
                      by <span className="text-primary font-bold truncate">{product.seller.businessName}</span>
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-headline-md sm:text-headline-lg text-primary truncate">{formatRupiah(product.priceRupiah)}</span>
                      <span className="bg-primary text-on-primary px-2 sm:px-md py-1 sm:py-2 rounded-lg text-label-xs sm:text-label-md whitespace-nowrap hover:opacity-90 transition-opacity">
                        Detail
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-xxl flex items-center justify-center gap-sm">
            {currentPage > 1 && (
              <Link href={buildQuery({ page: String(currentPage - 1) })} className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Link key={pageNum} href={buildQuery({ page: String(pageNum) })} className={`w-10 h-10 rounded-lg flex items-center justify-center text-label-md ${pageNum === currentPage ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"}`}>
                  {pageNum}
                </Link>
              )
            })}
            {currentPage < totalPages && (
              <Link href={buildQuery({ page: String(currentPage + 1) })} className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}

        <section className="mt-xxl pt-xxl border-t border-outline-variant/20">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-surface-container-low rounded-2xl p-lg md:p-xl text-center">
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
                className="inline-flex items-center gap-2 px-xl py-3 bg-success text-white rounded-xl text-label-md font-bold shadow-lg hover:brightness-110 active:scale-[0.97] transition-all"
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
                <Link key={product.id} href={`/catalog/${product.id}`} className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="relative h-36 sm:h-44 overflow-hidden bg-surface-container-high flex items-center justify-center">
                    {product.images.length > 0 ? (
                      <img alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={product.images[0]} />
                    ) : (
                      <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                    )}
                  </div>
                  <div className="p-md sm:p-lg flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-sm">
                      <h3 className="text-label-md sm:text-headline-md text-on-surface leading-tight line-clamp-2">{product.title}</h3>
                    </div>
                    <div className="mt-auto">
                      <p className="text-on-surface-variant text-label-xs sm:text-label-sm mb-xs truncate">
                        by <span className="text-primary font-bold truncate">{product.seller.businessName}</span>
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-headline-md sm:text-headline-lg text-primary truncate">{formatRupiah(product.priceRupiah)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicBottomBar isLoggedIn={!!session?.user} isSeller={session?.user?.role === "SELLER"} />
    </>
  )
}

export default CatalogPage
