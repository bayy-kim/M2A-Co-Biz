import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { Store, ShoppingBag, Wallet, TrendingUp, Clock, CheckCircle2, XCircle, LayoutDashboard, Package, ShoppingCart, type LucideIcon } from "lucide-react"
import { TrendChart } from "@/components/line-chart"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { NewProductForm } from "./new-product-form"
import { RequestPayoutForm } from "./request-payout-form"

const SIDEBAR: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Ringkasan", href: "/seller", icon: LayoutDashboard },
  { label: "Produk", href: "/seller?tab=products", icon: Package },
  { label: "Penjualan", href: "/seller?tab=sales", icon: ShoppingCart },
  { label: "Pencairan", href: "/seller?tab=payouts", icon: Wallet },
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

  const statusBadge = {
    PENDING: { icon: Clock, class: "bg-warning/10 text-warning", label: "Ditinjau" },
    APPROVED: { icon: CheckCircle2, class: "bg-success/10 text-success", label: "Aktif" },
    REJECTED: { icon: XCircle, class: "bg-error/10 text-error", label: "Ditolak" },
    SUSPENDED: { icon: XCircle, class: "bg-error/10 text-error", label: "Ditangguhkan" },
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
          <span className={`inline-flex items-center gap-1 px-md py-1 rounded-full text-label-sm font-bold ${statusBadge.class}`}>
            <statusBadge.icon className="w-3 h-3" />
            {statusBadge.label}
          </span>
        </div>
      }
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{seller.businessName}</p>
                  <p className="text-label-sm text-on-surface-variant">{seller.type}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{seller.products.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Total Produk</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{formatRupiah(totalSales._sum.sellerNetRupiah || 0)}</p>
                  <p className="text-label-sm text-on-surface-variant">Total Pendapatan</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{formatRupiah(pendingPayouts._sum.amountRupiah || 0)}</p>
                  <p className="text-label-sm text-on-surface-variant">Pencairan Tertunda</p>
                </div>
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
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Ikhtisar Pendapatan</h3>
              <TrendChart data={[{ label: "All Time", value: totalSales._sum.sellerNetRupiah || 0 }]} color="#22C55E" />
            </div>
          )}

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
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
                    <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                      <th className="px-lg py-3 font-medium">Produk</th>
                      <th className="px-lg py-3 font-medium">Harga</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.products.slice(0, 5).map((p) => (
                      <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-3 text-label-md text-on-surface">{p.title}</td>
                        <td className="px-lg py-3 text-label-md text-on-surface">{formatRupiah(p.priceRupiah)}</td>
                        <td className="px-lg py-3">
                          <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${p.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-surface-container-highest text-on-surface-variant"}`}>{p.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
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
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
            <h3 className="text-headline-md text-on-surface font-bold mb-lg">Tambah Produk Baru</h3>
            <NewProductForm categories={sellerCategories} />
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30">
              <h3 className="text-headline-md text-on-surface font-bold">Semua Produk</h3>
            </div>
            {seller.products.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">Belum ada produk.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                      <th className="px-lg py-3 font-medium">Judul</th>
                      <th className="px-lg py-3 font-medium">Kategori</th>
                      <th className="px-lg py-3 font-medium">Harga</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seller.products.map((p) => (
                      <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-3 text-label-md text-on-surface">{p.title}</td>
                        <td className="px-lg py-3 text-label-sm text-on-surface-variant">{p.category?.name || "-"}</td>
                        <td className="px-lg py-3 text-label-md text-on-surface">{formatRupiah(p.priceRupiah)}</td>
                        <td className="px-lg py-3">
                          <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${p.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-surface-container-highest text-on-surface-variant"}`}>{p.status === "ACTIVE" ? "Aktif" : "Nonaktif"}</span>
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

      {tab === "sales" && <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"><h3 className="text-headline-md text-on-surface font-bold mb-lg">Riwayat Penjualan</h3><p className="text-body-md text-on-surface-variant">Segera hadir: rincian penjualan lengkap dengan perhitungan komisi.</p></div>}
      {tab === "payouts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
            <h3 className="text-headline-md text-on-surface font-bold mb-lg">Ajukan Pencairan</h3>
            <RequestPayoutForm availableBalance={availableBalance} />
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
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
                    <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                      <th className="px-lg py-3 font-medium">Jumlah</th>
                      <th className="px-lg py-3 font-medium">Status</th>
                      <th className="px-lg py-3 font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPayouts.map((p) => (
                      <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-3 text-label-md text-on-surface font-bold">{formatRupiah(p.amountRupiah)}</td>
                        <td className="px-lg py-3">
                          <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${
                            p.status === "PAID" ? "bg-success/10 text-success" :
                            p.status === "PROCESSING" ? "bg-warning/10 text-warning" :
                            p.status === "FAILED" ? "bg-error/10 text-error" :
                            "bg-surface-container-highest text-on-surface-variant"
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
    </DashboardShell>
  )
}

export default SellerDashboard
