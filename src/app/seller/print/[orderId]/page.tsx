import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { ShoppingBag, Printer, ArrowLeft } from "lucide-react"

export default async function PrintOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const [{ orderId }, session] = await Promise.all([params, auth()])
  
  if (!session?.user) redirect("/login")

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          order: false,
        },
      },
      buyer: true,
    },
  })

  if (!order) redirect("/seller")

  // Ensure actor is the seller of the items or an admin
  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  })

  const hasAccess = 
    session.user.role === "ADMIN" || 
    session.user.role === "BENDAHARA" || 
    (seller && order.items.some(item => item.sellerId === seller.id))

  if (!hasAccess) {
    return (
      <div className="p-xl text-center text-error font-bold">
        Akses Ditolak: Anda tidak memiliki akses untuk mencetak struk ini.
      </div>
    )
  }

  // Get product names
  const productIds = order.items.map(i => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, title: true }
  })
  const productMap = new Map(products.map(p => [p.id, p.title]))

  return (
    <div className="min-h-screen bg-white text-black p-lg font-mono text-sm max-w-md mx-auto relative print:p-0">
      {/* Back & Print Controls (Hidden on Print) */}
      <div className="flex justify-between items-center mb-xl border-b border-black/10 pb-md print:hidden">
        <Link href="/seller?tab=sales" className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <button
          onClick={() => window.print()}
          className="px-lg py-2 bg-black text-white rounded-lg text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Cetak Struk
        </button>
      </div>

      {/* Ticket / Receipt Content */}
      <div className="space-y-lg text-center">
        <div className="space-y-xs">
          <h2 className="text-xl font-bold tracking-wider">M2A CO-BIZ</h2>
          <p className="text-[12px] text-gray-600">Banjarwaringin, Salopa, Tasikmalaya</p>
          <p className="text-[12px] text-gray-500">Kemitraan Pemuda Al-Mubarok II</p>
        </div>

        <div className="border-y border-dashed border-black py-md text-left space-y-1">
          <div className="flex justify-between">
            <span>No. Pesanan:</span>
            <span className="font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{new Date(order.createdAt).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Pembayaran:</span>
            <span className="font-bold">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Status Bayar:</span>
            <span>{order.paymentStatus === "PAID" ? "LUNAS" : "PENDING"}</span>
          </div>
        </div>

        <div className="text-left space-y-md">
          <p className="font-bold border-b border-dashed border-black pb-xs">DETAIL ITEM</p>
          <div className="space-y-sm">
            {order.items.map((item) => {
              const productTitle = productMap.get(item.productId) || "Produk M2A"
              return (
                <div key={item.id} className="space-y-xs">
                  <div className="flex justify-between font-bold">
                    <span>{productTitle}</span>
                    <span>{formatRupiah(item.priceRupiah * item.qty)}</span>
                  </div>
                  <div className="text-[12px] text-gray-600 flex justify-between">
                    <span>x{item.qty} @ {formatRupiah(item.priceRupiah)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-dashed border-black pt-md text-left space-y-1">
          <div className="flex justify-between text-base font-bold">
            <span>TOTAL BELANJA</span>
            <span>{formatRupiah(order.totalRupiah)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black pt-md text-left space-y-1">
          <p className="font-bold">ALAMAT & CATATAN KIRIMAN</p>
          <div className="text-[12px] space-y-1 bg-gray-50 p-md rounded border border-gray-200 mt-xs print:bg-white print:border-dashed">
            <p><span className="font-bold">Nama:</span> {order.buyerName}</p>
            <p><span className="font-bold">Telp/WA:</span> {order.buyerPhone}</p>
            {order.serviceNotes && (
              <p className="whitespace-pre-line mt-md pt-md border-t border-gray-200 border-dashed"><span className="font-bold block">Detail Rincian:</span>{order.serviceNotes}</p>
            )}
          </div>
        </div>

        <div className="pt-xl text-center space-y-xs">
          <p className="font-bold text-[12px]">TERIMA KASIH</p>
          <p className="text-[10px] text-gray-500">Mendukung UMKM Lokal Desa Banjarwaringin</p>
        </div>
      </div>
    </div>
  )
}
