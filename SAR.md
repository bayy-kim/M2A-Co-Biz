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
| Payment | Manual (QRIS/transfer) | Bendahara/Admin konfirmasi via dashboard; Xendit tidak dipakai |
| File storage | Vercel Blob (private access) | Foto produk + dokumen KTP/KK/izin usaha |
| Chart | Recharts | Analitik di dashboard Bendahara/Ketua/Seller |
| Form & validasi | React Hook Form + Zod | Validasi ketat di client & server |
| Cron | Vercel Cron Jobs | Agregasi analitik (payout manual, tidak perlu cron) |
| Deploy | Vercel | Konsisten dengan project lain |

**Aturan uang:** semua nominal Rupiah disimpan sebagai `Int` (satuan penuh Rupiah), **tidak pernah** sebagai `Float`, untuk menghindari floating-point error.

## 2. Skema Database (Prisma)

Skema terkini berada di `prisma/schema.prisma`. Dokumen ini merujuk pada versi yang telah diimplementasikan:

**Model inti yang ada:**
- `User` — Pengguna dengan role (`Role`) dan relasi akun NextAuth
- `SellerProfile` — Profil penjual UMKM/Jasa dengan status persetujuan
- `SellerDocument` — Dokumen KTP/KK/izin usaha terenkripsi
- `Product` — Produk/jasa UMKM dengan varian dan review
- `ProductVariant` — Varian produk (nama, stok, harga)
- `Category` — Kategori produk dengan komisi default
- `CommissionRule` — Aturan komisi (Seller > Category > Global)
- `Review` — Ulasan pembeli dengan rating desimal `Decimal(2,1)` dan komentar
- `Order` — Pesanan pembeli dengan status pembayaran & pengerjaan
- `OrderItem` — Item dalam pesanan
- `Payout` — Pengajuan pencairan dana penjual
- `LedgerEntry` — Buku besar keuangan (IN/OUT)
- `ActivityLog` — Log audit aktivitas pengguna
- `CompanyProfile` — Profil perusahaan Al-Mubarok II

**Aturan penting terkait database:**
- Nominal uang disimpan sebagai `Int` (bukan `Float`)
- Rating ulasan menggunakan `Decimal(2,1)` untuk presisi floating-point
- Stok varian dikelola oleh model `ProductVariant` dengan pengurangan transaksional
- Dokumen sensitif dienkripsi AES-256-GCM sebelum disimpan di Vercel Blob
- Semua tabel memiliki indeks untuk performa query

## 3. Struktur Folder

```
app/
  (public)/            -> landing, katalog, detail produk/jasa, checkout
  (auth)/              -> login, register seller (dengan upload dokumen)
  (admin)/              -> approval queue, kategori, user management, company profile
  (ketua)/              -> overview, activity feed, grafik tren
  (bendahara)/          -> commission rules, analitik keuangan, payout batch
  (seller)/             -> kelola produk/jasa, riwayat penjualan, riwayat payout
   api/admin/documents/[id]    -> View seller document (decrypt + serve)
middleware.ts           -> RBAC guard per route group berdasarkan session role
lib/
  commission-engine.ts  -> logic resolusi komisi (seller > kategori > global)
  payout-utils.ts       -> payout helper (mark PAID + LedgerEntry OUT + ActivityLog)
  encryption.ts         -> AES-256-GCM untuk dokumen sensitif
prisma/
  schema.prisma
```

## 4. Auth & RBAC

- NextAuth v5, session JWT membawa `role` claim
- `middleware.ts` memblokir akses route group berdasarkan role — **RBAC juga wajib dicek ulang di setiap server action**, tidak boleh mengandalkan middleware saja
- Login pakai credentials (email + password, hashed dengan bcrypt/argon2)
- **2FA wajib untuk role ADMIN dan BENDAHARA** (TOTP, karena mereka pegang approval & kontrol keuangan)

## 5. Pembayaran (Manual)

- **Checkout**: buat Order + OrderItem + LedgerEntry saat checkout, tampilkan instruksi QRIS/transfer bank
- **Konfirmasi**: Bendahara konfirmasi pembayaran dari dashboard → `confirmPayment()` update Order ke PAID + buat LedgerEntry IN
- **Payout**: Seller ajukan payout dari dashboard; Bendahara proses dari dashboard → `processPayout()` mark PAID + LedgerEntry OUT + ActivityLog
- **Xendit tidak dipakai** — semua pembayaran manual via dashboard Bendahara

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
- **2FA wajib**: role Admin & Bendahara
- **Rate limiting**: endpoint login & checkout dibatasi (mis. via Upstash Redis) untuk mencegah brute force/abuse
- **Validasi input**: Zod di semua form, server action, dan API route — tidak ada input yang dipercaya mentah
- **Validasi upload file**: cek MIME type & ukuran, tolak ekstensi executable
- **Audit log lengkap**: approve/reject seller, perubahan persentase komisi, trigger payout — semua tercatat siapa & kapan
- **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options via `next.config.js`
- **Consent & retensi data**: checkbox consent saat registrasi seller (pemrosesan data pribadi sesuai UU PDP), kebijakan retensi/penghapusan dokumen didokumentasikan

## 8. Environment Variables (`.env.example`)

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
BLOB_READ_WRITE_TOKEN=
ENCRYPTION_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## 9. Deployment

- Project di-deploy ke Vercel (team ID sudah ada dari project sebelumnya)
- Environment variables diisi lewat Vercel dashboard, **tidak pernah** di-commit
- Prisma migration dijalankan sebagai bagian dari build step
