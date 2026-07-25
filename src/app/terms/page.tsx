import { FileText, Mail } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-gutter py-xxl">
        <div className="flex items-center gap-3 mb-xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-display-md text-primary font-bold">Ketentuan Layanan</h1>

        <div className="space-y-lg text-body-md text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">1. Penerimaan Ketentuan</h2>
            <p>Dengan mendaftar dan menggunakan platform M2A Co-Biz ("Platform"), Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan layanan ini. Jika Anda tidak setuju dengan ketentuan ini, jangan gunakan Platform.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">2. Definisi</h2>
            <ul className="list-disc pl-xl space-y-sm">
              <li><strong>Platform</strong>: M2A Co-Biz, marketplace dan sistem manajemen internal untuk UMKM dan penyedia jasa di bawah Al-Mubarok II.</li>
              <li><strong>Pengguna</strong>: Setiap individu yang terdaftar dan menggunakan Platform, termasuk Pembeli, Penjual, Admin, Sekretaris, dan Ketua.</li>
              <li><strong>Penjual</strong>: UMKM atau penyedia jasa yang terdaftar dan telah disetujui untuk menjual produk/jasa melalui Platform.</li>
              <li><strong>Pembeli</strong>: Pengguna yang membeli produk/jasa melalui Platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">3. Pendaftaran & Akun</h2>
            <p>Pengguna wajib memberikan informasi yang benar, akurat, dan lengkap saat pendaftaran. Setiap akun bersifat pribadi dan tidak dapat dialihkan. Pengguna bertanggung jawab penuh atas keamanan kredensial akun mereka.</p>
            <p className="mt-sm">Penjual yang mendaftar wajib melalui proses verifikasi dokumen oleh Admin. Al-Mubarok II berhak menolak atau menangguhkan pendaftaran tanpa pemberitahuan terlebih dahulu.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">4. Transaksi</h2>
            <p>Pembayaran dilakukan melalui QRIS atau transfer bank ke rekening resmi Al-Mubarok II. Pembayaran akan dikonfirmasi secara manual oleh tim administrasi. Pesanan diproses setelah pembayaran dikonfirmasi.</p>
            <p className="mt-sm">Penjual wajib memastikan produk/jasa yang ditawarkan sesuai dengan deskripsi. Al-Mubarok II tidak bertanggung jawab atas sengketa kualitas produk antara Pembeli dan Penjual.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">5. Komisi</h2>
            <p>Platform menerapkan sistem komisi atas setiap transaksi yang berhasil. Besaran komisi ditentukan berdasarkan aturan yang berlaku (global, kategori, atau khusus penjual) dan dapat berubah sewaktu-waktu dengan pemberitahuan terlebih dahulu.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">6. Larangan</h2>
            <p>Pengguna dilarang untuk:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li>Menyalahgunakan fitur Platform untuk aktivitas ilegal</li>
              <li>Menawarkan produk/jasa yang melanggar hukum</li>
              <li>Memalsukan identitas atau dokumen</li>
              <li>Melakukan manipulasi transaksi atau data</li>
              <li>Mengakses sistem tanpa otorisasi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">7. Penghentian Akun</h2>
            <p>Al-Mubarok II berhak menangguhkan atau menghentikan akun Pengguna yang melanggar ketentuan ini tanpa pemberitahuan. Pengguna yang dihentikan tidak berhak atas klaim apa pun terhadap Platform.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">8. Perubahan Ketentuan</h2>
            <p>Ketentuan layanan ini dapat diubah sewaktu-waktu. Perubahan akan diumumkan melalui Platform. Pengguna yang tetap menggunakan Platform setelah perubahan dianggap menyetujui ketentuan yang telah diperbarui.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">9. Kontak</h2>
            <p>Untuk pertanyaan terkait ketentuan layanan ini, hubungi kami melalui:</p>
            <div className="flex items-center gap-2 mt-sm text-primary">
              <Mail className="w-5 h-5" />
              <a href="mailto:support@m2acobiz.com" className="hover:underline">support@m2acobiz.com</a>
            </div>
          </section>
        </div>

        <div className="mt-xxl pt-xl border-t border-outline-variant/30">
          <p className="text-label-sm text-on-surface-variant">Terakhir diperbarui: Juli 2026</p>
          <Link href="/register" className="inline-block mt-md text-label-md text-primary font-bold hover:underline">
            Kembali ke Pendaftaran
          </Link>
        </div>
      </div>
    </div>
  )
}
