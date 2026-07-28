# DESIGN.md — M2A Co-Biz

Panduan desain ini berlaku untuk **semua** area platform — landing page publik maupun dashboard internal (Admin/Ketua/Bendahara/Seller) di kawasan Desa Banjarwaringin.

## 1. Brand Tone
Profesional, hangat, terpercaya — kesan komunitas bisnis yang modern dan inklusif di lingkungan pedesaan. Al-Mubarok II sebagai organisasi induk hadir sebagai identitas kepercayaan masyarakat.

## 2. Palet Warna (Material 3)
| Token | Hex | Token | Hex |
|---|---|---|---|
| primary | #004343 | on-primary | #ffffff |
| primary-container | #0f5c5c | on-primary-container | #90d2d1 |
| secondary | #4d6076 | on-secondary | #ffffff |
| accent-gold | #D9A441 | success | #22C55E |
| background | #f8faf9 | surface | #f8faf9 |

## 3. Tipografi
- **Font utama**: Plus Jakarta Sans — dipakai di hampir semua elemen heading & body.
- **Font label kecil**: Inter — khusus untuk metadata, caption, dan badge kecil.

## 4. Layout & Spacing
- Mobile-first, breakpoint standar Tailwind (`sm`, `md`, `lg`).
- Spacing menggunakan skala 4/8/12/16/24/32px.
- Card dengan rounded corner (`rounded-xl` / `rounded-2xl`) dan shadow lembut.

## 5. Fitur Cetak Struk & Label
- Seller Dashboard menyediakan fitur cetak struk berukuran minimalis hitam-putih ramah printer termal/PDF melalui rute khusus `/seller/print/[orderId]`.
