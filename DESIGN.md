# DESIGN.md — M2A Co-Biz

Panduan desain ini berlaku untuk **semua** area platform — landing page publik maupun dashboard internal (Admin/Ketua/Bendahara/Seller). Tidak ada area yang "kurang niat" desainnya.

## 1. Brand Tone

Profesional, hangat, terpercaya — kesan komunitas bisnis yang modern dan inklusif, bukan platform korporat yang dingin, dan bukan juga terlalu kasual. Al-Mubarok II sebagai organisasi induk hadir sebagai identitas kepercayaan, bukan ornamen religius yang mencolok di UI.

## 2. Palet Warna (Final — hasil export dari Stitch)

Ini token warna PERSIS yang dipakai desain Stitch yang sudah disetujui. Config Tailwind di project Next.js wajib pakai nilai-nilai ini persis (bukan hex kira-kira), supaya hasil build sama persis dengan desain.

| Token | Hex | Token | Hex |
|---|---|---|---|
| primary | #004343 | on-primary | #ffffff |
| primary-container | #0f5c5c | on-primary-container | #90d2d1 |
| primary-fixed | #aceeee | on-primary-fixed | #002020 |
| primary-fixed-dim | #90d2d1 | on-primary-fixed-variant | #004f50 |
| secondary | #4d6076 | on-secondary | #ffffff |
| secondary-container | #d0e4ff | on-secondary-container | #53667d |
| secondary-fixed | #d0e4ff | on-secondary-fixed | #071d30 |
| secondary-fixed-dim | #b5c8e2 | on-secondary-fixed-variant | #35485e |
| tertiary | #5e2f16 | on-tertiary | #ffffff |
| tertiary-container | #7a452a | on-tertiary-container | #ffb693 |
| tertiary-fixed | #ffdbcc | on-tertiary-fixed | #351000 |
| tertiary-fixed-dim | #ffb693 | on-tertiary-fixed-variant | #6c391f |
| accent-gold | #D9A441 | success | #22C55E |
| warning | #F59E0B | danger | #EF4444 |
| error | #ba1a1a | on-error | #ffffff |
| error-container | #ffdad6 | on-error-container | #93000a |
| background | #f8faf9 | background-neutral | #F7F7F5 |
| on-background | #191c1c | surface | #f8faf9 |
| surface-bright | #f8faf9 | surface-dim | #d8dada |
| surface-container-lowest | #ffffff | surface-container-low | #f2f4f3 |
| surface-container | #eceeed | surface-container-high | #e6e9e8 |
| surface-container-highest | #e1e3e2 | surface-variant | #e1e3e2 |
| on-surface | #191c1c | on-surface-variant | #3f4948 |
| outline | #6f7978 | outline-variant | #bfc8c8 |
| inverse-surface | #2e3131 | inverse-on-surface | #eff1f0 |
| inverse-primary | #90d2d1 | surface-tint | #216868 |

Ini pakai sistem token Material 3 (bukan cuma primary/secondary/accent sederhana) — lebih detail dan lebih mudah dijaga konsistensinya untuk dark mode nanti.

## 3. Tipografi

- **Font utama (heading & body)**: Plus Jakarta Sans — dipakai di hampir semua elemen lewat token `display-lg/md`, `headline-lg/md`, `body-lg/md`
- **Font label kecil**: Inter — khusus untuk `label-sm`/`label-md` (teks meta, caption, badge kecil)
- Skala ukuran mengikuti token Stitch: display-lg 40px/700, display-md 32px/700, headline-lg 24px/600, headline-md 20px/600, body-lg 16px/400, body-md 14px/400, label-md 14px/500, label-sm 12px/500

**Ikonografi (update penting):** Hasil export Stitch mencampur dua sistem ikon — `Material Symbols Outlined` (dominan) dan `lucide` (di sebagian layar). Saat dibangun ulang di Next.js, **satukan semuanya ke `lucide-react`** sesuai aturan bagian 7 — jangan pertahankan campuran Material Symbols di kode final.

## 4. Layout & Spacing

- Mobile-first, breakpoint standar Tailwind (`sm`, `md`, `lg`, `xl`)
- Spacing pakai skala 4/8/12/16/24/32px — jangan angka acak
- Card dengan rounded corner (mis. `rounded-xl`) dan shadow lembut, bukan border tebal

## 5. Layout Dashboard (Admin/Ketua/Bendahara/Seller)

- Pola konsisten di keempat role: **sidebar navigasi** (collapsible jadi bottom nav/drawer di mobile) + **topbar** (nama user, badge role, notifikasi)
- Konten utama pakai kombinasi card ringkasan (angka besar + label) dan tabel data dengan sorting
- Warna aksen sidebar boleh sedikit berbeda per role sebagai penanda visual (mis. badge warna berbeda), tapi struktur layout harus identik

## 6. Komponen (shadcn/ui)

Pakai komponen shadcn sebagai basis: `button`, `card`, `table`, `dialog`, `tabs`, `badge`, `dropdown-menu`, `sheet` (untuk drawer mobile), `form` (dengan react-hook-form + zod resolver). Kustomisasi warna lewat token di atas, jangan pakai warna default shadcn mentah-mentah.

## 7. Ikonografi

**Wajib pakai `lucide-react` di seluruh UI. Tidak ada emoji dalam bentuk apa pun** — termasuk di teks status, notifikasi, atau microcopy.

Contoh pemetaan:
- Lokasi/alamat → `MapPin`
- Approval seller → `CheckCircle2` / `XCircle`
- Dokumen → `FileText`
- Uang/komisi → `Wallet` / `Banknote`
- Analitik → `BarChart3` / `TrendingUp`

## 8. Animasi (Framer Motion)

- Scroll-reveal di landing page: fade + slide-up ringan (durasi 300–500ms, easing `easeOut`)
- Transisi antar halaman dashboard: fade singkat (150–200ms), jangan berlebihan
- Micro-interaction tombol: scale kecil saat tap/hover (mis. `whileTap={{ scale: 0.97 }}`)
- Hindari animasi yang mengganggu keterbacaan data finansial di dashboard bendahara — di sana animasi harus minimal dan cepat

## 9. Komponen Lokasi/Peta

Section "Lokasi" di landing page: alamat kantor Al-Mubarok II ditampilkan sebagai teks (dengan icon `MapPin`) berdampingan dengan embed Google Maps.

**Data lokasi (sudah final, dari Google Maps):**

- Nama tempat: MDT Al-Mubarok
- Alamat: Banjarwaringin, Salopa, Kabupaten Tasikmalaya, Jawa Barat 46192
- Koordinat: -7.5064759, 108.2390261

Seed value untuk `CompanyProfile`:
```
name: "M2A Co-Biz"
address: "Banjarwaringin, Salopa, Kabupaten Tasikmalaya, Jawa Barat 46192"
latitude: -7.5064759
longitude: 108.2390261
mapEmbedUrl: "https://www.google.com/maps?q=-7.5064759,108.2390261&output=embed"
```

`mapEmbedUrl` di atas sudah bisa langsung dipasang di `<iframe src="...">` tanpa perlu API key Google Maps sama sekali.

## 10. Aksesibilitas

- Kontras teks minimal WCAG AA
- Tap target minimal 44x44px di mobile
- Semua elemen interaktif punya focus state yang terlihat jelas (jangan `outline-none` tanpa pengganti)
- Form wajib punya label yang terasosiasi dengan input (bukan cuma placeholder)
