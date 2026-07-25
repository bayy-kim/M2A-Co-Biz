# AGENTS.md — M2A Co-Biz

## Konteks Project
M2A Co-Biz adalah platform marketplace + manajemen internal untuk UMKM dan penyedia jasa di bawah Al-Mubarok II. Empat peran: Admin, Ketua, Sekretaris, Seller — plus Buyer publik. Baca **PRD.md**, **SAR.md**, dan **DESIGN.md** di root project sebelum mengerjakan apa pun.

## Project Status

### Phase 1 — Fondasi (100%)
- **Project scaffold**: Next.js 16.2.11 + TypeScript + Tailwind v4 + all deps
- **Prisma schema**: All enums + models — `prisma generate` + `prisma migrate dev --name init` jalan
- **Tailwind theme**: All Material 3 color tokens, Plus Jakarta Sans + Inter, type scale, spacing
- **Auth config**: NextAuth v5 + Credentials + Google OAuth + PrismaAdapter + JWT (id, role in token/session)
- **RBAC proxy**: Role-based access control per route (`src/proxy.ts`)
- **Core lib**: db, encryption (AES-256-GCM), xendit (Invoice + Payout wrappers), commission-engine (cascade: seller > category > global), utils (maskString, formatRupiah), rate-limit (Upstash Redis)
- **Auth API route**: `/api/auth/[...nextauth]`
- **All config files**: next.config.ts, .env, .env.example
- **Login page** (`/login`): wired to NextAuth `signIn`, email+password+tOTP form, error handling + Google OAuth

### Phase 2 — Marketplace Inti (100%)
- **Landing page** (`/`): hero, featured products, about/mission, Google Maps embed (Banjarwaringin, Salopa), CTA, footer
- **Catalog** (`/catalog`): server component, data from Prisma, search/filter by URL params, pagination, fallback categories
- **Product detail** (`/catalog/[id]`): full product info, seller info, breadcrumb, "Buy Now" → checkout
- **Seller registration** (`/register`): multi-step form, server action, Zod validation, bcrypt hash, Prisma create User + SellerProfile, file upload ke Vercel Blob (private, terenkripsi AES-256-GCM)
- **Admin dashboard** (`/admin`): sidebar, stats cards, approval queue (approve/reject server action), activity log, tabs (categories/users/company/activity), view dokumen seller (decrypt + signed URL, tercatat di ActivityLog)
- **Seller dashboard** (`/seller`): status badge, stats (products/earnings/payouts), product management (add product form + table), bank account info

### Phase 3 — Transaksi & Komisi (100%)
- **Checkout** (`/checkout`): buyer form (name, phone, qty), order creation, rate-limited, commission calculation via `resolveCommission()`, OrderItem + LedgerEntry, order confirmation page with QRIS/bank payment instructions
- **Commission engine**: `resolveCommission()` cascade (SELLER > CATEGORY > GLOBAL → 0%), fully wired in checkout
- **Sekretaris dashboard** (`/sekretaris`): revenue/commission/profit stats, ledger table, set commission rules (global/category/seller), pending payout list + process action (calls Xendit Disbursement API), payments tab (confirm payment manual, create LedgerEntry IN)
- **Xendit webhook** (`/api/webhooks/xendit`): signature verification (`x-callback-token`), update Order status to PAID/EXPIRED, activity log
- **Xendit lib** (`src/lib/xendit.ts`): `createInvoice()`, `createDisbursement()`, `verifyWebhookSignature()`
- **Seller payouts**: payout request form + history table di dashboard Seller

### Phase 4 — Dashboard & Analitik (100%)
- **Ketua dashboard** (`/ketua`): overview cards (sellers/products/orders/revenue/pending), platform summary, activity feed (read-only, real-time), full activity log table
- **Secretary dashboard** — complete — includes FinanceBarChart (revenue vs commission) + RevenuePieChart (commission by seller)
- **Seller dashboard** — complete
- **Charts/graphs**: Recharts terintegrasi — `FinanceBarChart` (bar chart revenue vs commission) dan `RevenuePieChart` (pie chart komisi per seller) di dashboard Sekretaris

### Phase 5 — Keamanan & Polish (100%)
- **Debug route** (`/api/auth/debug-2fa`): dihapus (kebocoran TOTP secret)
- **Seed production**: dihapus dari build pipeline — `prisma db seed` hanya manual via `npm run seed`
- **Upload dokumen**: seller dokumen (KTP/KK/izin usaha) dienkripsi AES-256-GCM sebelum disimpan ke Vercel Blob (private), decrypt saat admin view, tercatat di ActivityLog
- **Rate limiting**: Upstash Redis rate limiting aktif di `authorize()` (login) dan `createCheckout()` (checkout)
- **Consent form**: Bahasa Indonesia, link Terms + Privacy mengarah ke halaman placeholder
- **2FA TOTP**: diverifikasi di `auth.ts` via `otplib`, UI step 2 di `/login` — berfungsi penuh
- **Dokumentasi versi**: Next.js 16 di seluruh dokumen

### Phase 6 — Deploy (100%)
- Deployed to Vercel: `shop-m2a.vercel.app`
- Environment variables configured via Vercel dashboard
- Prisma migration sebagai bagian dari build step (`prisma generate` + `prisma migrate deploy`)
- Cron job payout dikonfigurasi di `vercel.json` (`/api/crons/payout`, setiap Senin 00:00), dilindungi `CRON_SECRET`

## In Progress / TODO
- **Category management**: admin tab `categories` masih placeholder "coming soon"
- **User management**: admin tab `users` masih placeholder "coming soon"
- **Company profile edit**: admin tab `company` masih placeholder "coming soon"
- **Seed data**: seed script ada untuk users, tapi kategori & produk belum di-seed (perlu perbaikan seed script)
- **Terms & Privacy pages**: masih placeholder, perlu diisi konten sesuai UU PDP
- **Vercel Blob token**: `BLOB_READ_WRITE_TOKEN` sudah diisi di Vercel dashboard — upload dokumen berfungsi di production

## Tech Stack Wajib
Next.js 16 App Router + TypeScript, Tailwind CSS v4 + shadcn/ui, Framer Motion, Prisma + PostgreSQL, NextAuth v5 (+ Google OAuth), Xendit, Vercel Blob, Recharts, React Hook Form + Zod, Upstash Redis.

## Larangan
- Tidak ada emoji di UI mana pun — pakai icon dari `lucide-react`
- Tidak ada localStorage/sessionStorage di komponen
- Tidak ada secret yang di-hardcode
- Tidak ada input yang lolos tanpa validasi Zod
- Uang selalu disimpan sebagai `Int` (Rupiah penuh), tidak pernah `Float`

## Catatan Teknis Penting
- Fonts: Plus Jakarta Sans + Inter via `<link>` tags (bukan `next/font`; `next/font` gagal build di env ini)
- Middleware → proxy.ts (Next.js 16 deprecated middleware → proxy pattern)
- Route groups: all folders langsung di `src/app/` (`/admin`, `/login`, `/catalog`, etc.), bukan `(auth)` dll.
- Tailwind v4 → `@theme inline` (bukan `extend`)
- Xendit SDK: `{ Invoice, Payout }` via destructure, bukan `new Xendit()`
- CommissionRule `percent` adalah `Decimal` — render pake `Number()` di JSX
- Payout `sellerId` string biasa, tanpa relasi — perlu manual lookup
- Local PostgreSQL broken on Windows (ASLR `0xC0000142`) — semua DB ops via Vercel build
- Seed bersifat manual: `npm run seed` (jangan otomatis di pipeline build)

## Semua Route (16 total)
```
/                    (static)  Landing page
/terms               (static)  Terms of Service (placeholder)
/privacy             (static)  Privacy Policy (placeholder)
/login               (static)  Login (NextAuth signIn)
/register            (static)  Seller registration (server action)
/catalog             (dynamic) Product catalog (Prisma + search)
/catalog/[id]        (dynamic) Product detail
/checkout            (dynamic) Checkout + order creation
/admin               (dynamic) Admin dashboard (approval queue)
/ketua               (dynamic) Ketua dashboard (read-only overview)
/sekretaris          (dynamic) Sekretaris dashboard (commission + payouts)
/seller              (dynamic) Seller dashboard (product mgmt)
/api/auth/[...nextauth]      (dynamic) NextAuth API
/api/webhooks/xendit         (dynamic) Xendit payment callback
/api/admin/documents/[id]    (dynamic) View seller document (decrypt + serve)
/api/crons/payout            (dynamic) Cron payout (Vercel Cron, protected)
```
