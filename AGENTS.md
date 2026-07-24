# AGENTS.md — M2A Co-Biz

## Konteks Project
M2A Co-Biz adalah platform marketplace + manajemen internal untuk UMKM dan penyedia jasa di bawah Al-Mubarok II. Empat peran: Admin, Ketua, Sekretaris, Seller — plus Buyer publik. Baca **PRD.md**, **SAR.md**, dan **DESIGN.md** di root project sebelum mengerjakan apa pun.

## Project Status

### Phase 1 — Fondasi (100%)
- **Project scaffold**: Next.js 16.2.11 + TypeScript + Tailwind v4 + all deps
- **Prisma schema**: All enums + models — `prisma generate` + `prisma migrate dev --name init` jalan
- **Tailwind theme**: All Material 3 color tokens, Plus Jakarta Sans + Inter, type scale, spacing
- **Auth config**: NextAuth v5 + Credentials + PrismaAdapter + JWT (id, role in token/session)
- **RBAC proxy**: Role-based access control per route (`src/proxy.ts`)
- **Core lib**: db, encryption (AES-256-GCM), xendit (Invoice + Payout wrappers), commission-engine (cascade: seller > category > global), utils (maskString, formatRupiah)
- **Auth API route**: `/api/auth/[...nextauth]`
- **All config files**: next.config.ts, .env, .env.example
- **Login page** (`/login`): wired to NextAuth `signIn`, email+password form, error handling

### Phase 2 — Marketplace Inti (100%)
- **Landing page** (`/`): hero, featured products, about/mission, Google Maps embed (Banjarwaringin, Salopa), CTA, footer
- **Catalog** (`/catalog`): server component, data from Prisma, search/filter by URL params, pagination, fallback categories
- **Product detail** (`/catalog/[id]`): full product info, seller info, breadcrumb, "Buy Now" → checkout
- **Seller registration** (`/register`): multi-step form, server action, Zod validation, bcrypt hash, Prisma create User + SellerProfile
- **Admin dashboard** (`/admin`): sidebar, stats cards, approval queue (approve/reject server action), activity log, tabs (categories/users/company/activity)
- **Seller dashboard** (`/seller`): status badge, stats (products/earnings/payouts), product management (add product form + table), bank account info

### Phase 3 — Transaksi & Komisi (100%)
- **Checkout** (`/checkout`): buyer form (name, phone, qty), order creation, commission calculation via `resolveCommission()`, OrderItem + LedgerEntry, order confirmation page
- **Commission engine**: `resolveCommission()` cascade (SELLER > CATEGORY > GLOBAL → 0%), fully wired in checkout
- **Sekretaris dashboard** (`/sekretaris`): revenue/commission/profit stats, ledger table, set commission rules (global/category/seller), pending payout list + process action
- **Xendit webhook** (`/api/webhooks/xendit`): signature verification (`x-callback-token`), update Order status to PAID/EXPIRED, activity log
- **Xendit lib** (`src/lib/xendit.ts`): `createInvoice()`, `createDisbursement()`, `verifyWebhookSignature()`

### Phase 4 — Dashboard & Analitik (75%)
- **Ketua dashboard** (`/ketua`): overview cards (sellers/products/orders/revenue/pending), platform summary, activity feed (read-only, real-time), full activity log table
- **Secretary dashboard** — complete (see Phase 3)
- **Seller dashboard** — complete (see Phase 2)
- **Charts/graphs**: belum ada Recharts integration

### In Progress / TODO
- **2FA TOTP**: UI di `/login` step 2 sudah ada, tapi belum diverifikasi di `auth.ts`
- **Vercel Blob**: `BLOB_READ_WRITE_TOKEN` kosong — upload dokumen registrasi belum bisa
- **Recharts**: belum dipasang di dashboard manapun
- **Seed data**: belum ada script buat seed categories, products, commission rules

## Tech Stack Wajib
Next.js 15 App Router + TypeScript, Tailwind CSS v4 + shadcn/ui, Framer Motion, Prisma + PostgreSQL, NextAuth v5, Xendit, Vercel Blob, Recharts, React Hook Form + Zod.

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

## Semua Route (13 total)
```
/               (static)  Landing page
/login          (static)  Login (NextAuth signIn)
/register       (static)  Seller registration (server action)
/catalog        (dynamic) Product catalog (Prisma + search)
/catalog/[id]   (dynamic) Product detail
/checkout       (dynamic) Checkout + order creation
/admin          (dynamic) Admin dashboard (approval queue)
/ketua          (dynamic) Ketua dashboard (read-only overview)
/sekretaris     (dynamic) Sekretaris dashboard (commission + payouts)
/seller         (dynamic) Seller dashboard (product mgmt)
/api/auth/[...nextauth] (dynamic) NextAuth API
/api/webhooks/xendit (dynamic) Xendit payment callback
```
