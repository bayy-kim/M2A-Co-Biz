import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CheckCircle2, XCircle, Clock, Users, ShoppingBag, FileText, AlertTriangle, Eye, Search, LayoutDashboard, Tag, Building2, List, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { ApproveButton, RejectButton } from "./approve-button"
import { AdminCategoriesTab } from "./categories-tab"
import { AdminUsersTab } from "./users-tab"
import { AdminCompanyTab } from "./company-tab"

const SIDEBAR: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { label: "Antrian Persetujuan", href: "/admin?tab=approvals", icon: Clock },
  { label: "Kategori", href: "/admin?tab=categories", icon: Tag },
  { label: "Pengguna", href: "/admin?tab=users", icon: Users },
  { label: "Profil Perusahaan", href: "/admin?tab=company", icon: Building2 },
  { label: "Log Aktivitas", href: "/admin?tab=activity", icon: List },
]

async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/")

  const params = await searchParams
  const tab = params.tab || "overview"

  const [pendingSellers, totalSellers, totalProducts, recentActivity] = await Promise.all([
    prisma.sellerProfile.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { name: true, email: true, phone: true, createdAt: true } }, documents: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sellerProfile.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.activityLog.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
  ])

  return (
    <DashboardShell
      sidebarItems={SIDEBAR}
      title="Panel Admin"
      roleLabel="admin"
      tab={tab}
      userName={session.user.name}
      extraHeader={
        <div className="flex items-center gap-md">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input className="w-64 bg-surface-container-low border-none rounded-lg pl-9 pr-3 py-1.5 text-label-md focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Cari..." type="text" />
          </div>
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse" title={`${pendingSellers.length} pending`} />
        </div>
      }
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{pendingSellers.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Menunggu Persetujuan</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{totalSellers}</p>
                  <p className="text-label-sm text-on-surface-variant">Total Penjual</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{totalProducts}</p>
                  <p className="text-label-sm text-on-surface-variant">Produk Aktif</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
              <div className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-tertiary" />
                </div>
                <div>
                  <p className="text-display-md font-bold text-on-surface">{recentActivity.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Aktivitas Terbaru</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
              <h3 className="text-headline-md text-on-surface font-bold">Persetujuan Penjual Tertunda</h3>
              <Link href="/admin?tab=approvals" className="text-label-md text-primary hover:underline">Lihat Semua</Link>
            </div>
            {pendingSellers.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md">Tidak ada yang menunggu persetujuan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                      <th className="px-lg py-3 font-medium">Nama</th>
                      <th className="px-lg py-3 font-medium">Usaha</th>
                      <th className="px-lg py-3 font-medium">Jenis</th>
                      <th className="px-lg py-3 font-medium">Tanggal</th>
                      <th className="px-lg py-3 font-medium">Dokumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.slice(0, 5).map((seller) => (
                      <tr key={seller.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-3">
                          <div>
                            <p className="text-label-md font-bold text-on-surface">{seller.user.name}</p>
                            <p className="text-label-sm text-on-surface-variant">{seller.user.email}</p>
                          </div>
                        </td>
                        <td className="px-lg py-3 text-label-md text-on-surface">{seller.businessName}</td>
                        <td className="px-lg py-3">
                          <span className={`inline-flex px-md py-1 rounded-full text-label-sm font-bold ${seller.type === "UMKM" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"}`}>
                            {seller.type}
                          </span>
                        </td>
                        <td className="px-lg py-3 text-label-md text-on-surface-variant">
                          {seller.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-lg py-3">
                          <span className="text-label-sm text-on-surface-variant">
                            {seller.documents.length} file{seller.documents.length !== 1 ? "s" : ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Aktivitas Terbaru</h3>
              {recentActivity.length === 0 ? (
                <p className="text-body-md text-on-surface-variant text-center py-lg">Belum ada aktivitas.</p>
              ) : (
                <div className="space-y-md">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 pb-md border-b border-outline-variant/10 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
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
          </div>
        </>
      )}

      {tab === "approvals" && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30">
            <h3 className="text-headline-md text-on-surface font-bold">Antrian Persetujuan</h3>
            <p className="text-label-sm text-on-surface-variant mt-1">{pendingSellers.length} penjual menunggu review</p>
          </div>
          {pendingSellers.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">Tidak ada yang menunggu. Semua bersih!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-lg py-3 font-medium">Penjual</th>
                    <th className="px-lg py-3 font-medium">Usaha</th>
                    <th className="px-lg py-3 font-medium">Jenis</th>
                    <th className="px-lg py-3 font-medium">Kontak</th>
                    <th className="px-lg py-3 font-medium">Terdaftar</th>
                    <th className="px-lg py-3 font-medium">Dokumen</th>
                    <th className="px-lg py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map((seller) => (
                    <tr key={seller.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-3">
                        <p className="text-label-md font-bold text-on-surface">{seller.user.name}</p>
                      </td>
                      <td className="px-lg py-3 text-label-md text-on-surface">{seller.businessName}</td>
                      <td className="px-lg py-3">
                        <span className={`inline-flex px-md py-1 rounded-full text-label-sm font-bold ${seller.type === "UMKM" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"}`}>{seller.type}</span>
                      </td>
                      <td className="px-lg py-3">
                        <p className="text-label-sm text-on-surface">{seller.user.email}</p>
                        <p className="text-label-sm text-on-surface-variant">{seller.user.phone || "-"}</p>
                      </td>
                      <td className="px-lg py-3 text-label-sm text-on-surface-variant">
                        {seller.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-lg py-3">
                        <div className="flex flex-col gap-1">
                          {seller.documents.map((doc) => (
                            <a key={doc.id} href={`/api/admin/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-label-sm text-primary flex items-center gap-1 hover:underline">
                              <Eye className="w-3 h-3" />
                              {doc.type}
                            </a>
                          ))}
                            {seller.documents.length === 0 && <span className="text-label-sm text-on-surface-variant italic">Tidak ada</span>}
                        </div>
                      </td>
                      <td className="px-lg py-3">
                        <div className="flex items-center gap-2">
                          <ApproveButton sellerId={seller.id} />
                          <RejectButton sellerId={seller.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "categories" && <AdminCategoriesTab />}

      {tab === "users" && <AdminUsersTab searchParams={searchParams} />}

      {tab === "company" && <AdminCompanyTab />}

      {tab === "activity" && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
          <h3 className="text-headline-md text-on-surface font-bold mb-lg">Activity Log</h3>
          {recentActivity.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Belum ada aktivitas tercatat.</p>
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
                      <td className="px-lg py-3 text-label-md text-on-surface-variant">{log.targetType} #{log.targetId?.slice(0, 8)}</td>
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

export default AdminDashboard
