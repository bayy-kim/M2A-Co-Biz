export interface FaqItem {
  q: string
  a: string
}

export interface FaqCategory {
  title: string
  icon?: string
  items: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    title: "Umum",
    items: [
      {
        q: "Apa itu M2A Co-Biz?",
        a: "M2A Co-Biz adalah platform marketplace sekaligus sistem manajemen internal untuk UMKM dan penyedia jasa di bawah naungan Al-Mubarok II, khusus kawasan Desa Banjarwaringin, Salopa. Platform ini menghubungkan pembeli dengan produk & jasa lokal, sekaligus membantu pelaku usaha mengelola produk, stok, pesanan, dan penjualan secara digital.",
      },
      {
        q: "Siapa saja yang boleh bergabung?",
        a: "Semua orang boleh bergabung sebagai Pembeli. Untuk menjadi Penjual (UMKM/Jasa), Anda harus memiliki usaha yang berlokasi atau beroperasi di sekitar Banjarwaringin/Salopa, dan mendaftar dengan melampirkan dokumen identitas untuk verifikasi.",
      },
      {
        q: "Apakah bergabung dengan M2A Co-Biz gratis?",
        a: "Ya, 100% gratis. Membuat akun pembeli maupun mendaftar sebagai penjual tidak dipungut biaya apa pun. Platform hanya mengambil komisi dari hasil penjualan sesuai aturan komisi yang transparan.",
      },
      {
        q: "Apa perbedaan akun Pembeli dan Penjual?",
        a: "Akun Pembeli digunakan untuk berbelanja, memantau pesanan, memberi ulasan, dan berkonsultasi lewat Asisten AI. Akun Penjual memiliki akses dashboard untuk mengelola produk, varian & stok, memantau penjualan, dan mengajukan pencairan saldo. Satu akun bisa berperan sebagai keduanya.",
      },
      {
        q: "Berapa lama proses verifikasi penjual?",
        a: "Setelah Anda mengajukan permohonan beserta dokumen (KTP & Kartu Keluarga), Admin/Ketua/Bendahara akan meninjau. Umumnya 1–3 hari kerja. Status permohonan bisa dipantau di dashboard Anda.",
      },
    ],
  },
  {
    title: "Belanja & Pesanan",
    items: [
      {
        q: "Bagaimana cara memesan produk atau jasa?",
        a: "Pilih produk di Katalog, klik produk untuk melihat detail dan varian (jika ada), lalu klik tombol checkout. Isi nama, nomor telepon, metode pengiriman, dan metode pembayaran, lalu konfirmasi. Pesanan langsung tercatat dan diteruskan ke penjual.",
      },
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Saat ini tersedia: (1) Transfer Bank atau QRIS — setelah membuat pesanan Anda akan melihat instruksi pembayaran, dan wajib mengunggah bukti transfer; (2) COD (Bayar di Tempat) — pembayaran tunai saat barang sampai atau jasa dikerjakan.",
      },
      {
        q: "Kenapa saya wajib mengunggah bukti transfer?",
        a: "Bukti transfer berfungsi sebagai pencegahan pembayaran palsu. Bendahara akan memverifikasi bukti tersebut secara manual sebelum pesanan diubah menjadi LUNAS. Tanpa bukti yang valid, pesanan tidak akan dikonfirmasi.",
      },
      {
        q: "Bagaimana cara mengunggah bukti pembayaran?",
        a: "Buka halaman Pesanan Anda, cari pesanan berstatus Menunggu Pembayaran, lalu klik tombol Upload Bukti. Unggah gambar JPG/PNG hasil tangkapan layar atau foto struk transfer (maksimal 5MB).",
      },
      {
        q: "Bagaimana cara memantau status pesanan?",
        a: "Buka Dashboard Saya lalu menu Pesanan. Setiap pesanan menampilkan status pembayaran (Menunggu Pembayaran/Lunas/Gagal) dan status pengerjaan (Dikonfirmasi → Diproses → Dikirim → Selesai). Tab Aktif menampilkan pesanan berjalan, tab Riwayat menampilkan pesanan selesai/dibatalkan.",
      },
      {
        q: "Bagaimana jika saya ingin membatalkan pesanan?",
        a: "Pesanan yang masih berstatus Menunggu Pembayaran bisa dibatalkan sendiri dari halaman Pesanan. Saat dibatalkan, stok otomatis dikembalikan ke penjual. Pesanan yang sudah LUNAS atau sedang dikerjakan tidak dapat dibatalkan lewat sistem — silakan hubungi penjual/Admin.",
      },
      {
        q: "Berapa lama pesanan dikerjakan?",
        a: "Waktu pengerjaan tergantung jenis produk/jasa dan kesepakatan dengan penjual. Pantau update status pengerjaan di halaman Pesanan Anda. Jika ragu, hubungi penjual lewat kontak yang tersedia di detail produk.",
      },
      {
        q: "Bagaimana cara memberi ulasan dan rating?",
        a: "Setelah pesanan berstatus Selesai, Anda bisa menekan tombol Beri Ulasan di halaman Pesanan. Anda dapat memberi bintang (termasuk pecahan seperti 4.5) dan komentar. Satu ulasan hanya bisa dibuat untuk produk yang benar-benar sudah dibeli dan selesai.",
      },
      {
        q: "Bagaimana metode pengiriman & pengambilan?",
        a: "Saat checkout Anda bisa memilih: (1) Ambil di tempat (gratis); atau (2) Diantar ke lokasi Banjarwaringin (dikenakan ongkir sesuai kebijakan penjual). Pastikan alamat/catatan lokasi diisi dengan benar, terutama untuk layanan jasa.",
      },
    ],
  },
  {
    title: "Menjual & Komisi",
    items: [
      {
        q: "Bagaimana cara mendaftar sebagai penjual?",
        a: "Dari Dashboard Saya, klik kartu Ingin Jualan?, isi nama usaha, jenis usaha (UMKM/Jasa), dan unggah dokumen KTP + Kartu Keluarga, lalu kirim. Permohonan akan ditinjau Admin/Ketua/Bendahara.",
      },
      {
        q: "Dokumen apa saja yang wajib diunggah?",
        a: "Minimal KTP dan Kartu Keluarga. Dokumen izin usaha (NIB, SIUP, dll) sangat disarankan untuk mempercepat persetujuan. Semua dokumen dienkripsi dan disimpan secara privat — hanya Admin yang bisa meninjaunya.",
      },
      {
        q: "Apa arti status penjual PENDING / APPROVED / REJECTED?",
        a: "PENDING: permohonan Anda sedang ditinjau. APPROVED: akun penjual aktif dan bisa mengelola produk. REJECTED: permohonan ditolak — cek alasan dan perbaiki data/dokumen, lalu ajukan ulang. SUSPENDED berarti akun dinonaktifkan karena melanggar ketentuan.",
      },
      {
        q: "Bagaimana cara mengubah data usaha atau rekening bank?",
        a: "Buka menu Pengaturan Profil dari dashboard Anda. Di sana Anda bisa mengubah nama, nomor telepon, nama usaha, jenis usaha, dan data rekening bank yang dipakai untuk pencairan.",
      },
      {
        q: "Apa itu komisi dan bagaimana cara kerjanya?",
        a: "Komisi adalah potongan yang diambil platform dari setiap penjualan. Besarannya mengikuti aturan berjenjang: Komisi khusus Seller > Komisi Kategori > Komisi Global. Komisi yang berlaku adalah yang paling spesifik untuk produk Anda.",
      },
      {
        q: "Berapa persentase komisi default?",
        a: "Persentase komisi diatur oleh Bendahara dan bisa berubah. Pastikan mengecek aturan komisi terkini di dashboard. Seluruh nominal transaksi selalu dihitung dalam Rupiah penuh (tanpa desimal) agar akurat.",
      },
      {
        q: "Bagaimana cara menambahkan produk dengan varian dan stok?",
        a: "Di dashboard Penjual, buka menu Produk lalu Tambah Produk. Isi judul, deskripsi, harga, dan kategori. Anda juga bisa menambahkan varian (misal ukuran/warna/rasa) beserta stok awal masing-masing. Stok otomatis berkurang saat ada pembelian.",
      },
      {
        q: "Bagaimana cara mengusulkan kategori baru?",
        a: "Saat menambah produk, jika kategori yang Anda butuhkan belum tersedia, klik Usul Kategori Baru dan isi nama kategorinya. Admin akan menyetujui atau menolak usulan tersebut.",
      },
      {
        q: "Bagaimana cara melihat penjualan dan pendapatan saya?",
        a: "Dashboard Penjual menampilkan total penjualan, total komisi, pendapatan bersih, riwayat penjualan, dan saldo yang bisa dicairkan. Anda juga bisa mencetak struk kasir untuk setiap pesanan.",
      },
      {
        q: "Bagaimana cara mengajukan pencairan saldo (payout)?",
        a: "Pastikan data rekening bank sudah diisi di Pengaturan Profil. Lalu buka menu Pencairan di dashboard Penjual, isi jumlah yang ingin dicairkan (tidak boleh melebihi saldo), dan kirim. Bendahara akan memprosesnya secara manual.",
      },
      {
        q: "Berapa lama pencairan diproses?",
        a: "Setelah pengajuan diterima, Bendahara memproses pencairan secara manual. Umumnya 1–3 hari kerja. Status pencairan bisa dipantau di dashboard Penjual (Pending → Diproses → Dibayar).",
      },
    ],
  },
  {
    title: "Akun & Keamanan",
    items: [
      {
        q: "Bagaimana cara masuk ke akun saya?",
        a: "Klik tombol Masuk di pojok kanan atas, lalu masukkan email dan kata sandi. Anda juga bisa masuk menggunakan akun Google dengan menekan tombol Lanjutkan dengan Google.",
      },
      {
        q: "Saya mendaftar dengan Google tapi diarahkan melengkapi profil, kenapa?",
        a: "Saat daftar pertama kali dengan Google, akun dibuat otomatis dan Anda diminta melengkapi data (nama & nomor telepon) lewat halaman Lengkapi Profil. Ini sekali saja; setelah itu Anda langsung masuk ke dashboard.",
      },
      {
        q: "Apa itu 2FA / verifikasi dua langkah?",
        a: "2FA (Two-Factor Authentication) menambah lapisan keamanan: setelah kata sandi, Anda wajib memasukkan kode 6 digit dari aplikasi Authenticator (Google Authenticator, Aegis, dll). Kode berubah setiap 30 detik.",
      },
      {
        q: "Siapa yang wajib mengaktifkan 2FA?",
        a: "Peran Admin dan Bendahara wajib mengaktifkan 2FA karena memegang kendali persetujuan dan keuangan. Saat pertama login, mereka akan diarahkan menyiapkan 2FA sebelum mengakses dashboard. Disarankan juga bagi penjual & pembeli.",
      },
      {
        q: "Bagaimana cara mengubah nama atau nomor telepon saya?",
        a: "Buka menu Pengaturan Profil dari dashboard Anda (untuk Pembeli) atau dari sidebar dashboard (untuk Penjual/Admin/Bendahara/Ketua). Ubah data lalu klik Simpan.",
      },
      {
        q: "Akun saya dinonaktifkan, kenapa dan bagaimana cara mengaktifkannya?",
        a: "Akun bisa dinonaktifkan oleh Admin karena pelanggaran ketentuan atau alasan keamanan. Untuk klarifikasi, silakan hubungi Admin via WhatsApp/email. Setelah dinonaktifkan, Anda tidak bisa login sampai diaktifkan kembali.",
      },
      {
        q: "Apakah data pribadi dan dokumen saya aman?",
        a: "Ya. Dokumen KTP/KK dienkripsi (AES-256-GCM) sebelum disimpan di penyimpanan privat, hanya bisa diakses Admin dengan URL berumur pendek, dan setiap akses dicatat di log aktivitas. Kata sandi di-hash, dan transaksi uang dihitung dalam Rupiah penuh.",
      },
    ],
  },
  {
    title: "Asisten AI",
    items: [
      {
        q: "Apa itu Asisten AI M2A Co-Biz?",
        a: "Asisten AI adalah konsultan bisnis virtual berbasis Gemini yang membantu Anda: menemukan produk terlaris, konsultasi ide & strategi UMKM, memahami cara kerja platform, dan menjawab pertanyaan seputar layanan.",
      },
      {
        q: "Apa saja yang bisa ditanyakan ke Asisten AI?",
        a: "Contoh: 'Produk apa yang paling laris?', 'Saya ingin jualan makanan, mulai dari mana?', 'Bagaimana cara daftar jadi penjual?', atau tips pemasaran untuk usaha kecil di Banjarwaringin.",
      },
      {
        q: "Kenapa Asisten AI tidak menjawab / muncul keterangan kuota penuh?",
        a: "Asisten AI menggunakan kredit API yang terbatas. Jika kuota sedang penuh, Anda akan diarahkan untuk melanjutkan konsultasi langsung lewat WhatsApp atau email Admin — tim kami siap membantu.",
      },
    ],
  },
  {
    title: "Bantuan & Kontak",
    items: [
      {
        q: "Bagaimana cara menghubungi Admin M2A Co-Biz?",
        a: "Anda bisa menghubungi via WhatsApp (nomor tertera di footer / halaman kontak) atau email. Untuk kendala pesanan/pembayaran, sertakan nomor pesanan Anda agar cepat ditindaklanjuti.",
      },
      {
        q: "Di mana lokasi M2A Co-Biz?",
        a: "M2A Co-Biz berada di bawah naungan Al-Mubarok II, Desa Banjarwaringin, Kecamatan Salopa, Kabupaten Tasikmalaya, Jawa Barat. Lihat peta di bagian Tentang Kami.",
      },
      {
        q: "Apakah ada biaya tersembunyi?",
        a: "Tidak. Tidak ada biaya pendaftaran, biaya bulanan, maupun biaya tersembunyi. Satu-satunya potongan adalah komisi penjualan yang besaran dan aturannya transparan dan bisa dilihat di dashboard Bendahara.",
      },
    ],
  },
]
