import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { authenticator } from "otplib"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
  }

  const hash = (pw: string) => bcrypt.hashSync(pw, 12)
  const adminPassword = requireEnv("SEED_ADMIN_PASSWORD")
  const bendaharaPassword = requireEnv("SEED_BENDAHARA_PASSWORD")
  const adminTotpSecret = requireEnv("SEED_ADMIN_TOTP")
  const bendaharaTotpSecret = requireEnv("SEED_BENDAHARA_TOTP")

  // ── Users ──────────────────────────────────────────────
const admin = await prisma.user.upsert({
    where: { email: "muhamadaibayu@gmail.com" },
    update: {
      passwordHash: hash(adminPassword),
      twoFactorSecret: adminTotpSecret,
    },
    create: {
      email: "muhamadaibayu@gmail.com",
      name: "Admin M2A",
      passwordHash: hash(adminPassword),
      role: "ADMIN",
      phone: "081234567891",
      twoFactorSecret: adminTotpSecret,
    },
  })


  const ketua = await prisma.user.upsert({
    where: { email: "ketua@m2acobiz.com" },
    update: {},
    create: {
      email: "ketua@m2acobiz.com",
      name: "Ketua M2A",
      passwordHash: hash("ketua123"),
      role: "KETUA",
      phone: "081234567892",
    },
  })

  const bendahara = await prisma.user.upsert({
    where: { email: "bendahara@m2acobiz.com" },
    update: {
      passwordHash: hash(bendaharaPassword),
      twoFactorSecret: bendaharaTotpSecret,
    },
    create: {
      email: "bendahara@m2acobiz.com",
      name: "Bendahara M2A",
      passwordHash: hash(bendaharaPassword),
      role: "BENDAHARA",
      phone: "081234567893",
      twoFactorSecret: bendaharaTotpSecret,
    },
  })

  const sellerUser1 = await prisma.user.upsert({
    where: { email: "seller1@m2acobiz.com" },
    update: {},
    create: {
      email: "seller1@m2acobiz.com",
      name: "Asep UMKM",
      passwordHash: hash("seller123"),
      role: "SELLER",
      phone: "081234567894",
    },
  })

  const sellerUser2 = await prisma.user.upsert({
    where: { email: "seller2@m2acobiz.com" },
    update: {},
    create: {
      email: "seller2@m2acobiz.com",
      name: "Budi Jasa",
      passwordHash: hash("seller123"),
      role: "SELLER",
      phone: "081234567895",
    },
  })

  const sellerUser3 = await prisma.user.upsert({
    where: { email: "seller3@m2acobiz.com" },
    update: {},
    create: {
      email: "seller3@m2acobiz.com",
      name: "Citra Kuliner",
      passwordHash: hash("seller123"),
      role: "SELLER",
      phone: "081234567896",
    },
  })

  const buyerUser = await prisma.user.upsert({
    where: { email: "buyer@m2acobiz.com" },
    update: {},
    create: {
      email: "buyer@m2acobiz.com",
      name: "Rina Pembeli",
      passwordHash: hash("buyer123"),
      role: "BUYER",
      phone: "081234567897",
    },
  })

  console.log("  ✓ Users created")

  // ── Seller Profiles ────────────────────────────────────
  const seller1 = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser1.id },
    update: {},
    create: {
      userId: sellerUser1.id,
      businessName: "Asep Craft",
      type: "UMKM",
      status: "APPROVED",
      bankName: "BCA",
      bankAccountNo: "1234567890",
      bankAccountName: "Asep UMKM",
    },
  })

  const seller2 = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser2.id },
    update: {},
    create: {
      userId: sellerUser2.id,
      businessName: "Budi Service",
      type: "JASA",
      status: "APPROVED",
      bankName: "Mandiri",
      bankAccountNo: "0987654321",
      bankAccountName: "Budi Jasa",
    },
  })

  const seller3 = await prisma.sellerProfile.upsert({
    where: { userId: sellerUser3.id },
    update: {},
    create: {
      userId: sellerUser3.id,
      businessName: "Citra Catering",
      type: "UMKM",
      status: "PENDING",
      bankName: "BNI",
      bankAccountNo: "5556667777",
      bankAccountName: "Citra Kuliner",
    },
  })

  console.log("  ✓ Seller profiles created")

  // ── Categories ──────────────────────────────────────────
  const catKuliner = await prisma.category.upsert({
    where: { id: "seed-cat-kuliner" },
    update: { name: "Kuliner", defaultCommissionPercent: 5, status: "APPROVED" },
    create: { id: "seed-cat-kuliner", name: "Kuliner", defaultCommissionPercent: 5, status: "APPROVED" },
  })

  const catKerajinan = await prisma.category.upsert({
    where: { id: "seed-cat-kerajinan" },
    update: { name: "Kerajinan", defaultCommissionPercent: 3, status: "APPROVED" },
    create: { id: "seed-cat-kerajinan", name: "Kerajinan", defaultCommissionPercent: 3, status: "APPROVED" },
  })

  const catJasa = await prisma.category.upsert({
    where: { id: "seed-cat-jasa" },
    update: { name: "Jasa & Servis", defaultCommissionPercent: 2, status: "APPROVED" },
    create: { id: "seed-cat-jasa", name: "Jasa & Servis", defaultCommissionPercent: 2, status: "APPROVED" },
  })

  await prisma.category.upsert({
    where: { id: "seed-cat-jasa-digital" },
    update: { name: "Jasa Digital & Kreatif", defaultCommissionPercent: 2, status: "APPROVED" },
    create: { id: "seed-cat-jasa-digital", name: "Jasa Digital & Kreatif", defaultCommissionPercent: 2, status: "APPROVED" },
  })

  await prisma.category.upsert({
    where: { id: "seed-cat-jasa-otomotif" },
    update: { name: "Servis Otomotif & Mesin", defaultCommissionPercent: 2, status: "APPROVED" },
    create: { id: "seed-cat-jasa-otomotif", name: "Servis Otomotif & Mesin", defaultCommissionPercent: 2, status: "APPROVED" },
  })

  await prisma.category.upsert({
    where: { id: "seed-cat-jasa-kesehatan" },
    update: { name: "Pijat & Kesehatan", defaultCommissionPercent: 2, status: "APPROVED" },
    create: { id: "seed-cat-jasa-kesehatan", name: "Pijat & Kesehatan", defaultCommissionPercent: 2, status: "APPROVED" },
  })

  console.log("  ✓ Categories created")

  // ── Products ────────────────────────────────────────────
  // Seller 1 — with category
  await prisma.product.upsert({
    where: { id: "seed-prod-1" },
    update: {},
    create: {
      id: "seed-prod-1",
      sellerId: seller1.id,
      categoryId: catKerajinan.id,
      title: "Gelas Keramik Ukir",
      description: "Gelas keramik buatan tangan dengan ukiran khas Tasikmalaya.",
      priceRupiah: 50000,
      images: [],
      status: "ACTIVE",
    },
  })

  await prisma.product.upsert({
    where: { id: "seed-prod-2" },
    update: {},
    create: {
      id: "seed-prod-2",
      sellerId: seller1.id,
      categoryId: catKerajinan.id,
      title: "Tas Anyam Pandan",
      description: "Tas anyaman dari daun pandan alami.",
      priceRupiah: 125000,
      images: [],
      status: "ACTIVE",
    },
  })

  // Seller 1 — NO CATEGORY (untuk test fallback komisi)
  await prisma.product.upsert({
    where: { id: "seed-prod-3" },
    update: {},
    create: {
      id: "seed-prod-3",
      sellerId: seller1.id,
      categoryId: null,
      title: "Lukisan Kaligrafi",
      description: "Lukisan kaligrafi tanpa kategori — test fallback komisi.",
      priceRupiah: 200000,
      images: [],
      status: "ACTIVE",
    },
  })

  // Seller 2 — Jasa
  await prisma.product.upsert({
    where: { id: "seed-prod-4" },
    update: {},
    create: {
      id: "seed-prod-4",
      sellerId: seller2.id,
      categoryId: catJasa.id,
      title: "Service AC Rumah",
      description: "Jasa perbaikan dan perawatan AC rumah tinggal.",
      priceRupiah: 150000,
      images: [],
      status: "ACTIVE",
    },
  })

  await prisma.product.upsert({
    where: { id: "seed-prod-5" },
    update: {},
    create: {
      id: "seed-prod-5",
      sellerId: seller2.id,
      categoryId: catJasa.id,
      title: "Service Kulkas",
      description: "Jasa perbaikan kulkas semua merek.",
      priceRupiah: 200000,
      images: [],
      status: "ACTIVE",
    },
  })

  // Seller 3 — PENDING, belum ada produk
  console.log("  ✓ Products created")

  // ── Commission Rules ────────────────────────────────────
  // Global default: 5%
  await prisma.commissionRule.upsert({
    where: { id: "seed-rule-global" },
    update: { percent: 5, updatedBy: admin.id },
    create: {
      id: "seed-rule-global",
      scope: "GLOBAL",
      refId: null,
      percent: 5,
      updatedBy: admin.id,
    },
  })

  // Category override: Kuliner → 7%
  await prisma.commissionRule.upsert({
    where: { id: "seed-rule-cat-kuliner" },
    update: {},
    create: {
      id: "seed-rule-cat-kuliner",
      scope: "CATEGORY",
      refId: catKuliner.id,
      percent: 7,
      updatedBy: admin.id,
    },
  })

  // Seller override: Seller 1 (Asep Craft) → 2%
  await prisma.commissionRule.upsert({
    where: { id: "seed-rule-seller-1" },
    update: {},
    create: {
      id: "seed-rule-seller-1",
      scope: "SELLER",
      refId: seller1.id,
      percent: 2,
      updatedBy: admin.id,
    },
  })

  console.log("  ✓ Commission rules created")

  // ── Company Profile ─────────────────────────────────────
  await prisma.companyProfile.upsert({
    where: { id: "seed-company" },
    update: {},
    create: {
      id: "seed-company",
      name: "M2A Co-Biz",
      address: "Banjarwaringin, Salopa, Kabupaten Tasikmalaya, Jawa Barat 46192",
      latitude: -7.5064759,
      longitude: 108.2390261,
      mapEmbedUrl: "https://www.google.com/maps?q=-7.5064759,108.2390261&output=embed",
      bankName: "Bank Syariah Indonesia",
      bankAccountName: "M2A Co-Biz / Al-Mubarok II",
      bankAccountNo: "1234567890",
      qrisImageUrl: "/images/qris-placeholder.svg",
      whatsappNumber: "+6281234567890",
    },
  })

  console.log("  ✓ Company profile created")

  // ── Summary ─────────────────────────────────────────────
  console.log("\n── Seed Complete ──")
  console.log("Admin:      muhamadaibayu@gmail.com / admin123      (2FA TOTP enabled)")
  console.log("Ketua:      ketua@m2acobiz.com / ketua123")
  console.log("Bendahara:  bendahara@m2acobiz.com / bendahara123 (2FA TOTP enabled)")
  console.log("Seller 1:   seller1@m2acobiz.com / seller123  (Asep Craft, APPROVED, w/ & w/o category)")
  console.log("Seller 2:   seller2@m2acobiz.com / seller123  (Budi Service, APPROVED)")
  console.log("Seller 3:   seller3@m2acobiz.com / seller123  (Citra Catering, PENDING)")
  console.log("Buyer:      buyer@m2acobiz.com / buyer123      (Pembeli, can checkout & view orders)")
  console.log(`\nTOTP Secret for admin & bendahara: ${adminTotpSecret}, ${bendaharaTotpSecret}`)
  console.log("(Scan with Google Authenticator or use `otplib` to generate codes)")
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
