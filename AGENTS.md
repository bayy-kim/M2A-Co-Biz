# AGENTS.md — M2A Co-Biz

## Konteks Project
M2A Co-Biz adalah platform marketplace + manajemen internal untuk UMKM dan penyedia jasa di bawah Al-Mubarok II. Empat peran: Admin, Ketua, Sekretaris, Seller — plus Buyer publik. Baca **PRD.md**, **SAR.md**, dan **DESIGN.md** di root project sebelum mengerjakan apa pun.

## Project Status

### Phase 1 — Fondasi (100%)
- **Project scaffold**: Next.js 16.2.11 + TypeScript + Tailwind v4 + all deps
- **Prisma schema**: All enums + models — `prisma generate` + migrasi jalan
- **Tailwind theme**: All Material 3 color tokens, Plus Jakarta Sans + Inter, type scale, spacing
- **Auth config**: NextAuth v5 + Credentials + Google OAuth + PrismaAdapter + JWT (id, role in token/session)
- **RBAC proxy**: Role-based access control per route (`src/proxy.ts`)
- **Core lib**: db, encryption (AES-256-GCM), xendit (Invoice + Payout wrappers), commission-engine (cascade: seller > category > global), utils (maskString, formatRupiah), rate-limit (Upstash Redis)
- **Auth API route**: `/api/auth/[...nextauth]`
- **All config files**: next.config.ts, .env, .env.example
- **Login page** (`/login`): wired to NextAuth `signIn`, email+password+TOTP form, error handling + Google OAuth

### Phase 2 — Marketplace Inti (100%)
- **Landing page** (`/`): hero, featured products, about/mission, Google Maps embed (Banjarwaringin, Salopa), CTA, footer
- **Catalog** (`/catalog`): server component, data from Prisma, search/filter/sort by URL params, pagination, functional sort (newest/price asc/price desc) + price range filter, fallback categories
- **Catalog detail** (`/catalog/[id]`): full product info, seller info, breadcrumb, "Buy Now" → checkout, public bottom bar
- **Seller registration** (`/register`): multi-step form, server action, Zod validation, bcrypt hash, Prisma create User + SellerProfile, file upload ke Vercel Blob (private, terenkripsi AES-256-GCM)
- **Admin dashboard** (`/admin`): shared DashboardShell, stats cards, approval queue (approve/reject server action), activity log, tabs (categories/users/company/activity), view dokumen seller (decrypt + signed URL, tercatat di ActivityLog)
- **Seller dashboard** (`/seller`): shared DashboardShell, status badge, stats (products/earnings/payouts), product management (add product form + category from DB + propose new category), bank account info, payout request

### Phase 3 — Transaksi & Komisi (100%)
- **Checkout** (`/checkout`): buyer form (name, phone, qty), order creation, rate-limited, commission calculation via `resolveCommission()`, OrderItem + LedgerEntry, order confirmation page with QRIS/bank payment instructions
- **Commission engine**: `resolveCommission()` cascade (SELLER > CATEGORY > GLOBAL → 0%), fully wired in checkout
- **Sekretaris dashboard** (`/sekretaris`): shared DashboardShell, revenue/commission/profit stats, ledger table, set commission rules (global/category/seller), pending payout list + process action (calls Xendit Disbursement API), payments tab (confirm payment manual, create LedgerEntry IN)
- **Xendit webhook** (`/api/webhooks/xendit`): signature verification (`x-callback-token`), update Order status to PAID/EXPIRED, activity log
- **Xendit lib** (`src/lib/xendit.ts`): `createInvoice()`, `createDisbursement()`, `verifyWebhookSignature()`
- **Seller payouts**: payout request form + history table di dashboard Seller

### Phase 4 — Dashboard & Analitik (100%)
- **Ketua dashboard** (`/ketua`): shared DashboardShell, overview cards (sellers/products/orders/revenue/pending), platform summary, activity feed (read-only, real-time), full activity log table
- **Secretary dashboard** — complete — already includes FinanceBarChart + RevenuePieChart
- **Seller dashboard** — complete
- **Charts/graphs**: Recharts terintegrasi — `FinanceBarChart` (bar chart revenue vs commission) dan `RevenuePieChart` (pie chart komisi per seller) di dashboard Sekretaris

### Phase 5 — Navigasi & Konsistensi (100%)
- **Shared DashboardShell**: All four dashboards (Admin/Seller/Ketua/Sekretaris) now use `src/components/dashboard-shell.tsx` for sidebar + bottom nav — single source of truth
- **"Lihat Produk" link**: Added to sidebar footer of all dashboards (icon Store, links to `/catalog`)
- **Public bottom bar**: `src/components/public-bottom-bar.tsx` added to `/catalog` and `/catalog/[id]` — links to Beranda/Katalog/Masuk
- **Catalog filter & sort**: Functional sort dropdown (Newest / Price Low-High / Price High-Low) + price range filter popover with min/max inputs
- **Category status in catalog**: Only `APPROVED` categories shown in catalog filter pills

### Phase 6 — Kategori & Proposal (100%)
- **Schema**: Added `CategoryStatus` enum (PENDING/APPROVED/REJECTED), `status` + `requestedBySellerId` + `rejectionReason` + `createdAt` to Category model, `isActive` to User model
- **Migration**: `20260725140000_add_category_status_user_active` — creates enum, adds columns, foreign key
- **Seller proposal**: `proposeCategory()` server action + UI toggle in NewProductForm — seller can propose new category name, creates PENDING category with `requestedBySellerId`
- **Admin categories tab**: `src/app/admin/categories-tab.tsx` — shows pending proposals (proposed by seller name) with Approve/Reject buttons, plus list of active categories
- **Category actions**: `updateCategoryStatus()` server action with ActivityLog

### Phase 7 — Admin Tabs (100%)
- **Users tab**: `src/app/admin/users-tab.tsx` — full table of all users (name, email, role, business, joined, active/suspended status, toggle button), `ToggleUserStatusButton` client component
- **User toggle**: `toggleUserStatus()` server action — toggles `isActive`, syncs seller status (APPROVED/SUSPENDED), prevents suspending other admins, logs to ActivityLog
- **Company Profile tab**: `src/app/admin/company-tab.tsx` + `company-form.tsx` — full edit form (name, address, lat/lng, map URL, bank info, QRIS URL), `updateCompanyProfile()` server action with Zod validation + ActivityLog
- **Seller product form**: Category dropdown now loads from DB (approved categories only) + proposal toggle

### Phase 8 — Mobile & Polish (100%)
- Mobile bottom nav on all dashboards via shared DashboardShell
- Public bottom bar on catalog pages
- Touch-friendly button/link sizing throughout
- Responsive grid layouts (1→2→4 columns)
- Scrollable tables on mobile (`overflow-x-auto`)
- All admin placeholder tabs replaced with functional implementations

### Phase 9 — Akun Pembeli & Checkout Wajib Login (100%)
- **Schema**: Added `buyerId String?` + `buyer User?` relation to Order model + `orders Order[]` on User; migration SQL written as `20260725160000_add_buyer_id_to_order`
- **Register page**: Added buyer/seller toggle at top — "Pembeli" (ShoppingBag icon) or "Penjual" (Store icon). Buyer registration is instant single-step form (name, email, phone, password, consent); creates user with role BUYER, no approval needed
- **Buyer server action**: `registerBuyer()` — Zod validated, bcrypt hash, creates BUYER role user directly
- **Proxy auth**: `/checkout` added to `authRequiredPrefixes` — redirects to login if unauthenticated (any role can access). `/pesanan-saya` added with `["BUYER", "SELLER", "ADMIN", "KETUA", "SEKRETARIS"]` allowed roles
- **Checkout auth**: Checkout page fetches session; passes `buyerId`, `defaultName`, `defaultPhone` to CheckoutForm; if logged in, name/phone fields hidden and pre-filled via hidden inputs; server action writes `buyerId` to Order
- **Pesanan Saya route** (`/pesanan-saya`): Full order history page — lists orders with status badges (PENDING=Clock/warning, PAID=CheckCircle/success, FAILED/EXPIRED=XCircle), order totals, buyer info, dates. Empty state with CTA to catalog
- **Routing**: `getDashboardHref()` in landing page and catalog now handles BUYER → `/pesanan-saya`
- **Public bottom bar**: "Saya" item now routes to `/pesanan-saya` when logged in
- **Seed**: Added `buyer@m2acobiz.com / buyer123` (Rina Pembeli, BUYER role) to seed data
- **PRD.md**: Updated Buyer description to reflect mandatory login checkout

### Phase 10 — Perbaikan Catalog Mobile (100%)
- **Grid produk**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` → `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`; tinggi card dikecilkan (`h-36` mobile, `h-44 sm`); font judul `text-label-md sm:text-headline-md` + `line-clamp-2`; tombol Detail pakai `text-label-xs sm:text-label-md`; gap `md` mobile / `gutter` desktop
- **Filter dropdown**: `right-0` → `left-0` + `max-w-[calc(100vw-2rem)]` supaya tidak overflow layar
- **Kategori row**: disembunyikan jika cuma 1 opsi (`All Categories` doang); border separator antar section
- **Icon konsisten**: `ShoppingBag` di card produk, `Search` di search bar, `SlidersHorizontal` di filter → semua `text-primary` bukan abu-abu
- **Section rapi**: border `border-outline-variant/20` sebagai pemisah visual antara search/filter, grid, bantuan, rekomendasi

### Phase 11 — Public Bottom Bar & Register URL (100%)
- **Bottom bar baru**: 4 item — Beranda, Katalog, Daftar Jual/Dashboard (kondisional, untuk non-seller tayang Daftar Jual → `/register?role=seller`, seller lihat Dashboard → `/seller`), Pesanan; `overflow-x-auto` untuk layar sempit; icon `LayoutGrid` untuk Katalog, `Store` untuk Daftar Jual, `ShoppingBag` untuk Pesanan
- **Register query param**: `useSearchParams()` baca `?role=seller` → set initial tab ke Seller; dipakai link "Daftar Jual" dari bottom bar

### Phase 12 — Bantuan & Rekomendasi (100%)
- **Schema**: `whatsappNumber String?` di CompanyProfile; migration `20260725170000_add_whatsapp_number`
- **Admin company form**: tambah field WhatsApp Number di section Customer Support baru; Zod + server action update
- **Section Bantuan**: di bawah pagination, di dalam card gradient — logo WA, judul "Butuh Bantuan?", deskripsi, tombol `https://wa.me/<number>` (hidden jika WA kosong); `MessageCircle` icon dari lucide
- **Landing page footer**: link WhatsApp ngarah ke `wa.me` dari DB, bukan `#`
- **Section Rekomendasi**: ambil 4 produk ACTIVE lain (exclude dari hasil grid saat ini), urut terbaru; jika filter kategori, prioritaskan kategori yang sama; label "Produk Lainnya untuk Kamu" dengan `Sparkles` icon

## In Progress / TODO
- **Terms & Privacy pages**: masih placeholder, perlu diisi konten sesuai UU PDP
- **Vercel Blob token**: `BLOB_READ_WRITE_TOKEN` sudah diisi di Vercel dashboard — upload dokumen berfungsi di production
- `DATABASE_URL` env var di Vercel dashboard belum diset — build akan gagal jika tidak diisi

## Tech Stack Wajib
Next.js 16 App Router + TypeScript, Tailwind CSS v4 + shadcn/ui, Framer Motion, Prisma + PostgreSQL, NextAuth v5 (+ Google OAuth), Xendit, Vercel Blob, Recharts, React Hook Form + Zod, Upstash Redis.

## Larangan
- Tidak ada emoji di UI mana pun — pakai icon dari `lucide-react`
- Tidak ada localStorage/sessionStorage di komponen
- Tidak ada secret yang di-hardcode
- Tidak ada input yang lolos tanpa validasi Zod
- Uang selalu disimpan sebagai `Int` (Rupiah penuh), tidak pernah `Float`

## Catatan Teknis Penting
- **Shared dashboard nav**: All four dashboards use `src/components/dashboard-shell.tsx` — edit one file to change sidebar/bottom nav for all roles
- **Category lifecycle**: Seller proposes → PENDING → Admin approves → APPROVED (visible in catalog + seller form)
- **User status**: `isActive` on User model, toggled by Admin from Users tab; sellers are suspended/reactivated in sync
- **Company profile**: Single record via `CompanyProfile` model, editable from Admin → Company tab (includes `whatsappNumber` for "Hubungi via WhatsApp" buttons)
- **WhatsApp links**: `whatsappNumber` on CompanyProfile → cleaned with `.replace(/\D/g, "")` for `https://wa.me/` links
- **Catalog grid**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` with `line-clamp-2` for titles on small screens
- **PublicBottomBar**: 4 items (Beranda, Katalog, Daftar Jual/Dashboard, Pesanan Saya) with overflow-x-auto; `register?role=seller` link
- **Product sections below catalog grid**: Bantuan (WA card) + Rekomendasi (4 products excluding current results)
- **Register page**: Reads `?role=seller` from URL searchParams via `useSearchParams()`
- Fonts: Plus Jakarta Sans + Inter via `<link>` tags (bukan `next/font`; `next/font` gagal build di env ini)
- Middleware → proxy.ts (Next.js 16 deprecated middleware → proxy pattern)
- Route groups: all folders langsung di `src/app/` (`/admin`, `/login`, `/catalog`, etc.), bukan `(auth)` dll.
- Tailwind v4 → `@theme inline` (bukan `extend`)
- Xendit SDK: `{ Invoice, Payout }` via destructure, bukan `new Xendit()`
- CommissionRule `percent` adalah `Decimal` — render pake `Number()` di JSX
- Payout `sellerId` string biasa, tanpa relasi — perlu manual lookup
- Local PostgreSQL broken on Windows (ASLR `0xC0000142`) — semua DB ops via Vercel build
- Seed bersifat manual: `npm run seed` (jangan otomatis di pipeline build)
- `@vercel/blob` hanya support `access: "public"` — content dienkripsi sebelum upload

## Semua Route (16 total)
```
/                    (static)  Landing page
/terms               (static)  Terms of Service (placeholder)
/privacy             (static)  Privacy Policy (placeholder)
/login               (static)  Login (NextAuth signIn)
/register            (static)  Buyer & Seller registration (server action, toggle)
/catalog             (dynamic) Product catalog (Prisma + search/filter/sort/pagination)
/catalog/[id]        (dynamic) Product detail
/checkout            (dynamic) Checkout + order creation
/pesanan-saya        (dynamic) Buyer order history
/admin               (dynamic) Admin dashboard (approval queue + categories/users/company tabs)
/ketua               (dynamic) Ketua dashboard (read-only overview)
/sekretaris          (dynamic) Sekretaris dashboard (commission + payouts)
/seller              (dynamic) Seller dashboard (product mgmt + category proposal)
/api/auth/[...nextauth]      (dynamic) NextAuth API
/api/webhooks/xendit         (dynamic) Xendit payment callback
/api/admin/documents/[id]    (dynamic) View seller document (decrypt + serve)
/api/crons/payout            (dynamic) Cron payout (Vercel Cron, protected)
```
