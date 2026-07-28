import { streamText, tool } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { formatRupiah } from "@/lib/utils"

export const maxDuration = 30

// Parse multi API keys pool from env
const getApiKeys = (): string[] => {
  const keysStr = process.env.GOOGLE_GENERATIVE_AI_API_KEYS || ""
  return keysStr.split(",").map(k => k.trim()).filter(Boolean)
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const keys = getApiKeys()

    if (keys.length === 0) {
      console.error("No Google AI API keys configured.")
      return new Response(JSON.stringify({ error: "API Key AI belum dikonfigurasi oleh Admin." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    let lastError: any = null
    
    // Try keys sequentially if any fails with 429 quota exhaustion (Round-Robin fallback)
    for (let i = 0; i < keys.length; i++) {
      const activeKey = keys[i]
      try {
        const googleClient = createGoogleGenerativeAI({
          apiKey: activeKey,
        })

        const result = streamText({
          model: googleClient("gemini-1.5-flash"),
          messages,
          system: `Kamu adalah asisten AI resmi yang cerdas dan bersahabat untuk platform marketplace M2A Co-Biz (Al-Mubarok II).
Tugas utama kamu adalah membantu calon pembeli, penjual (seller), admin, atau pengunjung umum untuk menjelajahi katalog barang/jasa, menjawab pertanyaan tentang sistem operasional M2A Co-Biz, serta bertindak sebagai Konsultan Bisnis & UMKM yang suportif.

KETENTUAN PENTING:
1. Jika pengguna bertanya tentang barang, produk, atau jasa terlaris/paling laris, kamu WAJIB menggunakan tool "getBestSellingProducts" untuk mendapatkan data akurat secara langsung dari database. Jangan pernah menebak atau mengarang data produk terlaris.
2. Ketika menyajikan data barang terlaris, sebutkan nama tokonya (Seller), jenis usahanya (UMKM/Jasa), harga dalam format Rupiah, dan total barang yang terjual. Tampilkan dengan format daftar yang rapi dan mudah dibaca di mobile.
3. Selalu berkomunikasi dengan bahasa Indonesia yang ramah, profesional, santun, dan suportif khas nilai-nilai Al-Mubarok II.
4. Kamu juga dapat menjelaskan proses pendaftaran seller, aturan komisi bertingkat (Seller > Kategori > Global), cara checkout, dan informasi bantuan.
5. KONSULTASI BISNIS & STRATEGI: Jika pengguna (terutama pelaku UMKM) bingung ingin jualan apa, butuh ide bisnis, strategi pemasaran (marketing), tips manajemen keuangan, atau cara mengurus perizinan legalitas (seperti NIB/Izin Usaha), berikan jawaban yang cerdas, aplikatif, profesional, dan memberikan motivasi yang membangun bagi wirausaha lokal.
6. JANGAN menyebarkan kredensial admin, kunci API, rahasia database, atau detail keamanan teknis apa pun kepada pengguna.`,
          tools: {
            getBestSellingProducts: tool({
              description: "Mengambil daftar barang dan jasa paling laris (terbanyak dibeli) dari database katalog M2A Co-Biz berdasarkan kuantitas penjualan yang telah diselesaikan (PAID).",
              parameters: z.object({
                limit: z.number().optional().default(5).describe("Jumlah produk terlaris yang ingin ditampilkan (default: 5)"),
              }),
              execute: async ({ limit }) => {
                try {
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
                    return { products: [], message: "Belum ada produk yang terjual secara resmi di sistem saat ini." }
                  }

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

        // Return the successfully opened stream
        return result.toDataStreamResponse()
      } catch (err: any) {
        console.warn(`API key index ${i} failed. Error:`, err.message || err)
        lastError = err
        
        // If it's a quota or rate-limit error, try next key, otherwise throw immediately to save key usage
        const isQuotaErr = err?.status === 429 || 
                           err?.message?.includes("429") || 
                           err?.message?.includes("quota") || 
                           err?.message?.includes("limit")
        
        if (!isQuotaErr) {
          throw err
        }
      }
    }

    // If all keys failed, return a specific 429 error so client triggers WhatsApp fallback
    console.error("All Gemini API keys in the pool failed.", lastError)
    return new Response(
      JSON.stringify({ 
        error: "Kapasitas kuota asisten AI penuh. Silakan beralih ke WhatsApp admin.",
        code: "AI_QUOTA_EXHAUSTED" 
      }), 
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (err) {
    console.error("AI Chat Handler Error:", err)
    return new Response(JSON.stringify({ error: "Terjadi kesalahan internal pada server AI." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
