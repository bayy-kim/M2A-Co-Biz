import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CheckCircle2, XCircle, Clock, Users, ShoppingBag, FileText, AlertTriangle, Eye,
Search, LayoutDashboard, Tag, Building2, List, HelpCircle, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { ApproveButton, RejectButton } from "./approve-button"
import { AdminCategoriesTab } from "./categories-tab"
import { AdminUsersTab } from "./users-tab"
import { AdminCompanyTab } from "./company-tab"

const SIDEBAR: { label: string; href: string; icon: string }[] = [
  { label: "Ringkasan", href: "/admin", icon: "LayoutDashboard" },
  { label: "Antrian Persetujuan", href: "/admin?tab=approvals", icon: "Clock" },
  { label: "Kategori", href: "/admin?tab=categories", icon: "Tag" },
  { label: "Pengguna", href: "/admin?tab=users", icon: "Users" },
  { label: "Profil Perusahaan", href: "/admin?tab=company", icon: "Building2" },
  { label: "Log Aktivitas", href: "/admin?tab=activity", icon: "List" },
  { label: "Panduan", href: "/admin?tab=guide", icon: "HelpCircle" },
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-lg">
            {/* Card 1 */}
            <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-success font-label-sm flex items-center gap-1 font-bold">
                  +12% &uarr;
                </span>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant font-label-md">Pending Approvals</p>
                <h3 className="font-display-md text-primary mt-1">{pendingSellers.length}</h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-accent-gold/10 text-accent-gold flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-on-surface-variant font-label-sm">Average Wait</span>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant font-label-md">Approval Time</p>
                <h3 className="font-display-md text-primary mt-1">1.2d</h3>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-on-surface-variant font-label-sm">This Month</span>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant font-label-md">Total Approved</p>
                <h3 className="font-display-md text-primary mt-1">{totalSellers}</h3>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-surface-container-lowest p-xl rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-lg bg-error-container text-danger flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-danger font-label-sm font-bold">High Rejection</span>
              </div>
              <div className="mt-4">
                <p className="text-on-surface-variant font-label-md">Rejected Apps</p>
                <h3 className="font-display-md text-primary mt-1">08</h3>
              </div>
            </div>
          </div>

          <section className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/30">
              <h4 className="font-headline-md text-on-surface font-bold">Queue ({pendingSellers.length})</h4>
              <div className="flex gap-md">
                <Link href="/admin?tab=approvals" className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container transition-all font-label-md">
                  Filter
                </Link>
                <Link href="/admin?tab=approvals" className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface-variant rounded-lg hover:bg-surface-container transition-all font-label-md">
                  Export
                </Link>
              </div>
            </div>
            {pendingSellers.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">Tidak ada yang menunggu persetujuan.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-md">
                    <tr>
                      <th className="px-lg py-4 border-b border-outline-variant">Nama Penjual</th>
                      <th className="px-lg py-4 border-b border-outline-variant">Kategori Usaha</th>
                      <th className="px-lg py-4 border-b border-outline-variant">Tanggal Registrasi</th>
                      <th className="px-lg py-4 border-b border-outline-variant">Status</th>
                      <th className="px-lg py-4 border-b border-outline-variant text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {pendingSellers.slice(0, 5).map((seller) => {
                      const initials = seller.businessName
                        ? seller.businessName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                        : "UM"
                      return (
                        <tr key={seller.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-lg py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="font-headline-md text-body-lg text-on-surface font-bold whitespace-nowrap">{seller.businessName}</p>
                                <p className="text-on-surface-variant text-[12px] whitespace-nowrap">{seller.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-lg py-4 text-on-surface-variant font-label-md whitespace-nowrap">{seller.type}</td>
                          <td className="px-lg py-4 text-on-surface-variant font-label-md whitespace-nowrap">
                            {seller.createdAt.toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-lg py-4">
                            <span className="px-3 py-1 rounded-full bg-warning/10 text-warning font-label-sm border border-warning/20 whitespace-nowrap">
                              Menunggu Review
                            </span>
                          </td>
                          <td className="px-lg py-4 text-right">
                            <Link
                              href="/admin?tab=approvals"
                              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:shadow-md transition-all active:scale-95 inline-block whitespace-nowrap"
                            >
                              Tinjau Dokumen
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-lg border-t border-outline-variant/30 flex justify-between items-center text-on-surface-variant font-label-sm">
              <span>Showing {Math.min(5, pendingSellers.length)} of {pendingSellers.length} applications</span>
              <div className="flex gap-xs">
                <button className="px-3 py-1 bg-primary text-on-primary rounded-lg font-bold">1</button>
              </div>
            </div>
          </section>

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
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-lg py-3 font-medium">Nama Penjual</th>
                    <th className="px-lg py-3 font-medium">Kategori Usaha</th>
                    <th className="px-lg py-3 font-medium">Tanggal Registrasi</th>
                    <th className="px-lg py-3 font-medium">Status</th>
                    <th className="px-lg py-3 font-medium">Dokumen</th>
                    <th className="px-lg py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map((seller) => {
                    const initials = seller.businessName
                      ? seller.businessName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                      : "UM"
                    return (
                      <tr key={seller.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                        <td className="px-lg py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface font-bold flex items-center justify-center shrink-0 text-label-md border border-outline-variant/20">
                              {initials}
                            </div>
                            <div>
                              <p className="text-label-md font-bold text-on-surface leading-snug whitespace-nowrap">{seller.businessName}</p>
                              <p className="text-label-sm text-on-surface-variant whitespace-nowrap">{seller.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-3">
                          <span className={`inline-flex px-md py-1 rounded-full text-label-sm font-bold ${seller.type === "UMKM" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"} whitespace-nowrap`}>
                            {seller.type}
                          </span>
                        </td>
                        <td className="px-lg py-3 text-label-sm text-on-surface-variant whitespace-nowrap">
                          {seller.createdAt.toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-lg py-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20 whitespace-nowrap">
                            Menunggu Review
                          </span>
                        </td>
                        <td className="px-lg py-3">
                          <div className="flex flex-col gap-1">
                            {seller.documents.map((doc) => (
                              <a key={doc.id} href={`/api/admin/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-label-sm text-primary flex items-center gap-1 hover:underline whitespace-nowrap">
                                <Eye className="w-3 h-3" />
                                {doc.type}
                              </a>
                            ))}
                            {seller.documents.length === 0 && <span className="text-label-sm text-on-surface-variant italic whitespace-nowrap">Tidak ada</span>}
                          </div>
                        </td>
                        <td className="px-lg py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <ApproveButton sellerId={seller.id} />
                            <RejectButton sellerId={seller.id} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

      {tab === "guide" && <PanduanAdmin />}
    </DashboardShell>
  )
}

function PanduanAdmin() {
  return (
    <div className="space-y-lg max-w-2xl">
      <h3 className="text-headline-md font-bold text-on-surface">Panduan Penggunaan — Admin</h3>
      <div className="space-y-md">
        <PanduanItem icon={LayoutDashboard} title="Ringkasan" desc="Lihat statistik umum: jumlah seller yang menunggu approval, total produk aktif, dan aktivitas terbaru. Ini adalah landing page pertama saat Anda login." />
        <PanduanItem icon={Clock} title="Antrian Persetujuan" desc="Daftar seller baru yang mendaftar. Klik 'Review Documents' untuk melihat dokumen KTP/KK yang sudah dienkripsi. Setelah dicek, klik tombol centang (Approve) atau silang (Reject)." />
        <PanduanItem icon={Tag} title="Kategori" desc="Kelola kategori produk. Kategori yang diusulkan seller butuh approval Anda dulu sebelum bisa dipakai. Anda juga bisa menambahkan kategori langsung." />
        <PanduanItem icon={Users} title="Pengguna" desc="Lihat dan kelola semua pengguna yang terdaftar. Dari sini Anda bisa melihat role masing-masing user." />
        <PanduanItem icon={Building2} title="Profil Perusahaan" desc="Atur informasi perusahaan Al-Mubarok II: alamat, nomor WhatsApp, rekening bank tujuan transfer, dan gambar QRIS. Data ini muncul di halaman checkout & landing page." />
        <PanduanItem icon={List} title="Log Aktivitas" desc="Semua aktivitas penting (approve/reject seller, perubahan komisi, payout) tercatat otomatis di sini sebagai audit trail." />
      </div>
    </div>
  )
}

function PanduanItem({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-md rounded-xl bg-surface-container-high/50 border border-outline-variant/20">
      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-label-md font-bold text-on-surface">{title}</p>
        <p className="text-label-sm text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default AdminDashboard
