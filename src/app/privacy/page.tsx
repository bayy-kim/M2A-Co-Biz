import { ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-gutter">
      <div className="max-w-2xl text-center space-y-lg">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-display-md text-primary font-bold">Kebijakan Privasi</h1>
        <p className="text-body-md text-on-surface-variant">
          Halaman ini akan berisi Kebijakan Privasi (Privacy Policy) M2A Co-Biz sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP). Dokumen sedang dalam penyusunan dan akan segera tersedia.
        </p>
        <Link href="/register" className="inline-block px-xl py-3 bg-primary text-on-primary rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity">
          Kembali ke Pendaftaran
        </Link>
      </div>
    </div>
  )
}
