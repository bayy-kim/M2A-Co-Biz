import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, Percent, ChevronRight } from "lucide-react"
import { FinanceBarChart } from "@/components/bar-chart"
import Link from "next/link"
import { CommissionRuleForm } from "./commission-form"
import { PayoutAction } from "./payout-action"

const SIDEBAR = [
  { label: "Overview", href: "/sekretaris" },
  { label: "Commission Rules", href: "/sekretaris?tab=commissions" },
  { label: "Payouts", href: "/sekretaris?tab=payouts" },
  { label: "Ledger", href: "/sekretaris?tab=ledger" },
]

async function SekretarisDashboard({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "SEKRETARIS" && session.user.role !== "ADMIN")) redirect("/")

  const params = await searchParams
  const tab = params.tab || "overview"

  const [totalRevenue, totalCommission, pendingPayouts, globalRule, categoryRules, sellerRules, allSellers, pendingPayoutsList, ledgerEntries] = await Promise.all([
    prisma.ledgerEntry.aggregate({ where: { type: "IN" }, _sum: { amountRupiah: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: "OUT" }, _sum: { amountRupiah: true } }),
    prisma.payout.aggregate({ where: { status: "PENDING" }, _sum: { amountRupiah: true }, _count: true }),
    prisma.commissionRule.findFirst({ where: { scope: "GLOBAL" }, orderBy: { createdAt: "desc" } }),
    prisma.commissionRule.findMany({ where: { scope: "CATEGORY" }, orderBy: { createdAt: "desc" } }),
    prisma.commissionRule.findMany({ where: { scope: "SELLER" }, orderBy: { createdAt: "desc" } }),
    prisma.sellerProfile.findMany({ where: { status: "APPROVED" }, include: { user: { select: { name: true } } } }),
    prisma.payout.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    prisma.ledgerEntry.findMany({ take: 20, orderBy: { createdAt: "desc" } }),
  ])

  const sellerMap = new Map(allSellers.map((s) => [s.id, s.businessName]))

  const totalIn = totalRevenue._sum.amountRupiah || 0
  const totalOut = totalCommission._sum.amountRupiah || 0
  const profit = totalIn - totalOut

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
              <p className="text-label-sm text-on-surface-variant">Finance Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-md space-y-1">
          {SIDEBAR.map((item) => {
            const active = item.href === "/sekretaris" ? tab === "overview" : item.href.includes(tab)
            return (
              <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-md py-2.5 rounded-lg text-label-md transition-colors ${active ? "bg-primary-container text-on-primary-container font-bold" : "text-on-surface-variant hover:bg-surface-container-higher hover:text-on-surface"}`}>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-lg border-t border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label-md font-bold">{session.user.name?.[0] || "S"}</div>
            <div className="flex-1 min-w-0">
              <p className="text-label-sm font-bold text-on-surface truncate">{session.user.name}</p>
              <p className="text-label-sm text-on-surface-variant">Sekretaris</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto pb-12">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 flex items-center justify-between px-lg h-16">
          <div className="flex items-center gap-lg">
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-label-sm text-on-surface-variant">Finance</span>
              <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              <span className="text-label-sm font-bold text-on-surface capitalize">{tab}</span>
            </div>
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-container rounded-lg flex items-center justify-center">
                <span className="text-on-primary-container font-bold text-label-md">M</span>
              </div>
              <span className="text-label-md font-bold text-on-surface">Finance</span>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <span className="text-label-sm text-on-surface-variant">{pendingPayouts._count} pending payouts</span>
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          </div>
        </header>

        <div className="p-lg space-y-lg">
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
                <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
                  <div className="flex items-center gap-lg">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-success" /></div>
                    <div>
                      <p className="text-display-md font-bold text-on-surface">{formatRupiah(totalIn)}</p>
                      <p className="text-label-sm text-on-surface-variant">Total Revenue</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
                  <div className="flex items-center gap-lg">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center"><Percent className="w-6 h-6 text-warning" /></div>
                    <div>
                      <p className="text-display-md font-bold text-on-surface">{formatRupiah(totalOut)}</p>
                      <p className="text-label-sm text-on-surface-variant">Commission Collected</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
                  <div className="flex items-center gap-lg">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">{profit >= 0 ? <TrendingUp className="w-6 h-6 text-primary" /> : <TrendingDown className="w-6 h-6 text-error" />}</div>
                    <div>
                      <p className="text-display-md font-bold text-on-surface">{formatRupiah(profit)}</p>
                      <p className="text-label-sm text-on-surface-variant">Net Profit</p>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
                  <div className="flex items-center gap-lg">
                    <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center"><Wallet className="w-6 h-6 text-tertiary" /></div>
                    <div>
                      <p className="text-display-md font-bold text-on-surface">{formatRupiah(pendingPayouts._sum.amountRupiah || 0)}</p>
                      <p className="text-label-sm text-on-surface-variant">Pending Payouts ({pendingPayouts._count})</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                <h3 className="text-headline-md text-on-surface font-bold mb-lg">Revenue vs Commission</h3>
                <FinanceBarChart data={[{ label: "All Time", revenue: totalIn, commission: totalOut }]} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Pending Payouts</h3>
                  {pendingPayoutsList.length === 0 ? (
                    <p className="text-body-md text-on-surface-variant text-center py-lg">No pending payouts.</p>
                  ) : (
                    <div className="space-y-md">
                      {pendingPayoutsList.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between pb-md border-b border-outline-variant/10 last:border-0">
                          <div>
                            <p className="text-label-md text-on-surface font-bold">{sellerMap.get(p.sellerId) || p.sellerId.slice(0, 8)}</p>
                            <p className="text-label-sm text-on-surface-variant">{p.periodStart.toLocaleDateString()} - {p.periodEnd.toLocaleDateString()}</p>
                          </div>
                          <span className="text-label-md font-bold text-primary">{formatRupiah(p.amountRupiah)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Active Commission Rules</h3>
                  <div className="space-y-md">
                    <div className="flex justify-between text-label-md">
                      <span className="text-on-surface">Global Default</span>
                      <span className="text-on-surface font-bold">{globalRule ? `${Number(globalRule.percent)}%` : "Not set"}</span>
                    </div>
                    <div className="flex justify-between text-label-md">
                      <span className="text-on-surface">Per-Category Rules</span>
                      <span className="text-on-surface font-bold">{categoryRules.length}</span>
                    </div>
                    <div className="flex justify-between text-label-md">
                      <span className="text-on-surface">Per-Seller Rules</span>
                      <span className="text-on-surface font-bold">{sellerRules.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
                <div className="p-lg border-b border-outline-variant/30">
                  <h3 className="text-headline-md text-on-surface font-bold">Ledger</h3>
                </div>
                {ledgerEntries.length === 0 ? (
                  <div className="p-lg text-center text-on-surface-variant text-body-md">No entries yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                          <th className="px-lg py-3 font-medium">Type</th>
                          <th className="px-lg py-3 font-medium">Amount</th>
                          <th className="px-lg py-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerEntries.slice(0, 10).map((entry) => (
                          <tr key={entry.id} className="border-b border-outline-variant/20">
                            <td className="px-lg py-3">
                              <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${entry.type === "IN" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                                {entry.type === "IN" ? "Revenue" : "Expense"}
                              </span>
                            </td>
                            <td className="px-lg py-3 text-label-md text-on-surface font-bold">{formatRupiah(entry.amountRupiah)}</td>
                            <td className="px-lg py-3 text-label-sm text-on-surface-variant">{entry.createdAt.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "commissions" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                <h3 className="text-headline-md text-on-surface font-bold mb-lg">Set Commission Rule</h3>
                <CommissionRuleForm />
              </div>
              <div className="space-y-lg">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Global</h3>
                  {globalRule ? (
                    <div className="flex justify-between text-label-md">
                      <span className="text-on-surface">Default Rate</span>
                      <span className="text-on-surface font-bold">{Number(globalRule.percent)}%</span>
                    </div>
                  ) : (
                    <p className="text-label-sm text-on-surface-variant">Not set. Defaults to 0%.</p>
                  )}
                </div>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Per Category</h3>
                  {categoryRules.length === 0 ? (
                    <p className="text-label-sm text-on-surface-variant">No category overrides.</p>
                  ) : (
                    <div className="space-y-md">
                      {categoryRules.map((r) => (
                        <div key={r.id} className="flex justify-between text-label-md">
                          <span className="text-on-surface">{r.refId || "All"}</span>
                          <span className="text-on-surface font-bold">{Number(r.percent)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
                  <h3 className="text-headline-md text-on-surface font-bold mb-lg">Per Seller</h3>
                  {sellerRules.length === 0 ? (
                    <p className="text-label-sm text-on-surface-variant">No seller overrides.</p>
                  ) : (
                    <div className="space-y-md">
                      {sellerRules.map((r) => (
                        <div key={r.id} className="flex justify-between text-label-md">
                          <span className="text-on-surface">{r.refId}</span>
                          <span className="text-on-surface font-bold">{Number(r.percent)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "payouts" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
              <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
                <div>
                  <h3 className="text-headline-md text-on-surface font-bold">Pending Payouts</h3>
                  <p className="text-label-sm text-on-surface-variant">{pendingPayoutsList.length} seller(s) awaiting payout</p>
                </div>
              </div>
              {pendingPayoutsList.length === 0 ? (
                <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">All payouts processed.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                        <th className="px-lg py-3 font-medium">Seller</th>
                        <th className="px-lg py-3 font-medium">Period</th>
                        <th className="px-lg py-3 font-medium">Amount</th>
                        <th className="px-lg py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayoutsList.map((p) => (
                        <tr key={p.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                          <td className="px-lg py-3 text-label-md text-on-surface font-bold">{sellerMap.get(p.sellerId) || p.sellerId.slice(0, 8)}</td>
                          <td className="px-lg py-3 text-label-sm text-on-surface-variant">{p.periodStart.toLocaleDateString()} - {p.periodEnd.toLocaleDateString()}</td>
                          <td className="px-lg py-3 text-label-md text-primary font-bold">{formatRupiah(p.amountRupiah)}</td>
                          <td className="px-lg py-3"><PayoutAction payoutId={p.id} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "ledger" && (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
              <div className="p-lg border-b border-outline-variant/30">
                <h3 className="text-headline-md text-on-surface font-bold">Ledger</h3>
              </div>
              {ledgerEntries.length === 0 ? (
                <div className="p-lg text-center text-on-surface-variant text-body-md">No entries yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                        <th className="px-lg py-3 font-medium">Type</th>
                        <th className="px-lg py-3 font-medium">Amount</th>
                        <th className="px-lg py-3 font-medium">Order</th>
                        <th className="px-lg py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.map((entry) => (
                        <tr key={entry.id} className="border-b border-outline-variant/20">
                          <td className="px-lg py-3">
                            <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${entry.type === "IN" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                              {entry.type === "IN" ? "Revenue" : "Expense"}
                            </span>
                          </td>
                          <td className="px-lg py-3 text-label-md text-on-surface font-bold">{formatRupiah(entry.amountRupiah)}</td>
                          <td className="px-lg py-3 text-label-sm text-on-surface-variant">{entry.relatedOrderId ? `#${entry.relatedOrderId.slice(0, 8)}` : "-"}</td>
                          <td className="px-lg py-3 text-label-sm text-on-surface-variant">{entry.createdAt.toLocaleString()}</td>
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
        {SIDEBAR.map((item) => {
          const active = item.href === "/sekretaris" ? tab === "overview" : item.href.includes(tab)
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

export default SekretarisDashboard
