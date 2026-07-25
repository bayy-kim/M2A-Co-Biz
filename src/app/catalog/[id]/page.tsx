import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { ShoppingBag, Store, ArrowLeft, ChevronRight } from "lucide-react"
import { PublicBottomBar } from "@/components/public-bottom-bar"

async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: { select: { businessName: true, type: true } }, category: true },
  })

  if (!product || product.status !== "ACTIVE") notFound()

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center px-lg h-16">
        <Link href="/catalog" className="flex items-center gap-2 text-label-md text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Katalog
        </Link>
      </header>

      <main className="px-gutter py-lg max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-lg">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/catalog" className="hover:text-primary">Katalog</Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>{product.category.name}</span>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-on-surface font-bold">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xxl">
          <div className="bg-surface-container-high rounded-xl h-96 flex items-center justify-center">
            {product.images.length > 0 ? (
              <img alt={product.title} className="w-full h-full object-cover rounded-xl" src={product.images[0]} />
            ) : (
              <ShoppingBag className="w-24 h-24 text-outline-variant" />
            )}
          </div>

          <div className="space-y-lg">
            <div>
              <h1 className="text-display-md text-on-surface font-bold mb-2">{product.title}</h1>
              {product.category && (
                <span className="inline-flex px-md py-1 bg-primary/10 text-primary rounded-full text-label-sm font-bold">{product.category.name}</span>
              )}
            </div>

            <p className="text-display-md text-primary font-bold">{formatRupiah(product.priceRupiah)}</p>

            <div className="bg-surface-container-low rounded-xl p-lg">
              <div className="flex items-center gap-3 mb-md">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-label-md font-bold text-on-surface">{product.seller.businessName}</p>
                  <p className="text-label-sm text-on-surface-variant">{product.seller.type === "UMKM" ? "UMKM" : "Penyedia Jasa"}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-headline-md text-on-surface font-bold mb-md">Deskripsi</h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{product.description}</p>
            </div>

            <Link
              href={`/checkout?productId=${product.id}`}
              className="block w-full text-center py-3.5 bg-accent-gold text-white rounded-xl text-headline-md font-bold shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Beli Sekarang
            </Link>
          </div>
        </div>
      </main>
      <PublicBottomBar />
    </div>
  )
}

export default ProductDetailPage
