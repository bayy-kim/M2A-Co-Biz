import { streamText, tool } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"

export const maxDuration = 30

const getApiKeys = (): string[] => {
  const keysStr = process.env.GOOGLE_GENERATIVE_AI_API_KEYS || ""
  return keysStr.split(",").map(k => k.trim()).filter(Boolean)
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const keys = getApiKeys()

    if (keys.length === 0) {
      return new Response(JSON.stringify({ error: "API Key AI belum dikonfigurasi." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    for (let i = 0; i < keys.length; i++) {
      try {
        const googleClient = createGoogleGenerativeAI({ apiKey: keys[i] })

        const result = streamText({
          model: googleClient("gemini-1.5-flash"),
          messages,
          system: `Kamu adalah asisten AI khusus **Bendahara M2A Co-Biz** (Al-Mubarok II).

TUGAS UTAMA:
1. Membantu Bendahara mencatat dan memantau arus keuangan
2. Memberikan ringkasan pemasukan, pengeluaran, komisi, dan profit
3. Membantu mengecek pesanan yang pending pembayaran
4. Membantu mengecek pengajuan pencairan dana seller

KETENTUAN:
- Selalu gunakan tool yang tersedia untuk mengambil data AKTUAL dari database
- Saat menyajikan data keuangan, tampilkan dalam format Rupiah yang rapi
- Berkomunikasi dengan bahasa Indonesia yang profesional, santun, dan jelas
- Jika ada selisih atau anomali keuangan, sampaikan dengan transparan
- JANGAN menyebarkan kredensial admin, kunci API, atau rahasia database`,

          tools: {
            getFinancialSummary: tool({
              description: "Mengambil ringkasan keuangan total: pemasukan (IN), pengeluaran/komisi (OUT), jumlah seller, produk aktif, dan profit bersih.",
              parameters: z.object({}),
              execute: async () => {
                try {
                  const [totalIn, totalOut, totalSellers, totalProducts, pendingPayments, pendingPayouts] = await Promise.all([
                    prisma.ledgerEntry.aggregate({ where: { type: "IN" }, _sum: { amountRupiah: true } }),
                    prisma.ledgerEntry.aggregate({ where: { type: "OUT" }, _sum: { amountRupiah: true } }),
                    prisma.sellerProfile.count({ where: { status: "APPROVED" } }),
                    prisma.product.count({ where: { status: "ACTIVE" } }),
                    prisma.order.count({ where: { paymentStatus: "PENDING" } }),
                    prisma.payout.count({ where: { status: "PENDING" } }),
                  ])

                  const pemasukan = totalIn._sum.amountRupiah || 0
                  const pengeluaran = totalOut._sum.amountRupiah || 0
                  const profit = pemasukan - pengeluaran

                  return {
                    pemasukan: formatRupiah(pemasukan),
                    pengeluaran: formatRupiah(pengeluaran),
                    profit: formatRupiah(profit),
                    totalSellerAktif: totalSellers,
                    totalProdukAktif: totalProducts,
                    pendingPembayaran: pendingPayments,
                    pendingPencairan: pendingPayouts,
                  }
                } catch (err) {
                  return { error: "Gagal mengambil data keuangan." }
                }
              },
            }),

            getPendingPaymentsList: tool({
              description: "Mengambil daftar pesanan yang masih pending menunggu konfirmasi pembayaran beserta nominalnya.",
              parameters: z.object({
                limit: z.number().optional().default(5),
              }),
              execute: async ({ limit }) => {
                try {
                  const orders = await prisma.order.findMany({
                    where: { paymentStatus: "PENDING" },
                    include: { items: true },
                    orderBy: { createdAt: "asc" },
                    take: limit,
                  })

                  return orders.map(o => ({
                    id: o.id.slice(0, 8),
                    pembeli: o.buyerName,
                    total: formatRupiah(o.totalRupiah),
                    metode: o.paymentMethod,
                    tanggal: o.createdAt.toLocaleDateString("id-ID"),
                    sudahUploadBukti: !!o.paymentProofUrl,
                  }))
                } catch {
                  return { error: "Gagal mengambil data pembayaran." }
                }
              },
            }),

            getPendingPayouts: tool({
              description: "Mengambil daftar pengajuan pencairan dana dari seller yang masih pending.",
              parameters: z.object({
                limit: z.number().optional().default(5),
              }),
              execute: async ({ limit }) => {
                try {
                  const payouts = await prisma.payout.findMany({
                    where: { status: "PENDING" },
                    orderBy: { createdAt: "asc" },
                    take: limit,
                  })

                  const sellerIds = payouts.map(p => p.sellerId)
                  const sellers = await prisma.sellerProfile.findMany({
                    where: { id: { in: sellerIds } },
                    select: { id: true, businessName: true },
                  })
                  const sellerMap = new Map(sellers.map(s => [s.id, s.businessName]))

                  return payouts.map(p => ({
                    seller: sellerMap.get(p.sellerId) || "Unknown",
                    jumlah: formatRupiah(p.amountRupiah),
                    periode: `${p.periodStart.toLocaleDateString("id-ID")} - ${p.periodEnd.toLocaleDateString("id-ID")}`,
                    tanggal: p.createdAt.toLocaleDateString("id-ID"),
                  }))
                } catch {
                  return { error: "Gagal mengambil data pencairan." }
                }
              },
            }),

            getCommissionReport: tool({
              description: "Mengambil laporan komisi — total komisi terkumpul, aturan global, kategori, dan per seller.",
              parameters: z.object({}),
              execute: async () => {
                try {
                  const [totalCommission, globalRule, categoryRules, sellerRules] = await Promise.all([
                    prisma.orderItem.aggregate({ _sum: { commissionRupiah: true } }),
                    prisma.commissionRule.findFirst({ where: { scope: "GLOBAL" }, orderBy: { createdAt: "desc" } }),
                    prisma.commissionRule.findMany({ where: { scope: "CATEGORY" }, orderBy: { createdAt: "desc" } }),
                    prisma.commissionRule.findMany({ where: { scope: "SELLER" }, orderBy: { createdAt: "desc" } }),
                  ])

                  return {
                    totalKomisiTerkumpul: formatRupiah(totalCommission._sum.commissionRupiah || 0),
                    aturanGlobal: globalRule ? `${Number(globalRule.percent)}%` : "Belum diset",
                    aturanKategori: categoryRules.length,
                    aturanSeller: sellerRules.length,
                  }
                } catch {
                  return { error: "Gagal mengambil laporan komisi." }
                }
              },
            }),
          },
          maxSteps: 5,
        })

        return result.toDataStreamResponse()
      } catch (err: any) {
        const isQuotaErr = err?.status === 429 || err?.message?.includes("429")
        if (!isQuotaErr) throw err
      }
    }

    return new Response(
      JSON.stringify({ error: "Kapasitas kuota asisten AI penuh.", code: "AI_QUOTA_EXHAUSTED" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("AI Chat Bendahara Error:", err)
    return new Response(JSON.stringify({ error: "Terjadi kesalahan internal." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
