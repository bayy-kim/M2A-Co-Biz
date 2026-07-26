# DESIGN_SYSTEM.md — M2A Co-Biz Global UI & Design System

Panduan ini merupakan **Ketentuan Global UI & Standard Operating Procedure (SOP) Visual** untuk platform M2A Co-Biz. Semua pengembang wajib mematuhi aturan visual dan teknis di bawah ini agar seluruh halaman (Publik, Katalog, Auth, dan 4 Dashboard Internal) konsisten, modern, dan memenuhi standar kualitas enterprise (WCAG 2.2 AA).

---

## 1. Brand Palette & Color Tokens (Material 3)

M2A Co-Biz menggunakan palet warna Material 3 dengan identitas utama **Deep Teal** (`#004343`), **Accent Gold** (`#D9A441`), dan **Dark Sidebar Gradient** (`#12263A` → `#004343`).

| Token Name | Hex Code | Utility Class (Tailwind v4) | Kegunaan |
|---|---|---|---|
| **Primary** | `#004343` | `bg-primary`, `text-primary` | Warna identitas utama, header, tombol utama, brand text |
| **Primary Container** | `#0F5C5C` | `bg-primary-container`, `text-on-primary-container` | Active sidebar nav pill, badge container |
| **Accent Gold** | `#D9A441` | `bg-accent-gold`, `text-accent-gold` | Tombol CTA transaksi, aksen highlight, badge emas |
| **Sidebar Gradient** | `#12263A` → `#004343` | `bg-gradient-to-b from-[#12263A] to-[#004343]` | Background sidebar desktop di 4 dashboard internal |
| **Background** | `#F8FAF9` | `bg-background` | Background dasar aplikasi |
| **Surface Lowest** | `#FFFFFF` | `bg-surface-container-lowest` | Background kartu utama, modal, dan tabel |
| **Surface Low** | `#F2F4F3` | `bg-surface-container-low` | Background input, hover state, secondary container |
| **Success** | `#22C55E` | `bg-emerald-500/10`, `text-emerald-700` | Status Lunas, disetujui, dan indikator sukses |
| **Warning / Pending** | `#F59E0B` | `bg-amber-500/10`, `text-amber-800` | Status menunggu persetujuan / verifikasi |
| **Danger / Error** | `#EF4444` / `#BA1A1A` | `bg-rose-500/10`, `text-rose-700` | Status ditolak, gagal, atau penangguhan |
| **Info / Transit** | `#0284C7` | `bg-sky-500/10`, `text-sky-700` | Status pengiriman, info proses |

---

## 2. Tipografi & Skala Teks

- **Font Utama (Heading & Display)**: `Plus Jakarta Sans` (CSS token: `--font-sans`)
- **Font Metadata & Label**: `Inter` (CSS token: `--font-inter`)

### Skala Ukuran:
- `text-display-lg`: `40px / 48px` (Font weight: 700) — Title Hero / Banner Utama
- `text-display-md`: `32px / 40px` (Font weight: 700) — Judul Halaman / Angka Metric Utama
- `text-headline-lg`: `24px / 32px` (Font weight: 600) — Judul Card Section / Modal Header
- `text-headline-md`: `20px / 28px` (Font weight: 600) — Judul Sub-section / Header Tabel
- `text-body-lg`: `16px / 24px` (Font weight: 400) — Paragraf Utama / Subtitle Hero
- `text-body-md`: `14px / 20px` (Font weight: 400) — Body Teks Standar / Deskripsi Produk
- `text-label-md`: `14px / 20px` (Font weight: 500) — Teks Tombol / Label Input / Navigasi
- `text-label-sm`: `12px / 16px` (Font weight: 500) — Caption / Badge Status / Metadata

*Aturan Truncation*: Semua judul produk di grid katalog atau kartu wajib diberi class `line-clamp-2` agar tinggi kartu konsisten dan tidak berantakan.

---

## 3. Ketentuan Kartu Double-Bezel (Double-Bezel Card Pattern)

Semua kartu data penting (Kartu Produk, Stat Cards Dashboard, Kartu Pesanan Buyer, Profil Penjual) **WAJIB** menerapkan pola **Double-Bezel**:

```tsx
<div className="p-[1px] rounded-[1.25rem] bg-gradient-to-b from-outline-variant/30 to-transparent">
  <div className="rounded-[calc(1.25rem-1px)] bg-surface-container-lowest p-lg border border-outline-variant/10 shadow-xs space-y-md">
    {/* Card Content */}
  </div>
</div>
```

### Micro-Interactions:
- Hover Lift: `hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`
- Tap Scale: `active:scale-[0.98]`
- Outer Border: Inner border tipis `border-outline-variant/10` untuk kontras yang sempurna di monitor retina.

---

## 4. Ketentuan Badge Status & Tagging Global

Semua elemen indikator status pembayaran, registrasi, maupun pengiriman harus memakai pill badge seragam:

```tsx
// Status Disetujui / Lunas
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
  <CheckCircle className="w-3.5 h-3.5" /> Lunas / Approved
</span>

// Status Menunggu / Pending
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
  <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan
</span>

// Status Ditolak / Gagal
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
  <XCircle className="w-3.5 h-3.5" /> Ditolak / Failed
</span>
```

---

## 5. Aksesibilitas & Responsive Mobile-First (WCAG 2.2 AA)

1. **Touch Target**: Semua tombol dan elemen klik di mobile wajib memiliki ukuran minimum **44x44px** atau padding minimal `py-2.5 px-4`.
2. **Aria Labels**: Semua tombol ikon tanpa teks wajib dilengkapi atribut `aria-label="<Penjelasan Aksi>"`.
3. **Pencapaian CLS (Cumulative Layout Shift)**:
   - Gambar produk / hero wajib memiliki atribut `width` dan `height` atau aspect ratio pembungkus (`aspect-square` / `aspect-[4/3]`).
   - Gambar di atas lipatan layar (*above-the-fold*): `loading="eager"`.
   - Gambar di bawah lipatan layar (*below-the-fold*): `loading="lazy"`.
4. **Mobile Bottom Padding**:
   - Semua halaman publik & dashboard yang menampilkan bottom bar mobile wajib menambahkan padding bawah `pb-24 lg:pb-0` pada elemen `<main>` agar konten terbawah tidak tertutup oleh navigasi bawah.

---

## 6. Layout Shell & Navigasi Internal

1. **Dashboard Sidebar**:
   - Background: `bg-gradient-to-b from-[#12263A] to-[#004343]`
   - Item Aktif: `bg-[#0f5c5c] text-[#90d2d1] font-bold shadow-md`
   - Header Sidebar: Logo Resmi M2A Co-Biz (`/images/logo.png`)
2. **Dashboard Topbar**:
   - Kiri: Breadcrumb / Judul Sub-halaman
   - Kanan: Search Input Pill (`rounded-full bg-surface-container-low`), Notification Bell dengan indikator unread, dan User Profile Badge (Avatar inisial emas + nama + role tag).

---

&copy; 2026 M2A Co-Biz. Dokumentasi Resmi Sistem Desain Global.
