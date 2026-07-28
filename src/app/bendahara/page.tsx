import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"
import { TrendingUp, TrendingDown, Wallet, Percent, LayoutDashboard, CreditCard,
BookOpen, Bot, HelpCircle, type LucideIcon } from "lucide-react"
import { FinanceBarChart } from "@/components/bar-chart"
import { RevenuePieChart } from "@/components/pie-chart"
import { DashboardShell } from "@/components/dashboard-shell"
import { CommissionRuleForm } from "./commission-form"
import { PayoutAction } from "./payout-action"
import { ConfirmPaymentButton } from "./confirm-payment-button"

const SIDEBAR: { label: string; href: string; icon: string }[] = [
  { label: "Ringkasan", href: "/bendahara", icon: "LayoutDashboard" },
  { label: "Pembayaran", href: "/bendahara?tab=payments", icon: "CreditCard" },
  { label: "Aturan Komisi", href: "/bendahara?tab=commissions", icon: "Percent" },
  { label: "Pencairan", href: "/bendahara?tab=payouts", icon: "Wallet" },
  { label: "Buku Besar", href: "/bendahara?tab=ledger", icon: "BookOpen" },
  { label: "Asisten AI", href: "/aichat-bendahara", icon: "Bot" },
  { label: "Panduan", href: "/bendahara?tab=guide", icon: "HelpCircle" },
]

async function BendaharaDashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "BENDAHARA" && session.user.role !== "ADMIN")) redirect("/")

  const params = await searchParams as Record<string, string | undefined>
  const tab = params.tab || "overview"
  const ledgerPage = Math.max(1, parseInt(params.ledgerPage || "1"))
  const ledgerPerPage = 20
  const ledgerSkip = (ledgerPage - 1) * ledgerPerPage

  const [totalRevenue, totalCommission, pendingPayouts, globalRule, categoryRules, sellerRules, allSellers, pendingPayoutsList, pendingPaymentsList, ledgerEntries, ledgerTotal, commissionBySeller] = await Promise.all([
    prisma.ledgerEntry.aggregate({ where: { type: "IN" }, _sum: { amountRupiah: true } }),
    prisma.ledgerEntry.aggregate({ where: { type: "OUT" }, _sum: { amountRupiah: true } }),
    prisma.payout.aggregate({ where: { status: "PENDING" }, _sum: { amountRupiah: true }, _count: true }),
    prisma.commissionRule.findFirst({ where: { scope: "GLOBAL" }, orderBy: { createdAt: "desc" } }),
    prisma.commissionRule.findMany({ where: { scope: "CATEGORY" }, orderBy: { createdAt: "desc" } }),
    prisma.commissionRule.findMany({ where: { scope: "SELLER" }, orderBy: { createdAt: "desc" } }),
    prisma.sellerProfile.findMany({ where: { status: "APPROVED" }, include: { user: { select: { name: true } } } }),
    prisma.payout.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    prisma.order.findMany({
      where: { paymentStatus: "PENDING" },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ledgerEntry.findMany({ skip: ledgerSkip, take: ledgerPerPage, orderBy: { createdAt: "desc" } }),
    prisma.ledgerEntry.count(),
    prisma.orderItem.groupBy({
      by: ["sellerId"],
      _sum: { commissionRupiah: true },
      orderBy: { _sum: { commissionRupiah: "desc" } },
      take: 6,
    }),
  ])
  const ledgerTotalPages = Math.ceil(ledgerTotal / ledgerPerPage)

  const sellerMap = new Map(allSellers.map((s) => [s.id, s.businessName]))

  const totalIn = totalRevenue._sum.amountRupiah || 0
  const totalOut = totalCommission._sum.amountRupiah || 0
  const profit = totalIn - totalOut

  return (
    <DashboardShell
      sidebarItems={SIDEBAR}
      title="Panel Bendahara"
      roleLabel="bendahara"
      tab={tab}
      userName={session.user.name}
      extraHeader={
        <div className="flex items-center gap-md">
          <span className="text-label-sm text-on-surface-variant">{pendingPayouts._count} pencairan tertunda</span>
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        </div>
      }
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
            {/* Card 1 */}
            <div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
              <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-lowest p-lg border border-outline-variant/10 shadow-xs space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    +8.4% &uarr;
                  </span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Total Pendapatan</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(totalIn)}</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
              <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-lowest p-lg border border-outline-variant/10 shadow-xs space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                    <Percent className="w-5 h-5" />
                  </div>
                  <span className="text-label-sm text-on-surface-variant font-medium">Bulan Ini</span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Komisi Terkumpul</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(totalOut)}</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
              <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-lowest p-lg border border-outline-variant/10 shadow-xs space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                    {profit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <span className="text-label-sm text-on-surface-variant font-medium">Laba Bersih</span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Keuntungan Bersih</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(profit)}</p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
              <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-lowest p-lg border border-outline-variant/10 shadow-xs space-y-md">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    {pendingPayouts._count} Pending
                  </span>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant font-medium">Pencairan Tertunda</p>
                  <p className="text-headline-lg font-bold text-on-surface mt-1">{formatRupiah(pendingPayouts._sum.amountRupiah || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Pendapatan vs Komisi</h3>
              <FinanceBarChart data={[{ label: "All Time", revenue: totalIn, commission: totalOut }]} />
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <RevenuePieChart
                data={commissionBySeller.map((c) => ({
                  name: sellerMap.get(c.sellerId) || c.sellerId.slice(0, 8),
                  value: c._sum.commissionRupiah || 0,
                }))}
                title="Komisi per Penjual"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Pencairan Tertunda</h3>
              {pendingPayoutsList.length === 0 ? (
                <p className="text-body-md text-on-surface-variant text-center py-lg">Tidak ada pencairan tertunda.</p>
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
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Aturan Komisi Aktif</h3>
              <div className="space-y-md">
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface">Default Global</span>
                  <span className="text-on-surface font-bold">{globalRule ? `${Number(globalRule.percent)}%` : "Belum diset"}</span>
                </div>
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface">Aturan per Kategori</span>
                  <span className="text-on-surface font-bold">{categoryRules.length}</span>
                </div>
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface">Aturan per Penjual</span>
                  <span className="text-on-surface font-bold">{sellerRules.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="p-lg border-b border-outline-variant/30">
              <h3 className="text-headline-md text-on-surface font-bold">Buku Besar</h3>
            </div>
            {ledgerEntries.length === 0 ? (
              <div className="p-lg text-center text-on-surface-variant text-body-md">Belum ada entri.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                      <th className="px-lg py-3 font-medium">Tipe</th>
                      <th className="px-lg py-3 font-medium">Jumlah</th>
                      <th className="px-lg py-3 font-medium">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledgerEntries.slice(0, 10).map((entry) => (
                      <tr key={entry.id} className="border-b border-outline-variant/20">
                        <td className="px-lg py-3">
                          <span className={`inline-flex px-md py-0.5 rounded-full text-label-sm font-bold ${entry.type === "IN" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                            {entry.type === "IN" ? "Pemasukan" : "Pengeluaran"}
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

      {tab === "payments" && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-lg border-b border-outline-variant/30">
            <h3 className="text-headline-md text-on-surface font-bold">Pembayaran Tertunda</h3>
            <p className="text-label-sm text-on-surface-variant mt-1">{pendingPaymentsList.length} pesanan menunggu konfirmasi</p>
          </div>
          {pendingPaymentsList.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">Tidak ada pembayaran tertunda. Semua pesanan terkonfirmasi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-lg py-3 font-medium">Pesanan</th>
                    <th className="px-lg py-3 font-medium">Pembeli</th>
                    <th className="px-lg py-3 font-medium">Item</th>
                    <th className="px-lg py-3 font-medium">Total</th>
                    <th className="px-lg py-3 font-medium">Bukti Bayar</th>
                    <th className="px-lg py-3 font-medium">Tanggal</th>
                    <th className="px-lg py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPaymentsList.map((o) => (
                    <tr key={o.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-3">
                        <span className="text-label-sm font-mono text-on-surface">#{o.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-lg py-3">
                        <p className="text-label-md text-on-surface font-bold">{o.buyerName}</p>
                        <p className="text-label-sm text-on-surface-variant">{o.buyerPhone}</p>
                        {o.serviceNotes && (
                          <p className="text-[11px] text-primary italic max-w-xs mt-1">Catatan: {o.serviceNotes}</p>
                        )}
                      </td>
                      <td className="px-lg py-3 text-label-sm text-on-surface-variant">{o.items.length} item(s)</td>
                      <td className="px-lg py-3 text-label-md text-primary font-bold">{formatRupiah(o.totalRupiah)}</td>
                      <td className="px-lg py-3 text-label-sm">
                        {o.paymentProofUrl ? (
                          <a href={o.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold flex items-center gap-1">
                            Lihat Bukti
                          </a>
                        ) : (
                          <span className="text-on-surface-variant/50 italic">Belum diunggah</span>
                        )}
                      </td>
                      <td className="px-lg py-3 text-label-sm text-on-surface-variant">{o.createdAt.toLocaleDateString()}</td>
                      <td className="px-lg py-3"><ConfirmPaymentButton orderId={o.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "commissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
            <h3 className="text-headline-md text-on-surface font-bold mb-lg">Atur Aturan Komisi</h3>
            <CommissionRuleForm />
          </div>
          <div className="space-y-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Global</h3>
              {globalRule ? (
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface">Tarif Default</span>
                  <span className="text-on-surface font-bold">{Number(globalRule.percent)}%</span>
                </div>
              ) : (
                <p className="text-label-sm text-on-surface-variant">Belum diset. Default 0%.</p>
              )}
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-lg">
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Per Kategori</h3>
              {categoryRules.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant">Tidak ada override kategori.</p>
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
              <h3 className="text-headline-md text-on-surface font-bold mb-lg">Per Penjual</h3>
              {sellerRules.length === 0 ? (
                <p className="text-label-sm text-on-surface-variant">Tidak ada override penjual.</p>
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
              <h3 className="text-headline-md text-on-surface font-bold">Pencairan Tertunda</h3>
              <p className="text-label-sm text-on-surface-variant">{pendingPayoutsList.length} penjual menunggu pencairan</p>
            </div>
          </div>
          {pendingPayoutsList.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant text-body-md py-xxl">Semua pencairan sudah diproses.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-lg py-3 font-medium">Penjual</th>
                    <th className="px-lg py-3 font-medium">Periode</th>
                    <th className="px-lg py-3 font-medium">Jumlah</th>
                    <th className="px-lg py-3 font-medium">Aksi</th>
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
          <div className="p-lg border-b border-outline-variant/30 flex items-center justify-between">
            <h3 className="text-headline-md text-on-surface font-bold">Buku Besar</h3>
            <span className="text-label-sm text-on-surface-variant">{ledgerTotal} entri</span>
          </div>
          {ledgerEntries.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant text-body-md">Belum ada entri.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-label-sm text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-lg py-3 font-medium">Tipe</th>
                    <th className="px-lg py-3 font-medium">Jumlah</th>
                    <th className="px-lg py-3 font-medium">Pesanan</th>
                    <th className="px-lg py-3 font-medium">Tanggal</th>
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
          {ledgerTotalPages > 1 && (
            <div className="p-lg border-t border-outline-variant/30 flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">Halaman {ledgerPage} dari {ledgerTotalPages}</span>
              <div className="flex gap-2">
                {ledgerPage > 1 && (
                  <a href={`/bendahara?tab=ledger&ledgerPage=${ledgerPage - 1}`} className="px-md py-2 rounded-lg border border-outline-variant text-label-md text-on-surface hover:bg-surface-container transition-colors">Sebelumnya</a>
                )}
                {ledgerPage < ledgerTotalPages && (
                  <a href={`/bendahara?tab=ledger&ledgerPage=${ledgerPage + 1}`} className="px-md py-2 rounded-lg bg-primary text-on-primary text-label-md hover:opacity-90 transition-opacity">Selanjutnya</a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "guide" && (
        <div className="space-y-lg max-w-2xl">
          <h3 className="text-headline-md font-bold text-on-surface">Panduan Penggunaan — Bendahara</h3>
          <div className="space-y-md">
            <PanduanItemBendahara icon={LayoutDashboard} title="Ringkasan" desc="Pantau total pemasukan (dari penjualan), total komisi/ pengeluaran, profit bersih, jumlah seller aktif, dan pending payout." />
            <PanduanItemBendahara icon={CreditCard} title="Pembayaran" desc="Daftar pesanan yang menunggu konfirmasi. Klik 'Lihat Bukti' untuk cek bukti transfer pembeli. Baru klik 'Konfirmasi Pembayaran' setelah yakin uang masuk. Untuk COD langsung konfirmasi." />
            <PanduanItemBendahara icon={Percent} title="Aturan Komisi" desc="Atur persentase komisi. Urutan prioritas: Seller > Kategori > Global. Pilih scope, isi persen, lalu simpan." />
            <PanduanItemBendahara icon={Wallet} title="Pencairan" desc="Daftar pengajuan pencairan saldo dari seller. Klik 'Proses' untuk mencairkan. Pastikan saldo seller mencukupi." />
            <PanduanItemBendahara icon={BookOpen} title="Buku Besar" desc="Semua transaksi IN (pemasukan) dan OUT (pengeluaran) tercatat otomatis untuk audit keuangan." />
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

function PanduanItemBendahara({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-md rounded-xl bg-surface-container-high/50 border border-outline-variant/20">
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

export default BendaharaDashboard
