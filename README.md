# M2A Co-Biz — Analisis Strategis & Manajemen Internal UMKM

M2A Co-Biz adalah platform marketplace hiper-lokal dan sistem manajemen keuangan terintegrasi yang dirancang khusus untuk mewadahi serta memberdayakan Usaha Mikro, Kecil, dan Menengah (UMKM) serta penyedia jasa di bawah naungan **Al-Mubarok II** di kawasan **Desa Banjarwaringin, Salopa, Tasikmalaya**.

---

## 📊 Analisis Strategis SWOT (Desa Banjarwaringin)

Untuk memastikan keberlanjutan jangka panjang dan keselarasan platform dengan kebutuhan ekonomi lokal di Desa Banjarwaringin, berikut adalah kajian SWOT yang diterapkan pada tata kelola M2A Co-Biz:

### 1. Strengths (Kekuatan)
* **Hiper-Lokal & Terpercaya:** Dibina langsung oleh Al-Mubarok II yang memiliki kredibilitas sosial tinggi di tengah masyarakat Banjarwaringin.
* **Performa Tingkat Tinggi:** Arsitektur Next.js 16 Server-Side Rendering (SSR) menjamin halaman ter-load instan di HP dengan sinyal terbatas di wilayah pedesaan.
* **Keamanan Data Pribadi Kokoh:** Berkas dokumen sensitif (KTP/KK) dienkripsi dengan standar industri AES-256-GCM secara otomatis sebelum disimpan di awan (Vercel Blob).
* **AI Business Consultant Terpadu:** Fitur AI Chatbot (Gemini) yang cerdas dan mampu mendeteksi produk terlaris secara _real-time_ sekaligus menjadi konsultan ide jualan & perizinan (NIB).
* **Bebas Biaya Operasional (Manual Settlement):** Transaksi menggunakan transfer bank desa/QRIS manual serta COD terkoordinasi. Menghemat potongan biaya transaksi platform yang biasanya membebani laba tipis UMKM desa.
* **Cetak Struk Instan:** Fitur cetak struk kasir & label pengiriman langsung bagi seller untuk mempermudah operasional fisik.

### 2. Weaknesses (Kelemahan)
* **Ketergantungan Operasional Manual:** Verifikasi pembayaran (pembacaan bukti transfer) dan pencairan saldo masih diverifikasi secara manual oleh Bendahara.
* **Batas Geografis Logistik:** Sistem pengiriman belum terintegrasi kurir nasional dan sepenuhnya dikelola langsung secara mandiri oleh penjual.

### 3. Opportunities (Peluang)
* **Digitalisasi Ekonomi Desa:** Menjadi motor penggerak digitalisasi UMKM tradisional yang sebelumnya hanya bergantung pada pasar fisik mingguan.
* **Peningkatan Kredibilitas Transaksi:** Fitur rating desimal (skala float, misal: 4.8) dan ulasan jujur dari pembeli terverifikasi membangun rasa percaya antartetangga desa.
* **Manajemen Stok Varian Handal:** Mendukung varian produk (ukuran, warna, rasa) dengan pengurangan stok otomatis secara transaksional untuk mencegah _overselling_.

### 4. Threats (Ancaman)
* **Pembeli Bandel (Fake Transfer):** Risiko manipulasi bukti bayar transfer bank manual. *(Diminimalkan dengan sistem wajib unggah bukti transfer sebelum order divalidasi).*
* **API Quota Exhausted:** Risiko kehabisan kredit asisten AI Gemini. *(Ditangani dengan sistem rotasi multi API Key otomatis & fallback pengalihan ke WhatsApp admin).*

---

## 📚 Dokumentasi Proyek

* **[PRD.md](./PRD.md)** — Kebutuhan produk, batasan regional desa, dan alur pendaftaran peranan.
* **[SAR.md](./SAR.md)** — Spesifikasi teknis, database Prisma, proteksi RBAC, dan penanganan stok varian.
* **[DESIGN.md](./DESIGN.md)** & **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** — Palet warna Material 3, tipografi, dan standar layout.
* **[AGENTS.md](./AGENTS.md)** — Panduan konvensi dan logs pengerjaan proyek untuk AI Coding Agent.

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

4. **Migrasi Database & Seeding:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```

---

## 🔑 Akun Uji Coba (Development Seed)

| Peranan (Role) | Alamat Email | Password Default | Kode 2FA/TOTP |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@m2acobiz.com` | `admin123` | `J4TW K4DF NRSX G2LO` |
| **Ketua** | `ketua@m2acobiz.com` | `ketua123` | *Tanpa 2FA* |
| **Bendahara** | `bendahara@m2acobiz.com` | `bendahara123` | `K5UX L5EG OSTH M3NP` |
| **Seller (UMKM)** | `seller@m2acobiz.com` | `seller123` | *Tanpa 2FA* |
| **Buyer (Pembeli)** | `buyer@m2acobiz.com` | `buyer123` | *Tanpa 2FA* |
