import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle, Banknote, CreditCard, Truck, PackageCheck } from "lucide-react"
import { PublicBottomBar } from "@/components/public-bottom-bar"

const statusIcon = {
  PENDING: Clock,
  PAID: CheckCircle,
  FAILED: XCircle,
  EXPIRED: XCircle,
}

const statusColor = {
  PENDING: "text-warning bg-warning/10",
  PAID: "text-success bg-success/10",
  FAILED: "text-error bg-error/10",
  EXPIRED: "text-on-surface-variant bg-surface-container-highest",
}

const statusLabel = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
}

async function PesananSayaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/pesanan-saya")

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      items: {
        include: {
          order: false,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center px-lg h-16">
        <Link href="/catalog" className="flex items-center gap-2 text-label-md text-on-surface-variant hover:text-primary transition-colors">
          <ChevronRight className="w-5 h-5 rotate-180" />
          Katalog
        </Link>
        <div className="flex-1 text-center text-headline-md font-bold text-primary pr-10">
          Pesanan Saya
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-gutter py-lg pb-32">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-xl">
              <Package className="w-10 h-10 text-outline-variant" />
            </div>
            <h2 className="text-headline-md text-primary mb-2">Belum Ada Pesanan</h2>
            <p className="text-body-md text-on-surface-variant text-center max-w-sm mb-lg">
              Anda belum memiliki pesanan. Mulai belanja di katalog kami.
            </p>
            <Link href="/catalog" className="px-xl py-3 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-md">
            {orders.map((order) => {
              const StatusIcon = statusIcon[order.paymentStatus]
              return (
                <div key={order.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                  <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/20 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-outline-variant" />
                      <span className="text-label-sm text-on-surface-variant font-mono">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        order.paymentMethod === "COD" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                      }`}>
                        {order.paymentMethod === "COD" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-bold ${statusColor[order.paymentStatus]}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusLabel[order.paymentStatus]}
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-bold bg-primary/10 text-primary">
                        {order.fulfillmentStatus === "COMPLETED" ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : order.fulfillmentStatus === "IN_TRANSIT" ? <Truck className="w-3.5 h-3.5 text-warning" /> : <PackageCheck className="w-3.5 h-3.5" />}
                        <span className="capitalize">{order.fulfillmentStatus.replace(/_/g, " ").toLowerCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-lg py-md space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-label-md">
                        <span className="text-on-surface-variant">Produk x{item.qty}</span>
                        <span className="text-on-surface font-bold">{formatRupiah(item.priceRupiah * item.qty)}</span>
                      </div>
                    ))}
                    {order.serviceNotes && (
                      <div className="p-md rounded-lg bg-surface-container-high text-label-sm text-on-surface mt-2">
                        <span className="font-bold block text-primary">Catatan / Alamat Layanan:</span>
                        {order.serviceNotes}
                      </div>
                    )}
                    <div className="border-t border-outline-variant/20 pt-2 flex justify-between text-label-md font-bold">
                      <span className="text-on-surface">Total</span>
                      <span className="text-primary">{formatRupiah(order.totalRupiah)}</span>
                    </div>
                  </div>

                  <div className="px-lg py-md bg-surface-container-low/50 border-t border-outline-variant/20 flex items-center justify-between text-label-sm">
                    <span className="text-on-surface-variant">{order.buyerName} &middot; {order.buyerPhone}</span>
                    <span className="text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <PublicBottomBar isLoggedIn={true} isSeller={session.user.role === "SELLER"} />
    </div>
  )
}

export default PesananSayaPage
