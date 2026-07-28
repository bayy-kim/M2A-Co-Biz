# PRD — M2A Co-Biz

**Pemilik produk:** Al-Mubarok II
**Versi dokumen:** 2.1
**Status:** Disetujui (V2.1 — Final)

---

## 1. Ringkasan

M2A Co-Biz adalah platform marketplace sekaligus sistem manajemen internal untuk wadah UMKM (penjual barang) dan penyedia jasa di bawah naungan Al-Mubarok II di kawasan Desa Banjarwaringin, Salopa. Platform ini memiliki dua sisi:

- **Sisi publik**: katalog produk & jasa dengan fuzzy search (typo-tolerant), checkout online, Asisten AI Gemini untuk rekomendasi barang terlaris dan konsultasi bisnis UMKM.
- **Sisi internal**: empat peran (Admin, Ketua, Bendahara, Penjual) yang mengelola perizinan, stok varian produk, verifikasi bukti pembayaran, cetak struk kasir, dan analitik laporan pemasukan.

---

## 2. Peran & Pengguna

| Peran | Deskripsi singkat |
|---|---|
| **Buyer** (publik) | Browsing katalog, checkout dengan pilihan varian barang, upload bukti transfer, menulis rating ulasan desimal (skala float). |
| **Seller** (UMKM/Jasa) | Mengelola produk, set stok per varian produk, meminta pencairan saldo, dan mencetak struk kasir fisik/label kirim. |
| **Admin** | Meninjau berkas pendaftaran terenkripsi, verifikasi user, moderasi ulasan, dan kelola kategori produk. |
| **Bendahara** | Menyetujui pencairan saldo, verifikasi keabsahan bukti transfer dari pembeli, dan mengelola aturan komisi (Seller > Kategori > Global). |
| **Ketua** | Dashboard read-only yang memantau feed aktivitas dan statistik performa keuangan perusahaan secara keseluruhan. |

---

## 3. Fitur Utama & Keamanan

### 3.1 Pencegahan Pembeli Bandel (Upload Struk)
- Pembayaran via Transfer/QRIS mengharuskan pembeli mengunggah berkas bukti transaksi.
- Bukti transfer disimpan di Vercel Blob dan diverifikasi manual oleh Bendahara melalui signed URL sebelum order diubah menjadi `PAID`.
- Bendahara wajib memverifikasi bukti transfer sebelum mengkonfirmasi pembayaran.

### 3.2 Manajemen Stok Varian Produk
- Seller dapat membuat varian produk (ukuran, warna, rasa) dengan kapasitas stok masing-masing (`ProductVariant`).
- Pengurangan stok dilakukan dalam scope database transaction untuk menghindari *overselling*.
- Seller dapat mengatur stok awal saat membuat produk.
- Produk akan menampilkan label stok menipis/habis di halaman detail.

### 3.3 Sistem Rating Desimal & Ulasan
- Pembeli terverifikasi dapat memberikan ulasan bintang pecahan (skala float, misal: 4.5) untuk produk/jasa yang telah selesai dikerjakan (`COMPLETED`).
- Tipe data `Decimal(2,1)` pada kolom rating di database.
- Rating rata-rata ditampilkan di halaman katalog dan detail produk.

### 3.4 Cetak Struk Penjual
- Rute khusus `/seller/print/[orderId]` berformat monokrom minimalis yang ramah printer termal fisik bagi Seller.
- Tombol cetak tersedia di tabel Riwayat Penjualan Seller Dashboard.
- Halaman cetak tanpa header/sidebar agar layout rapi saat di-print.

### 3.5 Pencarian Typo-Tolerant (Fuzzy Search)
- Menggunakan ekstensi PostgreSQL `pg_trgm` (trigram similarity) untuk pencarian yang toleran terhadap kesalahan ejaan.
- Jika pencarian tepat tidak ditemukan, sistem akan menampilkan hasil kemiripan ejaan dengan banner informasi.

### 3.6 AI Business Consultant (Gemini)
- Asisten AI Gemini dengan multi-API keys pool untuk rotasi otomatis saat kuota habis.
- Tool Calling untuk mendeteksi barang terlaris dari database secara real-time.
- Fallback ke WhatsApp admin jika semua kredit API habis.
- Persona sebagai Konsultan Bisnis & UMKM desa Banjarwaringin.
