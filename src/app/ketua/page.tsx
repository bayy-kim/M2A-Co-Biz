import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { BarChart3, TrendingUp, Users, ShoppingBag, Activity, LayoutDashboard, HelpCircle, type LucideIcon } from "lucide-react"
import { TrendChart } from "@/components/dynamic-charts-client"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"

const SIDEBAR: { label: string; href: string; icon: string }[] = [
  { label: "Ringkasan", href: "/ketua", icon: "LayoutDashboard" },
  { label: "Aktivitas", href: "/ketua?tab=activity", icon: "Activity" },
  { label: "Panduan", href: "/ketua?tab=guide", icon: "HelpCircle" },
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
            {/* Card 1 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Penjual Aktif</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{totalSellers}</p>
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
                  <p className="text-label-sm text-on-surface-variant font-medium">Produk Aktif</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{totalProducts}</p>
                </div>
            </div>

            {/* Card 3 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Total Pesanan</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{totalOrders}</p>
                </div>
            </div>

            {/* Card 4 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Total Omzet</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(totalRevenue._sum.amountRupiah || 0)}</p>
                </div>
            </div>

            {/* Card 5 */}
            <div className="clay-lite p-lg space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  {pendingApprovals > 0 && (
                    <span className="chip-clay text-[10px] !bg-amber-500/10 !text-amber-800">
                      Pending
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Menunggu Persetujuan</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{pendingApprovals}</p>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="clay-lite p-lg">
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
            <div className="clay-lite p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Tren Pendapatan</h3>
              <TrendChart data={trends.map(t => ({ label: t.createdAt.toLocaleDateString("id-ID", { month: "short", day: "numeric" }), value: t._sum.amountRupiah || 0 })).reverse()} color="#22C55E" />
            </div>
          </div>

          <div className="clay-lite overflow-hidden">
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
        <div className="clay-lite overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30">
            <h3 className="text-headline-md text-on-surface font-bold">Log Aktivitas</h3>
          </div>
          {recentActivity.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">Belum ada aktivitas tercatat.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant">
                      <th className="px-lg py-3 font-medium">Aksi</th>
                      <th className="px-lg py-3 font-medium">Target</th>
                      <th className="px-lg py-3 font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((log) => (
                      <tr key={log.id} className="clay-table-row">
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

      {tab === "guide" && (
        <div className="space-y-lg max-w-2xl">
          <h3 className="text-headline-md font-bold text-on-surface">Panduan Penggunaan — Ketua</h3>
          <div className="space-y-md">
            <div className="flex items-start gap-3 p-md clay-lite">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <LayoutDashboard className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-label-md font-bold text-on-surface">Ringkasan</p>
                <p className="text-label-sm text-on-surface-variant">Lihat gambaran umum performa platform: total seller & produk aktif, total pemasukan & komisi, tren penjualan 7 hari terakhir, dan komisi per seller.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-md clay-lite">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-label-md font-bold text-on-surface">Aktivitas</p>
                <p className="text-label-sm text-on-surface-variant">Pantau semua aktivitas yang terjadi di platform secara real-time: pendaftaran seller baru, konfirmasi pembayaran, payout, dan perubahan komisi.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

export default KetuaDashboard
