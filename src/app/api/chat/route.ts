import { streamText, tool } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Configured for Google Gemini using GOOGLE_GENERATIVE_AI_API_KEY from environment
    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages,
      system: `Kamu adalah asisten AI resmi yang cerdas dan bersahabat untuk platform marketplace M2A Co-Biz (Al-Mubarok II).
Tugas utama kamu adalah membantu calon pembeli, penjual (seller), admin, atau pengunjung umum untuk menjelajahi katalog barang/jasa dan menjawab pertanyaan tentang sistem operasional M2A Co-Biz.

KETENTUAN PENTING:
1. Jika pengguna bertanya tentang barang, produk, atau jasa terlaris/paling laris, kamu WAJIB menggunakan tool "getBestSellingProducts" untuk mendapatkan data akurat secara langsung dari database. Jangan pernah menebak atau mengarang data produk terlaris.
2. Ketika menyajikan data barang terlaris, sebutkan nama tokonya (Seller), jenis usahanya (UMKM/Jasa), harga dalam format Rupiah, dan total barang yang terjual. Tampilkan dengan format daftar yang rapi dan mudah dibaca di mobile.
3. Selalu berkomunikasi dengan bahasa Indonesia yang ramah, profesional, santun, dan suportif khas nilai-nilai Al-Mubarok II.
4. Kamu juga dapat menjelaskan proses pendaftaran seller, aturan komisi bertingkat (Seller > Kategori > Global), cara checkout, dan informasi bantuan.
5. JANGAN menyebarkan kredensial admin, kunci API, rahasia database, atau detail keamanan teknis apa pun kepada pengguna.`,
      tools: {
        getBestSellingProducts: tool({
          description: "Mengambil daftar barang dan jasa paling laris (terbanyak dibeli) dari database katalog M2A Co-Biz berdasarkan kuantitas penjualan yang telah diselesaikan (PAID).",
          parameters: z.object({
            limit: z.number().optional().default(5).describe("Jumlah produk terlaris yang ingin ditampilkan (default: 5)"),
          }),
          execute: async ({ limit }) => {
            try {
              // 1. Group OrderItems by product, summing up quantities for PAID orders
              const topItems = await prisma.orderItem.groupBy({
                by: ["productId"],
                _sum: {
                  qty: true,
                },
                where: {
                  order: {
                    paymentStatus: "PAID",
                  },
                },
                orderBy: {
                  _sum: {
                    qty: "desc",
                  },
                },
                take: limit,
              })

              if (topItems.length === 0) {
                return { products: [], message: "Belum ada produk yang tercatat lunas (terjual) di sistem saat ini." }
              }

              // 2. Fetch full details for these products, including their sellers and categories
              const productIds = topItems.map((item) => item.productId)
              const products = await prisma.product.findMany({
                where: {
                  id: { in: productIds },
                  status: "ACTIVE",
                },
                include: {
                  seller: {
                    select: {
                      businessName: true,
                      type: true,
                    },
                  },
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              })

              // 3. Map aggregates with product details
              const results = topItems
                .map((item) => {
                  const p = products.find((prod) => prod.id === item.productId)
                  if (!p) return null
                  return {
                    id: p.id,
                    title: p.title,
                    price: formatRupiah(p.priceRupiah),
                    sellerName: p.seller.businessName,
                    sellerType: p.seller.type,
                    categoryName: p.category?.name || "Tanpa Kategori",
                    totalSold: item._sum.qty || 0,
                  }
                })
                .filter(Boolean)

              return { products: results }
            } catch (err) {
              console.error("Error in getBestSellingProducts tool:", err)
              return { error: "Gagal mengambil data dari database." }
            }
          },
        }),
      },
      maxSteps: 5,
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error("AI Chat Handler Error:", err)
    return new Response(JSON.stringify({ error: "Terjadi kesalahan internal pada server AI." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
