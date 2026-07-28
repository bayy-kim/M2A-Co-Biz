# AGENTS.md — M2A Co-Biz

## Konteks Proyek & Konvensi
M2A Co-Biz adalah platform marketplace + manajemen internal untuk UMKM dan penyedia jasa di bawah Al-Mubarok II. Proyek ini didesain khusus untuk wilayah hiper-lokal (Desa Banjarwaringin, Salopa). 

Saat bekerja, harap patuhi standar teknis berikut:
- **Teknologi Wajib:** Next.js 16 App Router + TypeScript, Tailwind CSS v4, Prisma + PostgreSQL (Neon), NextAuth v5, Vercel Blob.
- **Kebijakan Finansial:** Nominal Rupiah disimpan sebagai `Int` (satuan penuh), bukan `Float`, guna menghindari floating-point error.
- **UI/UX & Desain:** Wajib menggunakan ikon dari `lucide-react`. Dilarang keras menggunakan emoji di UI manapun. Kontras tinggi WCAG AA.
- **Sistem Rating:** Ulasan (`Review`) mendukung rating desimal (`Decimal` 2,1) untuk presisi nilai bintang seperti 4.5.
- **Stok Varian:** Pengurangan stok varian produk dilakukan dalam scope transaksional (`prisma.$transaction`) di backend untuk mencegah balapan konkurensi (_race conditions_).

## Riwayat Pengerjaan Proyek

### Phase 1 — Fondasi (100%)
- Project Scaffold & database schema.
- Konfigurasi NextAuth v5 dengan kredensial & Google OAuth.
- Keamanan 2FA TOTP untuk Admin dan Bendahara.

### Phase 2 — Marketplace Inti (100%)
- Katalog produk dengan filter status.
- Pendaftaran Seller mandiri dengan verifikasi berkas terenkripsi AES-256-GCM.

### Phase 3 — Transaksi & Komisi (100%)
- Sistem checkout dengan perhitungan komisi berjenjang (Seller > Kategori > Global).
- Alur persetujuan pencairan saldo (payout) manual di tingkat Bendahara.

### Phase 4 — AI Assistant & Konsultasi (100%)
- Asisten AI Gemini dengan multi-API keys pool untuk rotasi limit kredit.
- Gemini Tool Calling untuk mendeteksi barang terlaris dari database secara real-time.
- Persona Gemini AI sebagai Konsultan Bisnis & UMKM desa Banjarwaringin.
- Fallback otomatis ke WhatsApp admin jika kredit asisten AI habis.

### Phase 5 — Ulasan, Varian & Keamanan Lanjutan (100%)
- Sistem ulasan/rating bintang desimal (float) pasca order selesai (`COMPLETED`).
- Sistem manajemen stok varian produk (`ProductVariant`) transaksional.
- Fitur bukti pembayaran transfer bank (upload struk dari pembeli ke Vercel Blob privat).
- Fitur cetak struk kasir & label pengiriman langsung bagi seller.
