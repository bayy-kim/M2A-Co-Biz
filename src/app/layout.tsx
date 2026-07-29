import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "M2A Co-Biz | Pusat Bisnis & UMKM Al-Mubarok II",
    template: "%s | M2A Co-Biz",
  },
  description:
    "Platform marketplace dan manajemen bisnis untuk UMKM dan penyedia jasa di bawah naungan Al-Mubarok II.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  other: {
    "theme-color": "#004343",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "M2A Co-Biz",
  },
  openGraph: {
    title: "M2A Co-Biz | Pusat Bisnis & UMKM Al-Mubarok II",
    description:
      "Platform marketplace dan manajemen bisnis untuk UMKM dan penyedia jasa di bawah naungan Al-Mubarok II.",
    type: "website",
    locale: "id_ID",
    siteName: "M2A Co-Biz",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`h-full antialiased scroll-smooth scroll-pt-20 ${plusJakartaSans.variable} ${inter.variable}`}>
      <head />
      <body className="min-h-full flex flex-col" style={{fontFamily:"var(--font-plus-jakarta-sans)"}}><Providers>{children}</Providers></body>
    </html>
  )
}
