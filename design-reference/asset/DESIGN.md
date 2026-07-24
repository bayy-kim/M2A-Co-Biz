---
name: M2A Co-Biz
colors:
  surface: '#f8faf9'
  surface-dim: '#d8dada'
  surface-bright: '#f8faf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f3'
  surface-container: '#eceeed'
  surface-container-high: '#e6e9e8'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#3f4948'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#eff1f0'
  outline: '#6f7978'
  outline-variant: '#bfc8c8'
  surface-tint: '#216868'
  primary: '#004343'
  on-primary: '#ffffff'
  primary-container: '#0f5c5c'
  on-primary-container: '#90d2d1'
  inverse-primary: '#90d2d1'
  secondary: '#4d6076'
  on-secondary: '#ffffff'
  secondary-container: '#d0e4ff'
  on-secondary-container: '#53667d'
  tertiary: '#5e2f16'
  on-tertiary: '#ffffff'
  tertiary-container: '#7a452a'
  on-tertiary-container: '#ffb693'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#aceeee'
  primary-fixed-dim: '#90d2d1'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#d0e4ff'
  secondary-fixed-dim: '#b5c8e2'
  on-secondary-fixed: '#071d30'
  on-secondary-fixed-variant: '#35485e'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb693'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#6c391f'
  background: '#f8faf9'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
  accent-gold: '#D9A441'
  background-neutral: '#F7F7F5'
  success: '#22C55E'
  warning: '#F59E0B'
  danger: '#EF4444'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  gutter: 16px
  margin: 24px
---

# DESIGN.md — M2A Co-Biz

Panduan desain ini berlaku untuk **semua** area platform — landing page publik maupun dashboard internal (Admin/Ketua/Sekretaris/Seller). Tidak ada area yang "kurang niat" desainnya.

## 1. Brand Tone

Profesional, hangat, terpercaya — kesan komunitas bisnis yang modern dan inklusif, bukan platform korporat yang dingin, dan bukan juga terlalu kasual. Al-Mubarok II sebagai organisasi induk hadir sebagai identitas kepercayaan, bukan ornamen religius yang mencolok di UI.

## 2. Palet Warna

| Token | Warna | Pemakaian |
|---|---|---|
| `--primary` | Deep teal (`#0F5C5C` area) | Tombol utama, header, aksen navigasi |
| `--secondary` | Navy gelap (`#12263A` area) | Teks heading, sidebar dashboard |
| `--accent` | Warm gold/amber (`#D9A441` area) | CTA penting, badge status, highlight |
| `--background` | Neutral off-white (`#F7F7F5`) / Dark mode: near-black netral | Latar utama |
| `--success` / `--warning` / `--danger` | Hijau / Amber / Merah standar | Status approval, payout, error |

Dark mode: pertahankan kontras yang sama, jangan sekadar invert warna.

## 3. Tipografi

- **Heading**: font sans-serif modern dengan sedikit karakter (mis. Sora / Manrope / Plus Jakarta Sans di bobot semi-bold–bold)
- **Body**: sans-serif netral dan sangat mudah dibaca (mis. Inter / Plus Jakarta Sans reguler)
- Skala ukuran konsisten (mis. 12/14/16/20/24/32/40px), jangan pakai ukuran acak per halaman

## 4. Layout & Spacing

- Mobile-first, breakpoint standar Tailwind (`sm`, `md`, `lg`, `xl`)
- Spacing pakai skala 4/8/12/16/24/32px — jangan angka acak
- Card dengan rounded corner (mis. `rounded-xl`) dan shadow lembut, bukan border tebal

## 5. Layout Dashboard (Admin/Ketua/Sekretaris/Seller)

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
- Hindari animasi yang mengganggu keterbacaan data finansial di dashboard sekretaris — di sana animasi harus minimal dan cepat

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
