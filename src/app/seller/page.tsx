import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { Store, ShoppingBag, Wallet, TrendingUp, Clock, CheckCircle2, XCircle,
LayoutDashboard, Package, ShoppingCart, HelpCircle, type LucideIcon } from "lucide-react"
import { TrendChart } from "@/components/line-chart"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { NewProductForm } from "./new-product-form"
import { RequestPayoutForm } from "./request-payout-form"
import { FulfillmentStatusAction } from "./fulfillment-action"

const SIDEBAR: { label: string; href: string; icon: string }[] = [
  { label: "Ringkasan", href: "/seller", icon: "LayoutDashboard" },
  { label: "Produk", href: "/seller?tab=products", icon: "Package" },
  { label: "Penjualan", href: "/seller?tab=sales", icon: "ShoppingCart" },
  { label: "Pencairan", href: "/seller?tab=payouts", icon: "Wallet" },
  { label: "Panduan", href: "/seller?tab=guide", icon: "HelpCircle" },
]

async function SellerDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: true, products: { include: { category: true }, orderBy: { createdAt: "desc" } } },
  })
  if (!seller) redirect("/")

  const params = await searchParams
  const tab = params.tab || "overview"

  const sellerCategories = await prisma.category.findMany({ where: { status: "APPROVED" }, orderBy: { name: "asc" } })

  const totalSales = await prisma.orderItem.aggregate({
    where: { sellerId: seller.id },
    _sum: { sellerNetRupiah: true },
  })

  const pendingPayouts = await prisma.payout.aggregate({
    where: { sellerId: seller.id, status: "PENDING" },
    _sum: { amountRupiah: true },
  })

  const paidItems = await prisma.orderItem.findMany({
    where: { sellerId: seller.id, order: { paymentStatus: "PAID" } },
  })
  const totalEarnings = paidItems.reduce((sum, i) => sum + i.sellerNetRupiah, 0)

  const paidPayouts = await prisma.payout.findMany({
    where: { sellerId: seller.id, status: { in: ["PROCESSING", "PAID"] } },
  })
  const totalPaidOut = paidPayouts.reduce((sum, p) => sum + p.amountRupiah, 0)

  const availableBalance = totalEarnings - totalPaidOut

  const allPayouts = await prisma.payout.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
  })

  const salesItems = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    include: { order: { select: { id: true, buyerName: true, buyerPhone: true, paymentMethod: true, fulfillmentStatus: true, serviceNotes: true, createdAt: true } } },
    orderBy: { order: { createdAt: "desc" } },
    take: 50,
  })

  const statusBadge = {
    PENDING: { icon: Clock, class: "!bg-warning/10 !text-warning", label: "Ditinjau" },
    APPROVED: { icon: CheckCircle2, class: "!bg-success/10 !text-success", label: "Aktif" },
    REJECTED: { icon: XCircle, class: "!bg-error/10 !text-error", label: "Ditolak" },
    SUSPENDED: { icon: XCircle, class: "!bg-error/10 !text-error", label: "Ditangguhkan" },
  }[seller.status]

  return (
    <DashboardShell
      sidebarItems={SIDEBAR}
      title="Panel Penjual"
      roleLabel="seller"
      tab={tab}
      userName={session.user.name}
      extraHeader={
        <div className="flex items-center gap-md">
          <span className={`chip-clay text-label-sm font-bold ${statusBadge.class}`}>
            <statusBadge.icon className="w-3 h-3" />
            {statusBadge.label}
          </span>
        </div>
      }
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {/* Card 1 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="chip-clay text-label-sm font-bold !bg-primary/10 !text-primary">
                    {seller.type}
                  </span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Nama Usaha</p>
                  <p className="text-headline-md font-bold text-on-surface mt-1 truncate">{seller.businessName}</p>
                </div>
            </div>

            {/* Card 2 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Total Produk</p>
                  <p className="text-display-md font-bold text-on-surface mt-1">{seller.products.length}</p>
                </div>
            </div>

            {/* Card 3 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Total Pendapatan</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(totalSales._sum.sellerNetRupiah || 0)}</p>
                </div>
            </div>

            {/* Card 4 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Pencairan Tertunda</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(pendingPayouts._sum.amountRupiah || 0)}</p>
                </div>
            </div>
          </div>

          {seller.status === "PENDING" && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-lg flex items-start gap-lg">
              <Clock className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <p className="text-label-md font-bold text-on-surface">Pendaftaran Sedang Ditinjau</p>
                <p className="text-label-sm text-on-surface-variant">Pendaftaran penjual Anda sedang ditinjau oleh tim admin. Anda akan diberitahu setelah disetujui.</p>
              </div>
            </div>
          )}

          {seller.status === "APPROVED" && (
            <div className="clay-lite p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Ikhtisar Pendapatan</h3>
              <TrendChart data={[{ label: "All Time", value: totalSales._sum.sellerNetRupiah || 0 }]} color="#22C55E" />
            </div>
          )}

          <div className="clay-lite overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-headline-md text-on-surface font-bold">Produk Anda</h3>
              <Link href="/seller?tab=products" className="text-label-md text-primary hover:underline">Kelola</Link>
            </div>
            {seller.products.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">Belum ada produk. Tambah produk pertama Anda!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant">
                      <th className="px-lg py-3 font-medium">Produk</th>
                      <th className="px-lg py-3 font-medium">Harga</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.products.slice(0, 5).map((p) => (
                      <tr key={p.id} className="clay-table-row">
                        <td className="px-lg py-3 text-label-md text-on-surface">{p.title}</td>
                        <td className="px-lg py-3 text-label-md text-on-surface">{formatRupiah(p.priceRupiah)}</td>
                        <td className="px-lg py-3">
                          <span className={`chip-clay text-label-sm font-bold ${p.status === "ACTIVE" ? "!bg-success/10 !text-success" : "!bg-surface-container-highest !text-on-surface-variant"}`}>{p.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="clay-lite p-lg">
            <h3 className="text-headline-md text-on-surface font-bold mb-lg">Rekening Bank</h3>
            {seller.bankAccountNo ? (
              <div className="space-y-2">
                <p className="text-label-md text-on-surface">{seller.bankName} - {seller.bankAccountNo}</p>
                <p className="text-label-sm text-on-surface-variant">{seller.bankAccountName}</p>
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">Belum ada rekening bank. Tambahkan untuk menerima pencairan.</p>
            )}
          </div>
        </>
      )}

      {tab === "products" && (
        <div className="space-y-lg">
          <div className="clay-lite p-lg">
            <h3 className="text-headline-md text-on-surface font-bold mb-lg">
              {seller.type === "JASA" ? "Tambah Layanan Jasa Baru" : "Tambah Produk Baru"}
            </h3>
            <NewProductForm categories={sellerCategories} sellerType={seller.type} />
          </div>

          <div className="clay-lite overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30">
              <h3 className="text-headline-md text-on-surface font-bold">Semua Produk</h3>
            </div>
            {seller.products.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">Belum ada produk.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant">
                      <th className="px-lg py-3 font-medium">Judul</th>
                      <th className="px-lg py-3 font-medium">Kategori</th>
                      <th className="px-lg py-3 font-medium">Harga</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.products.map((p) => (
                      <tr key={p.id} className="clay-table-row">
                        <td className="px-lg py-3 text-label-md text-on-surface whitespace-nowrap">{p.title}</td>
                        <td className="px-lg py-3 text-label-sm text-on-surface-variant whitespace-nowrap">{p.category?.name || "-"}</td>
                        <td className="px-lg py-3 text-label-md text-on-surface whitespace-nowrap">{formatRupiah(p.priceRupiah)}</td>
                        <td className="px-lg py-3">
                          <span className={`chip-clay text-label-sm font-bold ${p.status === "ACTIVE" ? "!bg-success/10 !text-success" : "!bg-surface-container-highest !text-on-surface-variant"}`}>{p.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "sales" && (
        <div className="space-y-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
            <div className="clay-lite p-lg">
              <p className="text-label-sm text-on-surface-variant">Total Penjualan</p>
              <p className="text-display-md font-bold text-on-surface">{salesItems.reduce((s, i) => s + i.priceRupiah * i.qty, 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="clay-lite p-lg">
              <p className="text-label-sm text-on-surface-variant">Total Komisi</p>
              <p className="text-display-md font-bold text-on-surface">{salesItems.reduce((s, i) => s + i.commissionRupiah, 0).toLocaleString("id-ID")}</p>
            </div>
            <div className="clay-lite p-lg">
              <p className="text-label-sm text-on-surface-variant">Pendapatan Bersih</p>
              <p className="text-display-md font-bold text-on-surface">{formatRupiah(salesItems.reduce((s, i) => s + i.sellerNetRupiah, 0))}</p>
            </div>
          </div>
          <div className="clay-lite overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30"><h3 className="text-headline-md text-on-surface font-bold">Riwayat Penjualan</h3></div>
            {salesItems.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">Belum ada penjualan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant">
                      <th className="px-lg py-3 font-medium">Pembeli</th>
                      <th className="px-lg py-3 font-medium">Metode</th>
                      <th className="px-lg py-3 font-medium">Total</th>
                      <th className="px-lg py-3 font-medium">Bersih</th>
                      <th className="px-lg py-3 font-medium">Status Pengerjaan</th>
                      <th className="px-lg py-3 font-medium text-right">Struk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesItems.map((item) => (
                      <tr key={item.id} className="clay-table-row">
                        <td className="px-lg py-3">
                          <p className="text-label-md font-bold text-on-surface whitespace-nowrap">{item.order.buyerName}</p>
                          <p className="text-label-sm text-on-surface-variant whitespace-nowrap">{item.order.buyerPhone}</p>
                          {item.order.serviceNotes && (
                            <p className="text-[11px] text-primary italic max-w-xs mt-1">Catatan: {item.order.serviceNotes}</p>
                          )}
                        </td>
                        <td className="px-lg py-3">
                          <span className={`chip-clay text-[11px] font-bold ${
                            item.order.paymentMethod === "COD" ? "!bg-success/10 !text-success" : "!bg-primary/10 !text-primary"
                          } whitespace-nowrap`}>
                            {item.order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-lg py-3 text-label-md text-on-surface whitespace-nowrap">{formatRupiah(item.priceRupiah * item.qty)}</td>
                        <td className="px-lg py-3 text-label-md text-on-surface font-bold whitespace-nowrap">{formatRupiah(item.sellerNetRupiah)}</td>
                        <td className="px-lg py-3">
                          <FulfillmentStatusAction orderId={item.order.id} currentStatus={item.order.fulfillmentStatus} />
                        </td>
                        <td className="px-lg py-3 text-right">
                          <Link
                            href={`/seller/print/${item.order.id}`}
                            className="btn-clay-outline text-label-xs min-h-[36px]"
                          >
                            Cetak
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {tab === "payouts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="clay-lite p-lg">
            <h3 className="text-headline-md text-on-surface font-bold mb-lg">Ajukan Pencairan</h3>
            <RequestPayoutForm availableBalance={availableBalance} />
          </div>
          <div className="clay-lite overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30">
              <h3 className="text-headline-md text-on-surface font-bold">Riwayat Pencairan</h3>
              <p className="text-label-sm text-on-surface-variant mt-1">{allPayouts.length} total pencairan</p>
            </div>
            {allPayouts.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">Belum ada pencairan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant">
                      <th className="px-lg py-3 font-medium">Jumlah</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                      <th className="px-lg py-3 font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayouts.map((p) => (
                      <tr key={p.id} className="clay-table-row">
                        <td className="px-lg py-3 text-label-md text-on-surface font-bold">{formatRupiah(p.amountRupiah)}</td>
                        <td className="px-lg py-3">
                          <span className={`chip-clay text-label-sm font-bold ${
                            p.status === "PAID" ? "!bg-success/10 !text-success" :
                            p.status === "PROCESSING" ? "!bg-warning/10 !text-warning" :
                            p.status === "FAILED" ? "!bg-error/10 !text-error" :
                            "!bg-surface-container-highest !text-on-surface-variant"
                          }`}>{p.status === "PAID" ? "Dibayar" : p.status === "PROCESSING" ? "Diproses" : p.status === "FAILED" ? "Gagal" : "Tertunda"}</span>
                        </td>
                        <td className="px-lg py-3 text-label-sm text-on-surface-variant">{p.createdAt.toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "guide" && (
        <div className="space-y-lg max-w-2xl">
          <h3 className="text-headline-md font-bold text-on-surface">Panduan Penggunaan — Penjual (Seller)</h3>
          <div className="space-y-md">
            <PanduanItemSeller icon={LayoutDashboard} title="Ringkasan" desc="Lihat ringkasan bisnis: total penjualan, pendapatan bersih (setelah komisi), jumlah produk aktif, dan saldo yang bisa dicairkan." />
            <PanduanItemSeller icon={Package} title="Produk" desc="Tambah produk atau jasa baru. Isi nama, deskripsi, upload foto (max 5 file), harga, kategori. Bisa tambah varian (pisahkan dengan koma: contoh 'Merah, Biru, Hijau') dan stok awal varian. Edit status produk jadi Nonaktif jika stok habis." />
            <PanduanItemSeller icon={ShoppingCart} title="Penjualan" desc="Lihat riwayat penjualan. Update status pengerjaan (Pending → Diproses → Dikirim → Selesai) untuk tiap pesanan. Klik tombol 'Cetak' untuk cetak struk/label pengiriman." />
            <PanduanItemSeller icon={Wallet} title="Pencairan" desc="Ajukan pencairan saldo ke Bendahara. Pastikan data rekening bank sudah diisi di profil toko. Saldo akan ditransfer manual oleh Bendahara." />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

function PanduanItemSeller({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-md clay-lite">
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-label-md font-bold text-on-surface">{title}</p>
        <p className="text-label-sm text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default SellerDashboard
