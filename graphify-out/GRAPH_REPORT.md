# M2A Co-Biz — Knowledge Graph

**Last updated:** 2026-07-28 (Final)
**Project:** Marketplace & Internal Management untuk UMKM Desa Banjarwaringin

## Nodes

### Applications
- `m2a-co-biz` — Next.js 16 App Router application, deployed on Vercel

### Core Domains
- `auth` — NextAuth v5, Credentials + Google OAuth, JWT, 2FA TOTP, staff bypass profile check
- `catalog` — Product listing, fuzzy search (pg_trgm), filter, pagination, star ratings
- `checkout` — Order creation, variant stock deduction (transactional), commission calc
- `payment` — Transfer/QRIS, COD, payment proof upload, Bendahara verification
- `payout` — Atomic double-payout prevention, atomic transaction processing
- `review` — Decimal(2,1) rating, comment, unique per order+product, review trigger UI
- `ai-chat` — Gemini AI with tool calling, multi-API-key rotation, WhatsApp fallback
- `ai-chat-bendahara` — Bendahara-specific AI with financial tools (summary, payments, payouts, commissions)
- `admin` — Dashboard approvals, document review via signed URL, user & category management
- `bendahara` — Payment confirmation (with proof check), commission rules, payout batch
- `seller` — Product CRUD, variant stock management, sales history, receipt printing
- `ketua` — Read-only analytics dashboard with activity feed
- `profile` — Google OAuth onboarding, lengkapi profil, phone/name completion
- `panduan` — Usage guides for all dashboards (glass modal + sidebar tab)
- `dashboard-shell` — Shared layout: desktop sidebar, mobile bottom bar, glass guide modal
- `graphify` — OpenCode plugin for knowledge graph queries

### Data Models (from schema.prisma)
- `User` — Role-based (ADMIN, KETUA, BENDAHARA, SELLER, BUYER)
- `Product` — With variants (`ProductVariant`), reviews, category, indexes
- `ProductVariant` — Named variants with stock count per product
- `Order` — With payment status, fulfillment status, items, payment proof URL
- `Review` — Decimal(2,1) rating, unique constraint on (orderId, productId)
- `ActivityLog` — Audit trail with actor, action, target, metadata
- `LedgerEntry` — Financial IN/OUT tracking
- `CommissionRule` — Cascading rules: SELLER > CATEGORY > GLOBAL
- `SellerProfile` — Business info, bank account, documents, PENDING/APPROVED status
- `SellerDocument` — AES-256-GCM encrypted KTP/KK, signed URL access

### Infrastructure
- `Vercel` — Hosting, Blob storage (with signed URLs for documents)
- `Neon` — PostgreSQL database with pg_trgm extension
- `Upstash` — Redis for rate limiting (distributed, serverless-compatible)
- `Google Gemini` — AI chat with tool calling, multi-API-key rotation pool

### Security Features
- AES-256-GCM encryption for KTP/KK documents (SHA-256 key derivation)
- Rate limiting via Redis (distributed, sliding window)
- Database indexes on all major tables (Order, Product, OrderItem, Review, ActivityLog)
- ActivityLog for all admin/bendahara actions
- Zod validation on all server actions
- Signed URLs for document access (getDownloadUrl)
- Staff roles bypass profile completion requirement

### UI Components
- `DashboardShell` — Desktop sidebar + mobile bottom nav + "?" glass guide modal + "Edit Profil" link
- `PublicHeader` — Navbar with Daftar/Masuk buttons for logged-out users
- `PublicBottomBar` — Mobile bottom navigation for public pages
- `AnimateSection/Item/Card/Float/Tap` — Framer Motion animation primitives with reduced-motion support

### OpenCode Integration
- `.opencode/opencode.json` — Config with plugin reference
- `.opencode/plugins/graphify.js` — Knowledge graph query plugin for OpenCode agents
- `AGENTS.md`, `PRD.md`, `SAR.md`, `DESIGN.md` — Project instructions loaded by OpenCode

## Edges

- `auth` → `profile` (Google OAuth → lengkapi profil for buyer/seller; staff bypass)
- `catalog` → `checkout` (product selection → order creation with variant stock)
- `catalog` → `review` (product page displays average rating + reviews)
- `checkout` → `payment` (order → payment proof upload + Bendahara confirmation)
- `payment` → `payout` (confirmed payment → seller balance and withdrawal)
- `checkout` → `review` (completed order → buyer can submit rating)
- `ai-chat` → `catalog` (Gemini tool calling → best selling products from DB)
- `ai-chat-bendahara` → `bendahara` (financial AI → payment/payout/commission data)
- `admin` → `profile` (document verification ↔ encrypted seller documents via signed URL)
- `bendahara` → `payment` (payment confirmation ↔ payment proof verification)
- `dashboard-shell` → `panduan` (glass modal guide per role)
- `seller` → `checkout` (product variants + stock → transactional deduction)
- `auth` → `aichat` (session required for AI chat to prevent key abuse)
- `graphify` → `graphify-out` (plugin reads graph.json + GRAPH_REPORT.md for queries)
