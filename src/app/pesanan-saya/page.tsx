import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { ShoppingBag, ChevronRight, Package, Clock, CheckCircle, XCircle, Banknote, CreditCard, Truck, PackageCheck, Upload, RefreshCw, Send, Check } from "lucide-react"
import { PublicBottomBar } from "@/components/public-bottom-bar"
import { ReviewTrigger } from "./review-trigger"

const paymentIcon: Record<string, any> = {
  PENDING: Clock,
  PAID: CheckCircle,
  FAILED: XCircle,
  EXPIRED: XCircle,
}

const paymentColor: Record<string, string> = {
  PENDING: "!text-warning",
  PAID: "!text-success",
  FAILED: "!text-error",
  EXPIRED: "!text-on-surface-variant",
}

const paymentBgColor: Record<string, string> = {
  PENDING: "!bg-warning/10",
  PAID: "!bg-success/10",
  FAILED: "!bg-error/10",
  EXPIRED: "!bg-surface-container-highest",
}

const paymentLabel: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
}

const fulfillmentLabel: Record<string, string> = {
  PENDING: "Menunggu Konfirmasi",
  PROCESSING: "Sedang Diproses",
  IN_TRANSIT: "Dalam Pengiriman",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
}

const fulfillmentIcon: Record<string, any> = {
  PENDING: Clock,
  PROCESSING: RefreshCw,
  IN_TRANSIT: Truck,
  COMPLETED: Check,
  CANCELLED: XCircle,
}

const fulfillmentColor: Record<string, string> = {
  PENDING: "text-warning",
  PROCESSING: "text-primary",
  IN_TRANSIT: "text-accent-gold",
  COMPLETED: "text-success",
  CANCELLED: "text-error",
}

const fulfillmentBgColor: Record<string, string> = {
  PENDING: "bg-warning/10",
  PROCESSING: "bg-primary/10",
  IN_TRANSIT: "bg-accent-gold/10",
  COMPLETED: "bg-success/10",
  CANCELLED: "bg-error/10",
}

const steps = [
  { key: "PENDING" as const, label: "Dikonfirmasi", icon: CheckCircle },
  { key: "PROCESSING" as const, label: "Diproses", icon: RefreshCw },
  { key: "IN_TRANSIT" as const, label: "Dikirim", icon: Truck },
  { key: "COMPLETED" as const, label: "Selesai", icon: PackageCheck },
]

const stepOrder = ["PENDING", "PROCESSING", "IN_TRANSIT", "COMPLETED"]

function getFulfillmentStep(current: string): number {
  const idx = stepOrder.indexOf(current)
  return idx >= 0 ? idx : 0
}

async function PesananSayaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/pesanan-saya")
  const params = await searchParams
  const currentTab = params.tab || "active"

  const allOrders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      items: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  })

  // Active: payment PENDING, OR paid but not fully completed
  // History: completed orders OR failed/expired
  const orders = currentTab === "active"
    ? allOrders.filter(o => o.paymentStatus === "PENDING" || (o.paymentStatus === "PAID" && o.fulfillmentStatus !== "COMPLETED"))
    : allOrders.filter(o => o.paymentStatus !== "PENDING" && !(o.paymentStatus === "PAID" && o.fulfillmentStatus !== "COMPLETED"))

  const productIds = allOrders.flatMap(o => o.items.map(i => i.productId))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true }
  })
  const productMap = new Map(products.map(p => [p.id, p.title]))

  return (
    <div className="min-h-screen" style={{background:"var(--color-clay-bg)"}}>
      <header className="sticky top-0 z-50 clay-pill mx-4 mt-3 px-4 py-2.5 flex items-center justify-between max-w-2xl lg:mx-auto" style={{boxShadow:"var(--shadow-clay-md)"}}>
        <div className="flex-1 text-center text-headline-md font-bold" style={{color:"var(--color-primary)"}}>
          Pesanan Saya
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-gutter py-lg pb-32">
        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-xl">
          <Link
            href="/pesanan-saya?tab=active"
            className={`chip-clay ${currentTab === "active" ? "active" : ""}`}
          >
            Aktif
          </Link>
          <Link
            href="/pesanan-saya?tab=history"
            className={`chip-clay ${currentTab === "history" ? "active" : ""}`}
          >
            Riwayat
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xxl">
            <div className="w-20 h-20 rounded-full clay flex items-center justify-center mb-xl" style={{boxShadow:"var(--shadow-clay-sm)"}}>
              <Package className="w-10 h-10" style={{color:"var(--color-outline)"}} />
            </div>
            <h2 className="text-headline-md font-bold mb-2" style={{color:"var(--color-primary)"}}>
              {currentTab === "active" ? "Tidak Ada Pesanan Aktif" : "Belum Ada Riwayat"}
            </h2>
            <p className="text-body-md text-center max-w-sm mb-lg" style={{color:"var(--color-on-surface-variant)"}}>
              {currentTab === "active"
                ? "Anda tidak memiliki pesanan yang menunggu pembayaran."
                : "Pesanan yang sudah lunas atau selesai akan muncul di sini."}
            </p>
            <Link href="/catalog" className="btn-clay">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-md">
            {orders.map((order) => {
              const PaymentIcon = paymentIcon[order.paymentStatus]
              const FulfillIcon = fulfillmentIcon[order.fulfillmentStatus]
              const stepIdx = getFulfillmentStep(order.fulfillmentStatus)
              const isPaid = order.paymentStatus === "PAID"

              return (
                <div key={order.id} className="clay-sm overflow-hidden">
                  {/* Header: ID + Payment + Fulfillment badges */}
                  <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/20 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" style={{color:"var(--color-outline)"}} />
                      <span className="text-label-sm font-mono" style={{color:"var(--color-on-surface-variant)"}}>
                        #{order.id.slice(0, 8)}
                      </span>
                      <span className={`chip-clay text-[11px] font-bold ${
                        order.paymentMethod === "COD" ? "!bg-success/10 !text-success" : "!bg-primary/10 !text-primary"
                      }`}>
                        {order.paymentMethod === "COD" ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Payment badge */}
                      <span className={`chip-clay text-label-sm font-bold ${paymentColor[order.paymentStatus]} ${paymentBgColor[order.paymentStatus]}`}>
                        <PaymentIcon className="w-3.5 h-3.5" />
                        {paymentLabel[order.paymentStatus]}
                      </span>
                      {/* Fulfillment badge (only for PAID orders) */}
                      {isPaid && (
                        <span className={`chip-clay text-label-sm font-bold ${fulfillmentColor[order.fulfillmentStatus]} ${fulfillmentBgColor[order.fulfillmentStatus]}`}>
                          <FulfillIcon className="w-3.5 h-3.5" />
                          {fulfillmentLabel[order.fulfillmentStatus]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fulfillment Progress Stepper (for PAID orders) */}
                  {isPaid && order.fulfillmentStatus !== "CANCELLED" && (
                    <div className="px-lg py-md border-b border-outline-variant/20">
                      <div className="flex items-center justify-between">
                        {steps.map((s, i) => {
                          const StepIcon = s.icon
                          const isDone = i <= stepIdx
                          const isCurrent = i === stepIdx
                          return (
                            <div key={s.key} className="flex flex-col items-center gap-1 flex-1 relative">
                              {i > 0 && (
                                <div className={`absolute top-3 -left-1/2 w-full h-0.5 -z-10 ${isDone ? "bg-primary" : "bg-outline-variant/50"}`} />
                              )}
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isDone ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
                              } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                style={isCurrent ? {boxShadow:"var(--shadow-clay-sm)"} : {}}
                              >
                                <StepIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-[10px] text-center font-medium leading-tight max-w-[60px] ${
                                isDone ? "text-primary font-bold" : "text-on-surface-variant"
                              }`}>
                                {s.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="px-lg py-md space-y-2">
                    {order.items.map((item) => {
                      const hasReview = order.reviews.some(r => r.productId === item.productId)
                      const productTitle = productMap.get(item.productId) || "Produk M2A"
                      return (
                        <div key={item.id} className="flex justify-between items-center text-label-md gap-4">
                          <span className="flex-1" style={{color:"var(--color-on-surface-variant)"}}>
                            {productTitle} <span className="font-bold" style={{color:"var(--color-on-surface)"}}>x{item.qty}</span>
                          </span>
                          <span className="font-bold whitespace-nowrap" style={{color:"var(--color-on-surface)"}}>
                            {formatRupiah(item.priceRupiah * item.qty)}
                          </span>
                          {order.paymentStatus === "PAID" && order.fulfillmentStatus === "COMPLETED" && (
                            <div className="shrink-0">
                              <ReviewTrigger
                                orderId={order.id}
                                productId={item.productId}
                                productTitle={productTitle}
                                hasReview={hasReview}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {order.serviceNotes && (
                      <div className="clay-sm p-md text-label-sm mt-2 whitespace-pre-line">
                        <span className="font-bold block mb-1" style={{color:"var(--color-primary)"}}>Catatan:</span>
                        {order.serviceNotes}
                      </div>
                    )}
                    <div className="border-t border-outline-variant/20 pt-2 flex justify-between text-label-md font-bold">
                      <span>Total</span>
                      <span className="font-bold" style={{color:"var(--color-primary)"}}>{formatRupiah(order.totalRupiah)}</span>
                    </div>
                  </div>

                  {/* Footer: actions */}
                  <div className="px-lg py-md bg-surface-container-low/50 border-t border-outline-variant/20 flex items-center justify-between text-label-sm flex-wrap gap-2">
                    <span className="text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <div className="flex items-center gap-2">
                      {order.paymentStatus === "PENDING" && order.paymentMethod === "TRANSFER" && (
                        <Link
                          href={`/checkout?orderId=${order.id}`}
                          className="btn-clay btn-clay-gold text-label-xs min-h-[36px]"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload Bukti
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <PublicBottomBar isLoggedIn={true} role={session.user.role} isSeller={session.user.role === "SELLER"} />
    </div>
  )
}

export default PesananSayaPage
