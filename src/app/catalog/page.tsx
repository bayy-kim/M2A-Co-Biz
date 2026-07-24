import { Search, SlidersHorizontal, ArrowUpDown, Heart, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"

const FALLBACK_CATEGORIES = [
  "All Categories", "Food & Beverages", "Handicraft", "Professional Services", "Apparel",
  "Home Decor", "Digital Goods", "Kesehatan & Herbal", "Kriya & Dekorasi", "Fashion & Tekstil", "Perawatan Tubuh",
]

const ITEMS_PER_PAGE = 8

async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const query = params.q || ""
  const categoryFilter = params.category || ""
  const currentPage = Math.max(1, Number(params.page) || 1)

  const dbCategories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  const allCategories = [
    "All Categories",
    ...dbCategories.map((c) => c.name),
    ...FALLBACK_CATEGORIES.filter((c) => c !== "All Categories" && !dbCategories.some((db) => db.name === c)),
  ]

  const where: Record<string, unknown> = { status: "ACTIVE" }
  if (query) where.title = { contains: query, mode: "insensitive" }
  if (categoryFilter && categoryFilter !== "All Categories") {
    const cat = await prisma.category.findFirst({ where: { name: categoryFilter } })
    if (cat) where.categoryId = cat.id
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { seller: { select: { businessName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface shadow-sm">
        <div className="flex items-center gap-xl">
          <h1 className="text-display-md font-bold text-primary">M2A Co-Biz</h1>
          <form action="/catalog" method="GET" className="hidden md:flex relative items-center w-96">
            <Search className="absolute left-3 w-5 h-5 text-outline" />
            <input
              className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 transition-all text-body-md"
              defaultValue={query}
              name="q"
              placeholder="Search catalog..."
              type="text"
            />
          </form>
        </div>
        <div className="flex items-center gap-md">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-full hover:opacity-90 transition-all text-label-md"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-24 md:pb-8 px-gutter min-h-screen">
        <div className="md:hidden mb-lg">
          <h2 className="text-headline-lg text-primary mb-sm">Catalog</h2>
          <form action="/catalog" method="GET" className="relative items-center flex">
            <Search className="absolute left-3 w-5 h-5 text-outline" />
            <input
              className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all text-body-md"
              defaultValue={query}
              name="q"
              placeholder="Search products..."
              type="text"
            />
          </form>
        </div>

        <section className="mb-xxl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-lg">
            <div>
              <h2 className="hidden md:block text-display-md text-on-surface mb-xs">Product Catalog</h2>
              <p className="text-on-surface-variant text-body-md">Discover premium goods and services from our community.</p>
            </div>
            <div className="flex items-center gap-sm">
              <button className="flex items-center gap-xs px-md py-2 bg-surface-container border border-outline-variant rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <SlidersHorizontal className="w-[18px] h-[18px]" />
                Filter
              </button>
              <button className="flex items-center gap-xs px-md py-2 bg-surface-container border border-outline-variant rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <ArrowUpDown className="w-[18px] h-[18px]" />
                Sort
              </button>
            </div>
          </div>

          <div className="flex items-center gap-sm overflow-x-auto pb-4 no-scrollbar">
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={`/catalog?${new URLSearchParams(categoryFilter === cat ? {} : { ...(query ? { q: query } : {}), category: cat === "All Categories" ? "" : cat }).toString()}`}
                className={`whitespace-nowrap px-lg py-2 rounded-full text-label-md ${
                  categoryFilter === cat || (!categoryFilter && cat === "All Categories")
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container border border-outline-variant text-on-surface-variant hover:border-primary transition-colors"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl text-center">
            <ShoppingBag className="w-16 h-16 text-outline-variant mb-lg" />
            <p className="text-headline-md text-on-surface-variant">No products found</p>
            <p className="text-body-md text-on-surface-variant">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-48 overflow-hidden bg-surface-container-high flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      src={product.images[0]}
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-outline-variant" />
                  )}
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-on-surface hover:text-danger transition-colors">
                      <Heart className="w-[20px] h-[20px]" />
                    </button>
                  </div>
                </div>
                <div className="p-lg flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-sm">
                    <h3 className="text-headline-md text-on-surface leading-tight">{product.title}</h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-on-surface-variant text-label-sm mb-xs">
                      by <span className="text-primary font-bold">{product.seller.businessName}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-headline-lg text-primary">{formatRupiah(product.priceRupiah)}</span>
                      <button className="bg-primary-container text-on-primary-container px-md py-2 rounded-lg text-label-md hover:opacity-90 transition-opacity">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-xxl flex items-center justify-center gap-sm">
            {currentPage > 1 && (
              <Link
                href={`/catalog?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(categoryFilter ? { category: categoryFilter } : {}), page: String(currentPage - 1) }).toString()}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1
              return (
                <Link
                  key={pageNum}
                  href={`/catalog?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(categoryFilter ? { category: categoryFilter } : {}), page: String(pageNum) }).toString()}`}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-label-md ${
                    pageNum === currentPage
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
            {currentPage < totalPages && (
              <Link
                href={`/catalog?${new URLSearchParams({ ...(query ? { q: query } : {}), ...(categoryFilter ? { category: categoryFilter } : {}), page: String(currentPage + 1) }).toString()}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}
      </main>
    </>
  )
}

export default CatalogPage
