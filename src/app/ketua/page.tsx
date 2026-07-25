import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { BarChart3, TrendingUp, Users, ShoppingBag, Activity, LayoutDashboard, type LucideIcon } from "lucide-react"
import { TrendChart } from "@/components/line-chart"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"

const SIDEBAR: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Ringkasan", href: "/ketua", icon: LayoutDashboard },
  { label: "Aktivitas", href: "/ketua?tab=activity", icon: Activity },
]

async function KetuaDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "KETUA") redirect("/")

  const params = await searchParams
  const tab = params.tab || "overview"

  const [totalSellers, totalProducts, totalOrders, totalRevenue, pendingApprovals, recentActivity, trends] = await Promise.all([
    prisma.sellerProfile.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.ledgerEntry.aggregate({ where: { type: "IN" }, _sum: { amountRupiah: true } }),
    prisma.sellerProfile.count({ where: { status: "PENDING" } }),
    prisma.activityLog.findMany({ take: 20, orderBy: { createdAt: "desc" } }),
    prisma.ledgerEntry.groupBy({
      by: ["createdAt"],
      _sum: { amountRupiah: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ])

  return (
    <DashboardShell
      sidebarItems={SIDEBAR}
      title="Panel Ketua"
      roleLabel="ketua"
      tab={tab}
      userName={session.user.name}
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{totalSellers}</p>
                  <p className="text-label-sm text-on-surface-variant">Penjual Aktif</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-success" /></div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{totalProducts}</p>
                  <p className="text-label-sm text-on-surface-variant">Produk Aktif</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center"><BarChart3 className="w-6 h-6 text-secondary" /></div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{totalOrders}</p>
                  <p className="text-label-sm text-on-surface-variant">Total Pesanan</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-warning" /></div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{formatRupiah(totalRevenue._sum.amountRupiah || 0)}</p>
                  <p className="text-label-sm text-on-surface-variant">Total Pendapatan</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center"><Activity className="w-6 h-6 text-danger" /></div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{pendingApprovals}</p>
                  <p className="text-label-sm text-on-surface-variant">Menunggu Persetujuan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Ringkasan Platform</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
                <div>
                    <p className="text-label-sm text-on-surface-variant">Pendapatan</p>
                  <p className="text-headline-md text-success font-bold">{formatRupiah(totalRevenue._sum.amountRupiah || 0)}</p>
                </div>
                <div>
                    <p className="text-label-sm text-on-surface-variant">Penjual</p>
                  <p className="text-headline-md text-primary font-bold">{totalSellers}</p>
                </div>
                <div>
                    <p className="text-label-sm text-on-surface-variant">Produk</p>
                  <p className="text-headline-md text-secondary font-bold">{totalProducts}</p>
                </div>
                <div>
                    <p className="text-label-sm text-on-surface-variant">Pesanan</p>
                  <p className="text-headline-md text-warning font-bold">{totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Tren Pendapatan</h3>
              <TrendChart data={trends.map(t => ({ label: t.createdAt.toLocaleDateString("id-ID", { month: "short", day: "numeric" }), value: t._sum.amountRupiah || 0 })).reverse()} color="#22C55E" />
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-headline-md text-on-surface font-bold">Aktivitas Terkini</h3>
              <Link href="/ketua?tab=activity" className="text-label-md text-primary hover:underline">Lihat Semua</Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md">Belum ada aktivitas.</div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {recentActivity.slice(0, 8).map((log) => (
                  <div key={log.id} className="px-lg py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-label-md text-on-surface">{log.action}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {log.targetType} · {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === "activity" && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30">
            <h3 className="text-headline-md text-on-surface font-bold">Log Aktivitas</h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">Belum ada aktivitas tercatat.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-lg py-3 font-medium">Aksi</th>
                    <th className="px-lg py-3 font-medium">Target</th>
                    <th className="px-lg py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((log) => (
                    <tr key={log.id} className="border-b border-outline-variant/20">
                      <td className="px-lg py-3 text-label-md text-on-surface">{log.action}</td>
                      <td className="px-lg py-3 text-label-sm text-on-surface-variant">{log.targetType}</td>
                      <td className="px-lg py-3 text-label-sm text-on-surface-variant">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}

export default KetuaDashboard
