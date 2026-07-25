# PRD — M2A Co-Biz

**Pemilik produk:** Al-Mubarok II
**Versi dokumen:** 1.0
**Status:** Disetujui untuk mulai development

---

## 1. Ringkasan

M2A Co-Biz adalah platform marketplace sekaligus sistem manajemen internal untuk mewadahi UMKM (penjual barang) dan penyedia jasa di bawah naungan Al-Mubarok II. Platform ini punya dua sisi:

- **Sisi publik**: katalog produk & jasa, checkout online, informasi lokasi/kontak.
- **Sisi internal**: empat peran (Admin, Ketua, Bendahara, Penjual) yang mengelola perizinan, keuangan, dan operasional harian.

Tujuan utama: memberi UMKM/penjual jasa kanal jualan resmi yang rapi, sekaligus memberi organisasi kontrol penuh atas siapa yang boleh berjualan, berapa potongan yang berlaku, dan transparansi keuangan lewat analitik.

## 2. Peran & Pengguna

| Peran | Deskripsi singkat |
|---|---|
| **Buyer** (publik) | Browsing katalog, checkout (wajib login — buyer account registrasi instan), lihat riwayat pesanan di /pesanan-saya |
| **Seller** (UMKM/Jasa) | Daftar → menunggu approval → kelola produk/jasa sendiri, lihat penjualan & payout |
| **Admin** | Approve/reject/suspend seller, kelola kategori, kelola user, moderasi konten |
| **Bendahara** | Atur persentase komisi (global/kategori/per-seller), lihat analitik pemasukan-pengeluaran, kelola batch payout |
| **Ketua** | Overview seluruh aktivitas platform, read-only, laporan ringkas untuk pengambilan keputusan |

## 3. Fitur per Peran

### 3.1 Publik (Buyer)
- Landing page: hero, produk/jasa unggulan, tentang Al-Mubarok II, lokasi/peta kantor
- Katalog produk & jasa dengan filter kategori (kategori bersifat opsional — produk tanpa kategori tetap muncul di "Semua")
- Halaman detail produk/jasa: galeri foto (multi-foto), deskripsi, harga, info penjual
- Checkout: isi data pembeli → pembayaran QRIS/transfer bank → konfirmasi manual oleh Bendahara

### 3.2 Seller (UMKM & Jasa)
- Registrasi: data diri, data usaha, upload dokumen (KTP, **Kartu Keluarga**, izin usaha/NIB — opsional kalau belum ada)
- Menunggu status: PENDING → APPROVED/REJECTED (notifikasi status)
- Kelola produk/jasa: tambah/edit/hapus, upload beberapa foto, kategori opsional
- Riwayat penjualan & rincian komisi per transaksi
- Riwayat & status payout (pending/diproses/cair)

### 3.3 Admin
- Antrian approval seller baru (review dokumen, approve/reject/minta revisi)
- Kelola kategori produk/jasa
- Kelola user (suspend/reaktivasi)
- Kelola CompanyProfile (nama, alamat, koordinat peta yang tampil di landing page)
- Melihat log aktivitas seluruh sistem

### 3.4 Bendahara
- Atur aturan komisi: default global, override per kategori, override per seller (prioritas: seller > kategori > global)
- Dashboard analitik: pemasukan vs pengeluaran perusahaan, total komisi terkumpul, breakdown per kategori/seller
- Kelola batch payout: lihat daftar payout pending, trigger disbursement (otomatis terjadwal atau manual)
- Export laporan keuangan (opsional, fase lanjutan)

### 3.5 Ketua
- Overview: total seller aktif, total transaksi, total omzet, pending approval
- Feed aktivitas real-time (siapa approve seller, siapa ubah komisi, dst — read-only)
- Grafik tren penjualan & pertumbuhan seller

## 4. Alur Utama

### 4.1 Alur Perizinan Seller
1. Calon seller isi form registrasi + upload KTP, KK, (opsional) izin usaha
2. Status otomatis: PENDING
3. Admin membuka antrian, review dokumen (akses dokumen dicatat di log)
4. Admin approve → seller dapat notifikasi, akun aktif
   Admin reject → seller dapat notifikasi + alasan, bisa daftar ulang
5. Admin bisa suspend seller kapan saja kalau ada pelanggaran

### 4.2 Alur Transaksi
1. Buyer checkout → sistem buat Order + OrderItem + LedgerEntry (komisi)
2. Buyer scan QRIS atau transfer ke rekening perusahaan
3. Bendahara konfirmasi pembayaran manual dari dashboard → update Order status ke PAID
4. Sistem hitung komisi per item (berdasarkan aturan aktif) → catat sebagai OrderItem + LedgerEntry
5. Seller lihat saldo tersedia di dashboard, bisa ajukan payout
6. Bendahara proses payout dari dashboard → update status ke PAID + LedgerEntry OUT + ActivityLog

### 4.3 Aturan Komisi
- Prioritas: **komisi khusus seller** > **komisi kategori** > **komisi default global**
- Kalau produk tidak punya kategori (kategori opsional), langsung cek komisi khusus seller, kalau tidak ada langsung fallback ke default global

## 5. Kebutuhan Non-Fungsional

- **Keamanan**: level tertinggi — lihat detail di SAR.md (dokumen KK & KTP adalah data pribadi sensitif)
- **Responsif**: wajib enak dipakai di HP maupun desktop, mobile-first
- **Profesional & modern**: berlaku untuk seluruh area, termasuk dashboard internal (bukan cuma landing page)
- **Ikon konsisten**: seluruh UI pakai icon set (lucide-react), tidak ada emoji di mana pun
- **Fungsional penuh**: tidak ada fitur setengah jadi — setiap fitur yang diklaim selesai harus benar-benar bisa dipakai end-to-end

## 6. Fase Pengerjaan

1. **Fase 1 — Fondasi**: setup project, schema database, auth & RBAC
2. **Fase 2 — Marketplace Inti**: landing page, katalog, seller onboarding + approval
3. **Fase 3 — Transaksi & Komisi**: checkout, commission engine, payout (manual via Bendahara)
4. **Fase 4 — Dashboard & Analitik**: dashboard Ketua, Bendahara, Seller lengkap dengan grafik
5. **Fase 5 — Keamanan & Polish**: audit keamanan, animasi, cek mobile/desktop, dokumen final
6. **Fase 6 — Deploy**: deployment ke Vercel, smoke test production

## 7. Kriteria Sukses

- Seller bisa daftar, upload dokumen, dan diapprove admin tanpa error
- Buyer bisa checkout dan pembayaran dikonfirmasi manual oleh Bendahara
- Komisi terhitung otomatis dan benar sesuai prioritas aturan (termasuk kasus kategori kosong)
- Payout ke seller bisa diproses dan tercatat statusnya
- Ketiga dashboard (Ketua/Bendahara/Seller) menampilkan data akurat dan real-time
- Tidak ada data KTP/KK yang bocor atau tampil mentah di UI selain saat admin review
- Tampil rapi dan profesional di layar HP maupun desktop
