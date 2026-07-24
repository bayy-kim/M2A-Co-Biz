# Graph Report - m2a-co-biz  (2026-07-24)

## Corpus Check
- 61 files · ~475,703 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 356 nodes · 408 edges · 32 communities (25 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `797f4924`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- auth.ts
- compilerOptions
- devDependencies
- SAR — System Architecture & Requirements
- instructions
- sekretaris/actions.ts
- PRD — M2A Co-Biz
- seller/actions.ts
- AGENTS.md — M2A Co-Biz
- DESIGN.md — M2A Co-Biz
- DESIGN.md — M2A Co-Biz
- DESIGN.md — M2A Co-Biz
- DESIGN.md — M2A Co-Biz
- scripts
- landing-client.tsx
- register/actions.ts
- next-auth.d.ts
- vercel.json
- commission-engine.ts
- xendit.ts
- encryption.ts
- next.config.ts
- seed.ts
- layout.tsx
- pie-chart.tsx
- eslint.config.mjs
- postcss.config.mjs
- { GET, POST }

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `formatRupiah()` - 15 edges
3. `DESIGN.md — M2A Co-Biz` - 11 edges
4. `SAR — System Architecture & Requirements` - 11 edges
5. `DESIGN.md — M2A Co-Biz` - 11 edges
6. `DESIGN.md — M2A Co-Biz` - 11 edges
7. `DESIGN.md — M2A Co-Biz` - 11 edges
8. `PRD — M2A Co-Biz` - 8 edges
9. `scripts` - 7 edges
10. `include` - 7 edges

## Surprising Connections (you probably didn't know these)
- `SekretarisDashboard()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/app/sekretaris/page.tsx → src/lib/utils.ts
- `ProductDetailPage()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/app/catalog/[id]/page.tsx → src/lib/utils.ts
- `CatalogPage()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/app/catalog/page.tsx → src/lib/utils.ts
- `CheckoutPage()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/app/checkout/page.tsx → src/lib/utils.ts
- `KetuaDashboard()` --calls--> `formatRupiah()`  [EXTRACTED]
  src/app/ketua/page.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (32 total, 7 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.05
Nodes (37): @auth/prisma-adapter, bcryptjs, framer-motion, @hookform/resolvers, lucide-react, next, next-auth, otplib (+29 more)

### Community 1 - "auth.ts"
Cohesion: 0.09
Nodes (23): ProductDetailPage(), CatalogPage(), FALLBACK_CATEGORIES, checkoutSchema, createCheckout(), CheckoutForm(), CheckoutPage(), KetuaDashboard() (+15 more)

### Community 2 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 3 - "devDependencies"
Cohesion: 0.09
Nodes (23): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/bcryptjs (+15 more)

### Community 4 - "SAR — System Architecture & Requirements"
Cohesion: 0.09
Nodes (17): 10. Aksesibilitas, 1. Brand Tone, 2. Palet Warna (Final — hasil export dari Stitch), 3. Tipografi, 4. Layout & Spacing, 5. Layout Dashboard (Admin/Ketua/Sekretaris/Seller), 6. Komponen (shadcn/ui), 7. Ikonografi (+9 more)

### Community 5 - "instructions"
Cohesion: 0.12
Nodes (17): agent, build, plan, mode, permission, instructions, bash, edit (+9 more)

### Community 6 - "sekretaris/actions.ts"
Cohesion: 0.15
Nodes (14): commissionSchema, CommissionState, confirmPayment(), ConfirmState, PayoutState, processPayout(), setCommissionRule(), CommissionRuleForm() (+6 more)

### Community 7 - "PRD — M2A Co-Biz"
Cohesion: 0.12
Nodes (16): 1. Ringkasan, 2. Peran & Pengguna, 3.1 Publik (Buyer), 3.2 Seller (UMKM & Jasa), 3.3 Admin, 3.4 Sekretaris, 3.5 Ketua, 3. Fitur per Peran (+8 more)

### Community 8 - "seller/actions.ts"
Cohesion: 0.17
Nodes (8): updateSellerStatus(), ApproveButton(), RejectButton(), SIDEBAR, { handlers, signIn, signOut, auth }, maskString(), config, roleRoutes

### Community 9 - "AGENTS.md — M2A Co-Biz"
Cohesion: 0.17
Nodes (12): AGENTS.md — M2A Co-Biz, Catatan Teknis Penting, In Progress / TODO, Konteks Project, Larangan, Phase 1 — Fondasi (100%), Phase 2 — Marketplace Inti (100%), Phase 3 — Transaksi & Komisi (100%) (+4 more)

### Community 10 - "DESIGN.md — M2A Co-Biz"
Cohesion: 0.17
Nodes (11): 10. Aksesibilitas, 1. Brand Tone, 2. Palet Warna, 3. Tipografi, 4. Layout & Spacing, 5. Layout Dashboard (Admin/Ketua/Sekretaris/Seller), 6. Komponen (shadcn/ui), 7. Ikonografi (+3 more)

### Community 11 - "DESIGN.md — M2A Co-Biz"
Cohesion: 0.17
Nodes (11): 10. Aksesibilitas, 1. Brand Tone, 2. Palet Warna, 3. Tipografi, 4. Layout & Spacing, 5. Layout Dashboard (Admin/Ketua/Sekretaris/Seller), 6. Komponen (shadcn/ui), 7. Ikonografi (+3 more)

### Community 12 - "DESIGN.md — M2A Co-Biz"
Cohesion: 0.17
Nodes (11): 10. Aksesibilitas, 1. Brand Tone, 2. Palet Warna, 3. Tipografi, 4. Layout & Spacing, 5. Layout Dashboard (Admin/Ketua/Sekretaris/Seller), 6. Komponen (shadcn/ui), 7. Ikonografi (+3 more)

### Community 13 - "DESIGN.md — M2A Co-Biz"
Cohesion: 0.18
Nodes (11): 1. Tech Stack & Alasan, 2. Skema Database (Prisma), 3. Struktur Folder, 4. Auth & RBAC, 5. Integrasi Xendit, 6. Commission Engine, 7. Keamanan (Prioritas Tertinggi), 8. Environment Variables (`.env.example`) (+3 more)

### Community 14 - "scripts"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, seed, start (+2 more)

### Community 15 - "landing-client.tsx"
Cohesion: 0.33
Nodes (5): AnimateItem(), AnimateSection(), AnimateSectionProps, AnimateStagger(), LandingClient()

### Community 16 - "register/actions.ts"
Cohesion: 0.36
Nodes (6): ACCEPTED_FILE_TYPES, fileSchema, register(), registerSchema, RegisterState, RegisterPage()

### Community 18 - "next-auth.d.ts"
Cohesion: 0.33
Nodes (5): JWT, next-auth, next-auth/jwt, Session, User

### Community 19 - "vercel.json"
Cohesion: 0.33
Nodes (5): buildCommand, crons, framework, installCommand, outputDirectory

### Community 20 - "commission-engine.ts"
Cohesion: 0.50
Nodes (3): calculateCommission(), CommissionResult, prisma

### Community 21 - "xendit.ts"
Cohesion: 0.60
Nodes (3): createDisbursement(), createInvoice(), getOpts()

### Community 22 - "encryption.ts"
Cohesion: 0.83
Nodes (3): decrypt(), encrypt(), getKey()

## Knowledge Gaps
- **191 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `AGENTS.md`, `PRD.md`, `SAR.md` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `scripts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `scripts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `PRD — M2A Co-Biz` connect `PRD — M2A Co-Biz` to `SAR — System Architecture & Requirements`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `AGENTS.md` to the rest of the system?**
  _191 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08902439024390243 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._