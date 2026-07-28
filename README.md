# M2A Co-Biz — Platform Marketplace & Manajemen Internal UMKM

M2A Co-Biz adalah platform marketplace modern dan sistem manajemen keuangan internal yang dirancang khusus untuk mewadahi serta memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM) beserta penyedia jasa di bawah naungan **Al-Mubarok II**. 

Platform ini mengintegrasikan alur perdagangan publik (*marketplace*) dengan kendali tata kelola internal organisasi melalui 4 peran utama (Admin, Ketua, Bendahara, Seller) dan akun Buyer terverifikasi.

---

## 📚 Dokumentasi Proyek

Untuk memahami arsitektur, kebutuhan produk, dan panduan visual secara mendalam, silakan merujuk ke dokumen berikut:
* **[PRD.md](./PRD.md)** — Deskripsi produk, kebutuhan fitur per peranan, alur proses bisnis, dan kriteria kesuksesan platform.
* **[SAR.md](./SAR.md)** — Spesifikasi teknis, keamanan enkripsi KTP/KK, skema database Prisma, dan aturan proteksi RBAC.
* **[DESIGN.md](./DESIGN.md)** & **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** — Palet warna Material 3, tipografi, grid layout, dan standar visual platform.
* **[AGENTS.md](./AGENTS.md)** — Panduan konvensi, aturan teknis, dan logs pengerjaan proyek untuk AI Coding Agent (OpenCode).

---

## 🛠️ Tech Stack & Arsitektur

M2A Co-Biz dibangun menggunakan teknologi modern untuk menjamin performa tinggi, skalabilitas, dan keamanan data tingkat tinggi:

* **Framework Utama:** Next.js 16.2.11 (App Router) + TypeScript
* **Styling & UI:** Tailwind CSS v4 + shadcn/ui + Framer Motion
* **Database & ORM:** PostgreSQL (Neon Serverless) + Prisma ORM
* **Autentikasi & Otorisasi:** NextAuth v5 + Google OAuth + Credentials (2FA TOTP untuk Admin & Bendahara)
* **Penyimpanan Berkas:** Vercel Blob (Dokumen sensitif dienkripsi lokal sebelum diunggah)
* **Manajemen Antrean & Rate Limit:** Upstash Redis (Throttling login, checkout, dan proteksi brute force)
* **Grafik Analitik:** Recharts (Breakdown keuangan internal)
* **Pengujian:** Vitest (13+ unit test kelayakan algoritma komisi & enkripsi)

---

## 🚀 Setup Pengembangan Lokal

### Prasyarat
* Node.js v20+ atau yang lebih baru
* PostgreSQL (atau gunakan Neon / database cloud)
* Upstash Redis (untuk rate limiter)

### Langkah Pemasangan
1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/bayy-kim/M2A-Co-Biz.git
   cd M2A-Co-Biz
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Salin berkas contoh `.env.example` menjadi `.env` dan isi variabel yang dibutuhkan:
   ```bash
   cp .env.example .env
   ```
   *Lihat berkas `SAR.md` Bagian 8 untuk daftar lengkap variabel lingkungan.*

4. **Migrasi Database & Seeding:**
   Jalankan migrasi Prisma untuk membuat tabel, dilanjutkan dengan seeding untuk membuat data awal dan akun staf:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Jalankan Aplikasi:**
   Mulai server pengembangan lokal:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Direktori Proyek

```text
app/
  (public)/            -> Landing page, katalog produk/jasa, detail produk, checkout
  (auth)/              -> Login (dengan TOTP), pendaftaran instan buyer/seller
  (admin)/             -> Dashboard Admin (kelola user, antrean approval, company profile)
  (ketua)/             -> Dashboard Ketua (read-only real-time activity feed & ringkasan bisnis)
  (bendahara)/         -> Dashboard Bendahara (atur komisi bertingkat, kelola batch pencairan saldo)
  (seller)/            -> Dashboard Seller (kelola produk, kelola toko, pengajuan payout)
  api/
    admin/documents/   -> Enkripsi/Dekripsi berkas sensitif KTP/KK secara dinamis
    auth/[...nextauth] -> Penanganan autentikasi
lib/
  auth.ts              -> Konfigurasi NextAuth v5, callbacks, & JWT session
  encryption.ts        -> Utilitas enkripsi AES-256-GCM untuk dokumen KTP/KK penjual
  commission-engine.ts -> Algoritma komisi (Prioritas: Seller > Kategori > Global)
  payout-utils.ts      -> Utilitas otomatisasi ledger debit/kredit internal
  rate-limit.ts        -> Throttling request client menggunakan Upstash Redis
prisma/
  schema.prisma        -> Skema basis data PostgreSQL
  seed.ts              -> Seeding data staf, UMKM, kategori, dan produk contoh
```

---

## 🔑 Akun Uji Coba (Development & Seed Data)

Setiap akun di bawah ini telah dikonfigurasi secara otomatis saat Anda menjalankan perintah `npx prisma db seed`.

| Peranan (Role) | Alamat Email | Password Default | Kode 2FA/TOTP |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@m2acobiz.com` | `admin123` | `J4TW K4DF NRSX G2LO` |
| **Ketua** | `ketua@m2acobiz.com` | `ketua123` | *Tanpa 2FA* |
| **Bendahara** | `bendahara@m2acobiz.com` | `bendahara123` | `K5UX L5EG OSTH M3NP` |
| **Seller (UMKM)** | `seller@m2acobiz.com` | `seller123` | *Tanpa 2FA* |
| **Buyer (Pembeli)** | `buyer@m2acobiz.com` | `buyer123` | *Tanpa 2FA* |

*Catatan: Masukkan kode TOTP 6-digit dari aplikasi Authenticator (seperti Google Authenticator) pada step 2 saat login sebagai Admin atau Bendahara. Salin "Kode 2FA" di atas ke aplikasi Authenticator Anda.*

---

## 🔒 Standar Keamanan & Perlindungan Data (UU PDP)

M2A Co-Biz didesain khusus untuk memenuhi regulasi **UU Pelindungan Data Pribadi (UU PDP)** karena menyimpan berkas dokumen KTP dan Kartu Keluarga (KK) pelaku usaha:
1. **Enkripsi AES-256-GCM:** Berkas KTP/KK dienkripsi secara penuh di sisi server sebelum diunggah ke Vercel Blob. URL Blob bersifat privat dan acak.
2. **Dynamic Decryption Service:** Gambar dokumen asli tidak pernah disajikan secara langsung. Gambar di-dekripsi secara dinamis dalam memori ketika Admin mengeklik tombol tinjau berkas, dan aktivitas ini dicatat dalam `ActivityLog`.
3. **Data Masking:** Nomor telepon dan data sensitif disamarkan di antarmuka publik.
4. **Proteksi API & Middleware:** Setiap aksi modifikasi (Server Actions) dan akses rute dilindungi oleh verifikasi session token NextAuth di sisi server.

---

## 🌐 Panduan Deployment (Vercel)

Proyek ini telah dikonfigurasi untuk siap di-deploy secara instan di Vercel:

1. **Hubungkan Repositori:** Buat proyek baru di Vercel dan hubungkan ke repositori GitHub M2A Co-Biz.
2. **Konfigurasi Variabel Lingkungan:** Masukkan semua nilai dari berkas `.env.local` ke pengaturan *Environment Variables* di Vercel.
3. **Prisma Build Command:** Pastikan Vercel menjalankan perintah `prisma generate` saat proses kompilasi. Anda dapat mengaturnya di `package.json` build command atau Vercel settings.
4. **Deploy:** Jalankan deployment, dan platform M2A Co-Biz akan berjalan secara otomatis di internet.

