import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { ShoppingBag, ArrowLeft, ChevronRight, QrCode, Banknote, Truck, CheckCircle } from "lucide-react"
import { CheckoutForm } from "./checkout-form"

async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; orderId?: string }>
}) {
  const [params, session] = await Promise.all([searchParams, auth()])

  if (params.orderId) {
    const [order, company] = await Promise.all([
      prisma.order.findUnique({
        where: { id: params.orderId },
        include: { items: true },
      }),
      prisma.companyProfile.findFirst(),
    ])
    if (!order) redirect("/catalog")

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-gutter">
        <div className="bg-surface-container-lowest rounded-xl p-xxl max-w-md w-full text-center border border-outline-variant/30 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-lg">
            <ShoppingBag className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-headline-lg text-primary font-bold mb-2">Pesanan Dibuat!</h1>
          <p className="text-body-md text-on-surface-variant mb-lg">
            Pesanan <span className="font-bold text-on-surface">#{order.id.slice(0, 8)}</span> telah tercatat.
          </p>
          <div className="bg-surface-container-low rounded-lg p-lg mb-lg text-left space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-label-md">
                <span className="text-on-surface-variant">Produk x{item.qty}</span>
                <span className="text-on-surface font-bold">{formatRupiah(item.priceRupiah * item.qty)}</span>
              </div>
            ))}
            <div className="border-t border-outline-variant/30 pt-2 flex justify-between text-label-md font-bold">
              <span className="text-on-surface">Total</span>
              <span className="text-primary">{formatRupiah(order.totalRupiah)}</span>
            </div>
          </div>

             {order.paymentMethod === "COD" ? (
              <div className="bg-success/5 border border-success/20 rounded-lg p-lg mb-lg text-left">
                <h3 className="text-label-md font-bold text-on-surface mb-md flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-success" />
                  Metode Pembayaran: COD (Bayar di Tempat)
                </h3>
                <div className="bg-surface-container-lowest rounded-lg p-md mb-md flex items-center gap-3 border border-outline-variant/20">
                  <Truck className="w-8 h-8 text-success shrink-0" />
                  <p className="text-label-sm text-on-surface-variant">
                    Pesanan Anda telah diteruskan ke Penjual. Pembayaran tunai sebesar <span className="font-bold text-primary">{formatRupiah(order.totalRupiah)}</span> dilakukan saat barang/jasa sampai atau dikerjakan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-lg mb-lg text-left">
                <h3 className="text-label-md font-bold text-on-surface mb-md flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Petunjuk Pembayaran
                </h3>
                <div className="bg-surface-container-lowest rounded-lg p-md mb-md flex items-center justify-center border border-outline-variant/20">
                  <img
                    src={company?.qrisImageUrl || "/images/qris-placeholder.svg"}
                    alt="QRIS Payment"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                {company?.bankName && (
                  <div className="space-y-2 text-label-sm">
                    <p className="text-on-surface font-bold">Transfer Bank</p>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Bank</span>
                      <span className="text-on-surface font-bold">{company.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">No. Rekening</span>
                      <span className="text-on-surface font-bold">{company.bankAccountNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Atas Nama</span>
                      <span className="text-on-surface font-bold">{company.bankAccountName}</span>
                    </div>
                  </div>
                )}
                <p className="text-label-sm text-on-surface-variant mt-md">
                  Scan QRIS atau transfer ke rekening di atas.
                </p>

                {/* Proof of Payment Upload Form */}
                <div className="mt-lg pt-lg border-t border-outline-variant/30">
                  <p className="text-label-sm font-bold text-on-surface mb-sm">Unggah Bukti Transfer (Pencegahan Pembayaran Palsu)</p>
                  
                  {order.paymentProofUrl ? (
                    <div className="p-md bg-success/10 border border-success/30 text-success rounded-xl text-label-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Bukti transfer berhasil diunggah. Menunggu konfirmasi dari Bendahara.</span>
                    </div>
                  ) : (
                    <form action={async (fd) => {
                      "use server"
                      const file = fd.get("proof") as File
                      if (file && file.size > 0) {
                        try {
                          const { put } = await import("@vercel/blob")
                          const uniqueName = `proof-${order.id}-${Date.now()}`
                          const blob = await put(uniqueName, file, { access: "public" })
                          
                          await prisma.order.update({
                            where: { id: order.id },
                            data: { paymentProofUrl: blob.url }
                          })
                          
                          const { revalidatePath } = await import("next/cache")
                          revalidatePath("/checkout")
                        } catch (err) {
                          console.error("Proof upload error:", err)
                        }
                      }
                    }} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input name="proof" type="file" accept="image/jpeg,image/png" required className="text-label-sm w-full border border-outline-variant/50 p-2 rounded-lg bg-surface" />
                        <button type="submit" className="px-lg py-2 bg-primary text-on-primary rounded-lg text-label-sm font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap min-h-[44px]">
                          Kirim Bukti
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

          <p className="text-label-sm text-on-surface-variant mb-lg">
            Kami akan menghubungi Anda di {order.buyerPhone} setelah pembayaran dikonfirmasi.
          </p>
          <Link href="/catalog" className="block w-full py-3 bg-primary text-on-primary rounded-lg text-label-md font-bold text-center hover:opacity-90 transition-opacity">
            Lanjut Belanja
          </Link>
        </div>
      </div>
    )
  }

  if (!params.productId) redirect("/catalog")

  const userInfo = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, phone: true },
      })
    : null

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { seller: { select: { businessName: true } }, variants: true },
  })
  if (!product || product.status !== "ACTIVE") redirect("/catalog")

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center px-lg h-16">
          <Link href={`/catalog/${product.id}`} className="flex items-center gap-2 text-label-md text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Produk
        </Link>
      </header>

      <main className="px-gutter py-lg max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-lg">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/catalog" className="hover:text-primary">Katalog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-on-surface font-bold">Pembayaran</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30">
            <h1 className="text-headline-lg text-primary font-bold">Pembayaran</h1>
          </div>

          <div className="p-lg border-b border-outline-variant/30 bg-surface-container-low/30">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-7 h-7 text-outline-variant" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-md font-bold text-on-surface truncate">{product.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">{product.seller.businessName}</span>
                  <span className="text-label-md font-bold text-primary">{formatRupiah(product.priceRupiah)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-lg">
            <CheckoutForm
              productId={product.id}
              buyerId={session?.user?.id}
              defaultName={userInfo?.name ?? ""}
              defaultPhone={userInfo?.phone ?? ""}
              productVariants={product.variants.map((v) => v.name)}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default CheckoutPage
