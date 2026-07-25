# M2A Co-Biz

Platform marketplace + manajemen internal untuk UMKM dan penyedia jasa di bawah Al-Mubarok II.

Dokumen lengkap:
- [PRD.md](./PRD.md) — kebutuhan produk & fitur
- [SAR.md](./SAR.md) — arsitektur teknis & keamanan
- [DESIGN.md](./DESIGN.md) — panduan desain & brand
- [AGENTS.md](./AGENTS.md) — aturan kerja untuk coding agent (OpenCode)

## Tech Stack

Next.js 16 (App Router) + TypeScript · Tailwind CSS v4 + shadcn/ui · Framer Motion · Prisma + PostgreSQL (Neon) · NextAuth v5 · Xendit (payment & disbursement) · Vercel Blob · Recharts · Vercel

## Setup Lokal

```bash
git clone <repo-url>
cd M2A-Co-Biz
npm install

cp .env.example .env
# isi semua env var (lihat SAR.md bagian 8)

npx prisma migrate dev
npx prisma db seed   # buat akun dummy per role

npm run dev
```

## Struktur Folder

```
app/(public)/       -> landing, katalog, checkout
app/(auth)/         -> login, registrasi seller
app/(admin)/        -> dashboard admin
app/(ketua)/        -> dashboard ketua
app/(sekretaris)/   -> dashboard sekretaris
app/(seller)/       -> dashboard seller
lib/                -> commission engine, xendit wrapper, enkripsi
prisma/             -> schema & migration
```

Detail lengkap struktur ada di SAR.md bagian 3.

## Akun Dummy (Development)

| Role | Email | Password |
|---|---|---|
| Admin | admin@m2acobiz.test | (diset via seed script) |
| Ketua | ketua@m2acobiz.test | (diset via seed script) |
| Sekretaris | sekretaris@m2acobiz.test | (diset via seed script) |
| Seller | seller@m2acobiz.test | (diset via seed script) |

## Deploy

1. Push ke GitHub
2. Import project ke Vercel (team yang sudah ada)
3. Isi semua environment variable di Vercel dashboard
4. Set Vercel Cron untuk batch payout (lihat `vercel.json`)
5. Deploy
