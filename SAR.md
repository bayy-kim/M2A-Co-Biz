# SAR — System Architecture & Requirements
## M2A Co-Biz

Dokumen ini adalah rujukan teknis. Semua keputusan arsitektur di sini bersifat wajib diikuti — kalau ada kebutuhan yang memaksa perubahan, diskusikan dulu sebelum menyimpang.

---

## 1. Tech Stack & Alasan

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | SSR untuk SEO landing/katalog, server actions untuk mutasi data |
| Styling | Tailwind CSS v4 + shadcn/ui | Konsisten dengan project lain, komponen aksesibel by default |
| Animasi | Framer Motion | Scroll-reveal landing page, transisi dashboard |
| Database | PostgreSQL (Neon) | Relasi kompleks + transaksi ACID untuk data keuangan |
| ORM | Prisma | Migration tooling matang, type-safe query |
| Auth | NextAuth v5 (Auth.js) | Session berbasis role, kompatibel App Router |
| Payment | Xendit | Invoice API (checkout) + Disbursement API (payout otomatis ke seller) |
| File storage | Vercel Blob (private access) | Foto produk + dokumen KTP/KK/izin usaha |
| Chart | Recharts | Analitik di dashboard Sekretaris/Ketua/Seller |
| Form & validasi | React Hook Form + Zod | Validasi ketat di client & server |
| Cron | Vercel Cron Jobs | Batch payout terjadwal, agregasi analitik |
| Deploy | Vercel | Konsisten dengan project lain |

**Aturan uang:** semua nominal Rupiah disimpan sebagai `Int` (satuan penuh Rupiah), **tidak pernah** sebagai `Float`, untuk menghindari floating-point error.

## 2. Skema Database (Prisma)

```prisma
enum Role {
  ADMIN
  KETUA
  SEKRETARIS
  SELLER
  BUYER
}

enum SellerType {
  UMKM
  JASA
}

enum SellerStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

enum DocumentType {
  KTP
  KK
  IZIN_USAHA
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}

enum CommissionScope {
  GLOBAL
  CATEGORY
  SELLER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  EXPIRED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
}

enum LedgerType {
  IN
  OUT
}

model User {
  id              String    @id @default(cuid())
  role            Role
  email           String    @unique
  passwordHash    String
  name            String
  phone           String?
  twoFactorSecret String?
  createdAt       DateTime  @default(now())
  sellerProfile   SellerProfile?
}

model SellerProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  businessName    String
  type            SellerType
  status          SellerStatus @default(PENDING)
  bankAccountName String?
  bankAccountNo   String?
  bankName        String?
  documents       SellerDocument[]
  products        Product[]
  createdAt       DateTime  @default(now())
}

model SellerDocument {
  id               String   @id @default(cuid())
  sellerId         String
  seller           SellerProfile @relation(fields: [sellerId], references: [id])
  type             DocumentType
  encryptedBlobUrl String
  uploadedAt       DateTime @default(now())
  verifiedAt       DateTime?
  verifiedBy       String?
}

model Category {
  id                       String  @id @default(cuid())
  name                     String
  defaultCommissionPercent Decimal @db.Decimal(5,2)
  products                 Product[]
}

model Product {
  id          String   @id @default(cuid())
  sellerId    String
  seller      SellerProfile @relation(fields: [sellerId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  title       String
  description String
  priceRupiah Int
  images      String[]
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
}

model CommissionRule {
  id        String   @id @default(cuid())
  scope     CommissionScope
  refId     String?
  percent   Decimal  @db.Decimal(5,2)
  updatedBy String
  createdAt DateTime @default(now())
}

model Order {
  id              String   @id @default(cuid())
  buyerName       String
  buyerPhone      String
  totalRupiah     Int
  paymentStatus   PaymentStatus @default(PENDING)
  xenditInvoiceId String?
  items           OrderItem[]
  createdAt       DateTime @default(now())
}

model OrderItem {
  id                String @id @default(cuid())
  orderId           String
  order              Order @relation(fields: [orderId], references: [id])
  productId         String
  sellerId          String
  qty               Int
  priceRupiah       Int
  commissionPercent Decimal @db.Decimal(5,2)
  commissionRupiah  Int
  sellerNetRupiah   Int
}

model Payout {
  id                   String   @id @default(cuid())
  sellerId             String
  amountRupiah         Int
  status               PayoutStatus @default(PENDING)
  xenditDisbursementId String?
  periodStart          DateTime
  periodEnd            DateTime
  createdAt            DateTime @default(now())
}

model LedgerEntry {
  id              String   @id @default(cuid())
  type            LedgerType
  amountRupiah    Int
  relatedOrderId  String?
  relatedPayoutId String?
  createdAt       DateTime @default(now())
}

model ActivityLog {
  id         String   @id @default(cuid())
  actorId    String
  action     String
  targetType String
  targetId   String
  metadata   Json?
  createdAt  DateTime @default(now())
}

model CompanyProfile {
  id          String @id @default(cuid())
  name        String @default("M2A Co-Biz")
  address     String
  latitude    Float?
  longitude   Float?
  mapEmbedUrl String?
}
```

## 3. Struktur Folder

```
app/
  (public)/            -> landing, katalog, detail produk/jasa, checkout
  (auth)/              -> login, register seller (dengan upload dokumen)
  (admin)/              -> approval queue, kategori, user management, company profile
  (ketua)/              -> overview, activity feed, grafik tren
  (sekretaris)/         -> commission rules, analitik keuangan, payout batch
  (seller)/             -> kelola produk/jasa, riwayat penjualan, riwayat payout
  api/webhooks/xendit/  -> webhook handler (signature verified)
middleware.ts           -> RBAC guard per route group berdasarkan session role
lib/
  commission-engine.ts  -> logic resolusi komisi (seller > kategori > global)
  xendit.ts             -> wrapper Invoice & Disbursement API
  encryption.ts         -> AES-256-GCM untuk dokumen sensitif
prisma/
  schema.prisma
```

## 4. Auth & RBAC

- NextAuth v5, session JWT membawa `role` claim
- `middleware.ts` memblokir akses route group berdasarkan role — **RBAC juga wajib dicek ulang di setiap server action**, tidak boleh mengandalkan middleware saja
- Login pakai credentials (email + password, hashed dengan bcrypt/argon2)
- **2FA wajib untuk role ADMIN dan SEKRETARIS** (TOTP, karena mereka pegang approval & kontrol keuangan)

## 5. Integrasi Xendit

- **Checkout**: buat Invoice via Xendit Invoice API saat Order dibuat, redirect buyer ke halaman pembayaran (QRIS/VA/e-wallet)
- **Webhook**: endpoint `api/webhooks/xendit` **wajib** verifikasi `x-callback-token`/signature sebelum memproses payload — payload tak terverifikasi ditolak
- **Disbursement**: batch payout terjadwal (Vercel Cron, mis. mingguan) memanggil Disbursement API ke rekening seller yang terdaftar; sekretaris juga bisa trigger manual dari dashboard

## 6. Commission Engine

Urutan resolusi komisi per item order:
1. Ada `CommissionRule` scope `SELLER` untuk seller ini? → pakai itu
2. Kalau tidak, dan produk punya kategori → ada `CommissionRule` scope `CATEGORY` untuk kategori itu? → pakai itu
3. Kalau tidak (termasuk kalau produk tanpa kategori) → pakai `CommissionRule` scope `GLOBAL` (default)

Logic ini **wajib** ditulis dengan test (unit test) sebelum diimplementasikan — kesalahan hitung komisi berdampak langsung ke uang nyata.

## 7. Keamanan (Prioritas Tertinggi)

Karena platform ini menyimpan dokumen KTP dan **Kartu Keluarga** (data pribadi sensitif berisi NIK seluruh anggota keluarga), standar keamanan yang dipakai:

- **Enkripsi dokumen**: file KTP/KK/izin usaha dienkripsi (AES-256-GCM) sebelum disimpan di Vercel Blob; blob diset private, akses hanya lewat signed URL berumur pendek
- **Data masking**: NIK/nomor KK tidak pernah ditampilkan penuh di tabel/list — hanya muncul di modal review admin, dan setiap kali dibuka tercatat di `ActivityLog`
- **RBAC server-side**: setiap server action mengecek role dari session, tidak percaya pada state client
- **Password hashing**: bcrypt/argon2, tidak pernah simpan plaintext
- **2FA wajib**: role Admin & Sekretaris
- **Rate limiting**: endpoint login & checkout dibatasi (mis. via Upstash Redis) untuk mencegah brute force/abuse
- **Validasi input**: Zod di semua form, server action, dan API route — tidak ada input yang dipercaya mentah
- **Validasi upload file**: cek MIME type & ukuran, tolak ekstensi executable
- **Webhook signature verification**: wajib untuk semua callback Xendit
- **Audit log lengkap**: approve/reject seller, perubahan persentase komisi, trigger payout — semua tercatat siapa & kapan
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options via `next.config.js`
- **Consent & retensi data**: checkbox consent saat registrasi seller (pemrosesan data pribadi sesuai UU PDP), kebijakan retensi/penghapusan dokumen didokumentasikan

## 8. Environment Variables (`.env.example`)

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
XENDIT_SECRET_KEY=
XENDIT_WEBHOOK_TOKEN=
BLOB_READ_WRITE_TOKEN=
ENCRYPTION_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 9. Deployment

- Project di-deploy ke Vercel (team ID sudah ada dari project sebelumnya)
- Environment variables diisi lewat Vercel dashboard, **tidak pernah** di-commit
- Prisma migration dijalankan sebagai bagian dari build step
- Cron job payout dikonfigurasi lewat `vercel.json`
