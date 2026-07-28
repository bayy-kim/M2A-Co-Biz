# M2A Co-Biz — Knowledge Graph

**Last updated:** 2026-07-28
**Project:** Marketplace & Internal Management untuk UMKM Desa Banjarwaringin

## Nodes

### Applications
- `m2a-co-biz` — Next.js 16 App Router application

### Core Domains
- `auth` — NextAuth v5, Credentials + Google OAuth, JWT, 2FA TOTP
- `catalog` — Product listing, fuzzy search (pg_trgm), filter, pagination
- `checkout` — Order creation, variant stock deduction, commission calculation
- `payment` — Transfer/QRIS, COD, payment proof upload via Vercel Blob
- `payout` — Seller balance withdrawal, atomic transaction processing
- `review` — Decimal(2,1) rating, comment, unique per order+product
- `ai-chat` — Gemini AI with tool calling, multi-API-key rotation, WhatsApp fallback
- `admin` — Dashboard pending approvals, document review via signed URL
- `bendahara` — Payment confirmation, commission rules, payout batch
- `seller` — Product CRUD, variant stock management, sales history, receipt printing
- `ketua` — Read-only analytics dashboard
- `profile` — Google OAuth onboarding, lengkapi profil, phone/name completion

### Data Models (from schema.prisma)
- `User` — Role-based (ADMIN, KETUA, BENDAHARA, SELLER, BUYER)
- `Product` — With variants (`ProductVariant`), reviews, category
- `Order` — With payment status, fulfillment status, items, payment proof
- `Review` — Decimal rating, unique constraint on (orderId, productId)
- `ActivityLog` — Audit trail with actor, action, target metadata
- `LedgerEntry` — Financial IN/OUT tracking

### Infrastructure
- `Vercel` — Hosting, Blob storage (with signed URLs)
- `Neon` — PostgreSQL database
- `Upstash` — Redis for rate limiting, sliding window
- `Google Gemini` — AI chat with tool calling (best seller detection)

### Security Features
- AES-256-GCM encryption for KTP/KK documents
- Rate limiting via Redis (distributed, serverless-compatible)
- Database indexes on all major tables
- ActivityLog for all admin/bendahara actions
- Zod validation on all server actions
- Signed URLs for document access

## Edges

- `auth` → `profile` (Google OAuth registration → lengkapi profil)
- `catalog` → `checkout` (product selection → order creation)
- `checkout` → `payment` (order → payment confirmation)
- `payment` → `payout` (confirmed payment → seller balance)
- `checkout` → `review` (completed order → review submission)
- `ai-chat` → `catalog` (Gemini tool calling → best selling products)
- `admin` → `profile` (document verification ↔ encrypted seller documents)
- `bendahara` → `payment` (payment confirmation ↔ payment proof verification)
