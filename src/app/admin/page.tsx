import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { CheckCircle2, XCircle, Clock, Users, ShoppingBag, FileText, ChevronRight, AlertTriangle, Search } from "lucide-react"
import Link from "next/link"
import { maskString } from "@/lib/utils"
import { ApproveButton, RejectButton } from "./approve-button"

const SIDEBAR = [
  { label: "Overview", href: "/admin", icon: "grid" },
  { label: "Approval Queue", href: "/admin?tab=approvals", icon: "clock" },
  { label: "Categories", href: "/admin?tab=categories", icon: "tag" },
  { label: "Users", href: "/admin?tab=users", icon: "users" },
  { label: "Company Profile", href: "/admin?tab=company", icon: "building" },
  { label: "Activity Log", href: "/admin?tab=activity", icon: "list" },
]

async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
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
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 hidden lg:flex flex-col">
        <div className="p-lg border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
              <span className="text-on-primary-container font-bold text-headline-md">M</span>
            </div>
            <div>
              <h2 className="text-label-md font-bold text-on-surface">M2A Co-Biz</h2>
              <p className="text-label-sm text-on-surface-variant">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-md space-y-1">
          {SIDEBAR.map((item) => {
            const active =
              item.href === "/admin"
                ? tab === "overview"
                : item.href.includes(tab)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-md py-2.5 rounded-lg text-label-md transition-colors ${
                  active
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-higher hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-lg border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label-md font-bold">
              {session.user.name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-sm font-bold text-on-surface truncate">{session.user.name}</p>
              <p className="text-label-sm text-on-surface-variant">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-12">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-lg h-16">
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">Admin</span>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              <span className="text-label-sm font-bold text-on-surface capitalize">{tab.replace(/-/g, " ")}</span>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="text-on-primary-container font-bold text-label-md">M</span>
              </div>
              <span className="text-label-md font-bold text-on-surface">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input className="w-64 bg-surface-container-low border-none rounded-lg pl-9 pr-3 py-1.5 text-label-md focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search..." type="text" />
            </div>
            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" title={`${pendingSellers.length} pending`} />
          </div>
        </header>

        <div className="p-lg space-y-lg">
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
                      <p className="text-label-sm text-on-surface-variant">Pending Approvals</p>
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
                      <p className="text-label-sm text-on-surface-variant">Total Sellers</p>
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
                      <p className="text-label-sm text-on-surface-variant">Active Products</p>
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
                      <p className="text-label-sm text-on-surface-variant">Recent Activity</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
                  <h3 className="text-headline-md text-on-surface font-bold">Pending Seller Approvals</h3>
                  <Link href="/admin?tab=approvals" className="text-label-md text-primary hover:underline">View All</Link>
                </div>
                {pendingSellers.length === 0 ? (
                  <div className="p-lg text-center text-on-surface-variant text-body-md">No pending approvals.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                          <th className="px-lg py-3 font-medium">Name</th>
                          <th className="px-lg py-3 font-medium">Business</th>
                          <th className="px-lg py-3 font-medium">Type</th>
                          <th className="px-lg py-3 font-medium">Date</th>
                          <th className="px-lg py-3 font-medium">Docs</th>
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
                              <span className={`inline-flex px-md py-1 rounded-full text-label-sm font-bold ${
                                seller.type === "UMKM" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
                              }`}>
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
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Recent Activity</h3>
                  {recentActivity.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant text-center py-lg">No activity yet.</p>
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
                <h3 className="text-headline-md text-on-surface font-bold">Approval Queue</h3>
                <p className="text-label-sm text-on-surface-variant mt-1">{pendingSellers.length} seller(s) awaiting review</p>
              </div>
              {pendingSellers.length === 0 ? (
                <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">No pending approvals. All clear!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                        <th className="px-lg py-3 font-medium">Seller</th>
                        <th className="px-lg py-3 font-medium">Business</th>
                        <th className="px-lg py-3 font-medium">Type</th>
                        <th className="px-lg py-3 font-medium">Contact</th>
                        <th className="px-lg py-3 font-medium">Registered</th>
                        <th className="px-lg py-3 font-medium">Documents</th>
                        <th className="px-lg py-3 font-medium">Actions</th>
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
                            <span className={`inline-flex px-md py-1 rounded-full text-label-sm font-bold ${
                              seller.type === "UMKM" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
                            }`}>{seller.type}</span>
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
                                <span key={doc.id} className="text-label-sm text-primary flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {doc.type}
                                </span>
                              ))}
                              {seller.documents.length === 0 && (
                                <span className="text-label-sm text-on-surface-variant italic">No files</span>
                              )}
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

          {tab === "categories" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Category Management</h3>
              <p className="text-body-md text-on-surface-variant">Coming soon: add, edit, and manage product categories.</p>
            </div>
          )}

          {tab === "users" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">User Management</h3>
              <p className="text-body-md text-on-surface-variant">Coming soon: manage users, suspend/reactivate accounts.</p>
            </div>
          )}

          {tab === "company" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Company Profile</h3>
              <p className="text-body-md text-on-surface-variant">Coming soon: edit company name, address, map coordinates.</p>
            </div>
          )}

          {tab === "activity" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Activity Log</h3>
              {recentActivity.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No activity recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                        <th className="px-lg py-3 font-medium">Action</th>
                        <th className="px-lg py-3 font-medium">Target</th>
                        <th className="px-lg py-3 font-medium">Date</th>
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
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface-container-low border-t border-outline-variant/30 flex justify-around py-2">
        {SIDEBAR.slice(0, 5).map((item) => {
          const active = item.href === "/admin" ? tab === "overview" : item.href.includes(tab)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span className="text-label-sm">{item.label === "Approval Queue" ? `(${pendingSellers.length})` : ""}</span>
              <span className="text-label-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default AdminDashboard
