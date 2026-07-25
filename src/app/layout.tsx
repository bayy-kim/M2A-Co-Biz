import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "M2A Co-Biz | Pusat Bisnis & UMKM Al-Mubarok II",
    template: "%s | M2A Co-Biz",
  },
  description:
    "Platform marketplace dan manajemen bisnis untuk UMKM dan penyedia jasa di bawah naungan Al-Mubarok II.",
  icons: { icon: "/favicon.svg" },
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
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
