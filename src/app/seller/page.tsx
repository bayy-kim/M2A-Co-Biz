import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { Store, ShoppingBag, Wallet, TrendingUp, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react"
import { TrendChart } from "@/components/line-chart"
import Link from "next/link"
import { NewProductForm } from "./new-product-form"

const SIDEBAR = [
  { label: "Overview", href: "/seller" },
  { label: "Products", href: "/seller?tab=products" },
  { label: "Sales", href: "/seller?tab=sales" },
  { label: "Payouts", href: "/seller?tab=payouts" },
]

async function SellerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
    include: { documents: true, products: { include: { category: true }, orderBy: { createdAt: "desc" } } },
  })
  if (!seller) redirect("/")

  const params = await searchParams
  const tab = params.tab || "overview"

  const totalSales = await prisma.orderItem.aggregate({
    where: { sellerId: seller.id },
    _sum: { sellerNetRupiah: true },
  })

  const pendingPayouts = await prisma.payout.aggregate({
    where: { sellerId: seller.id, status: "PENDING" },
    _sum: { amountRupiah: true },
  })

  const statusBadge = {
    PENDING: { icon: Clock, class: "bg-warning/10 text-warning", label: "Pending Review" },
    APPROVED: { icon: CheckCircle2, class: "bg-success/10 text-success", label: "Active" },
    REJECTED: { icon: XCircle, class: "bg-error/10 text-error", label: "Rejected" },
    SUSPENDED: { icon: XCircle, class: "bg-error/10 text-error", label: "Suspended" },
  }[seller.status]

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
              <p className="text-label-sm text-on-surface-variant">Seller Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-md space-y-1">
          {SIDEBAR.map((item) => {
            const active = item.href === "/seller" ? tab === "overview" : item.href.includes(tab)
            return (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-md py-2.5 rounded-lg text-label-md transition-colors ${active ? "bg-primary-container text-on-primary-container font-bold" : "text-on-surface-variant hover:bg-surface-container-higher hover:text-on-surface"}`}>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-lg border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label-md font-bold">
              {session.user.name?.[0] || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-sm font-bold text-on-surface truncate">{session.user.name}</p>
              <p className="text-label-sm text-on-surface-variant">Seller</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-12">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-lg h-16">
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">Seller</span>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              <span className="text-label-sm font-bold text-on-surface capitalize">{tab}</span>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="text-on-primary-container font-bold text-label-md">M</span>
              </div>
              <span className="text-label-md font-bold text-on-surface">Seller</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <span className={`inline-flex items-center gap-1 px-md py-1 rounded-full text-label-sm font-bold ${statusBadge.class}`}>
              <statusBadge.icon className="w-3 h-3" />
              {statusBadge.label}
            </span>
          </div>
        </header>

        <div className="p-lg space-y-lg">
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
                      <p className="text-label-sm text-on-surface-variant">Total Products</p>
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
                      <p className="text-label-sm text-on-surface-variant">Total Earnings</p>
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
                      <p className="text-label-sm text-on-surface-variant">Pending Payout</p>
                    </div>
                  </div>
                </div>
              </div>

              {seller.status === "PENDING" && (
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-lg flex items-start gap-lg">
                  <Clock className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-label-md font-bold text-on-surface">Application Under Review</p>
                    <p className="text-label-sm text-on-surface-variant">Your seller application is being reviewed by our admin team. You&apos;ll be notified once approved.</p>
                  </div>
                </div>
              )}

              {seller.status === "APPROVED" && (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Earnings Overview</h3>
                  <TrendChart data={[{ label: "All Time", value: totalSales._sum.sellerNetRupiah || 0 }]} color="#22C55E" />
                </div>
              )}

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
                  <h3 className="text-headline-md text-on-surface font-bold">Your Products</h3>
                  <Link href="/seller?tab=products" className="text-label-md text-primary hover:underline">Manage</Link>
                </div>
                {seller.products.length === 0 ? (
                  <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">No products yet. Add your first product!</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                          <th className="px-lg py-3 font-medium">Product</th>
                          <th className="px-lg py-3 font-medium">Price</th>
                          <th className="px-lg py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seller.products.slice(0, 5).map((p) => (
                          <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                            <td className="px-lg py-3 text-label-md text-on-surface">{p.title}</td>
                            <td className="px-lg py-3 text-label-md text-on-surface">{formatRupiah(p.priceRupiah)}</td>
                            <td className="px-lg py-3">
                              <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${
                                p.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-surface-container-highest text-on-surface-variant"
                              }`}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                <h3 className="text-headline-md text-on-surface font-bold mb-lg">Bank Account</h3>
                {seller.bankAccountNo ? (
                  <div className="space-y-2">
                    <p className="text-label-md text-on-surface">{seller.bankName} - {seller.bankAccountNo}</p>
                    <p className="text-label-sm text-on-surface-variant">{seller.bankAccountName}</p>
                  </div>
                ) : (
                  <p className="text-body-md text-on-surface-variant">No bank account set up yet. Add one to receive payouts.</p>
                )}
              </div>
            </>
          )}

          {tab === "products" && (
            <div className="space-y-lg">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                <h3 className="text-headline-md text-on-surface font-bold mb-lg">Add New Product</h3>
                <NewProductForm />
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <div className="p-lg border-b border-outline-variant/30">
                  <h3 className="text-headline-md text-on-surface font-bold">All Products</h3>
                </div>
                {seller.products.length === 0 ? (
                  <div className="p-lg text-center text-on-surface-variant text-body-md py-xl">No products yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                          <th className="px-lg py-3 font-medium">Title</th>
                          <th className="px-lg py-3 font-medium">Category</th>
                          <th className="px-lg py-3 font-medium">Price</th>
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
                              <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${
                                p.status === "ACTIVE" ? "bg-success/10 text-success" : "bg-surface-container-highest text-on-surface-variant"
                              }`}>{p.status}</span>
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

          {tab === "sales" && <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"><h3 className="text-headline-md text-on-surface font-bold mb-lg">Sales History</h3><p className="text-body-md text-on-surface-variant">Coming soon: detailed sales breakdown with commission calculations.</p></div>}
          {tab === "payouts" && <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg"><h3 className="text-headline-md text-on-surface font-bold mb-lg">Payout History</h3><p className="text-body-md text-on-surface-variant">Coming soon: payout records and status tracking.</p></div>}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface-container-low border-t border-outline-variant/30 flex justify-around py-2">
        {SIDEBAR.map((item) => {
          const active = item.href === "/seller" ? tab === "overview" : item.href.includes(tab)
          return (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${active ? "text-primary" : "text-on-surface-variant"}`}>
              <span className={`text-label-sm ${active ? "font-bold" : ""}`}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default SellerDashboard
