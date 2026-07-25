import { ShieldCheck, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-gutter py-xxl">
        <div className="flex items-center gap-3 mb-xl">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-display-md text-primary font-bold">Kebijakan Privasi</h1>
        </div>

        <div className="space-y-lg text-body-md text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">1. Pendahuluan</h2>
            <p>Al-Mubarok II ("kami", "kita") berkomitmen untuk melindungi privasi Pengguna platform M2A Co-Biz. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) Republik Indonesia.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">2. Data yang Dikumpulkan</h2>
            <p>Kami mengumpulkan data berikut:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li><strong>Data identitas</strong>: nama lengkap, alamat email, nomor telepon</li>
              <li><strong>Data akun</strong>: kata sandi (dienkripsi), peran pengguna, preferensi</li>
              <li><strong>Data dokumen</strong>: KTP, Kartu Keluarga, izin usaha (khusus Penjual) — disimpan dalam bentuk terenkripsi</li>
              <li><strong>Data transaksi</strong>: riwayat pesanan, pembayaran, dan payout</li>
              <li><strong>Data teknis</strong>: alamat IP, jenis browser, perangkat yang digunakan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">3. Tujuan Pemrosesan Data</h2>
            <p>Data Anda digunakan untuk:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li>Menyediakan dan mengoperasikan Platform</li>
              <li>Memproses pendaftaran dan verifikasi Penjual</li>
              <li>Memproses transaksi dan pembayaran</li>
              <li>Melakukan pencatatan aktivitas (audit log)</li>
              <li>Mematuhi kewajiban hukum dan peraturan</li>
              <li>Mengirimkan informasi terkait layanan (bukan untuk pemasaran tanpa izin)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">4. Dasar Hukum Pemrosesan</h2>
            <p>Kami memproses data pribadi Anda berdasarkan:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li>Persetujuan eksplisit yang Anda berikan saat pendaftaran</li>
              <li>Pelaksanaan perjanjian (ketentuan layanan) antara Anda dan Platform</li>
              <li>Kepatuhan terhadap kewajiban hukum yang berlaku</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">5. Penyimpanan & Keamanan Data</h2>
            <p>Data pribadi Anda disimpan di server yang aman dengan langkah-langkah keamanan berikut:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li>Dokumen KTP/KK dienkripsi menggunakan AES-256-GCM sebelum disimpan</li>
              <li>Kata sandi di-hash menggunakan bcrypt, tidak pernah disimpan dalam bentuk mentah</li>
              <li>Akses data dibatasi berdasarkan peran (RBAC) dan dicatat dalam audit log</li>
              <li>Sesi diautentikasi menggunakan JWT dengan 2FA untuk peran Admin dan Sekretaris</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">6. Retensi Data</h2>
            <p>Data pribadi Anda akan disimpan selama akun Anda aktif atau selama diperlukan untuk memenuhi tujuan pemrosesan. Data dokumen Penjual akan dihapus dalam waktu 90 hari setelah akun ditutup atau tidak lagi aktif, kecuali diwajibkan lain oleh hukum.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">7. Hak Anda</h2>
            <p>Sesuai UU PDP, Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li>Mengakses data pribadi yang kami miliki</li>
              <li>Memperbaiki data yang tidak akurat</li>
              <li>Menghapus data pribadi (dengan batasan tertentu)</li>
              <li>Membatasi pemrosesan data</li>
              <li>Menarik persetujuan pemrosesan data</li>
              <li>Mengajukan keberatan atas pemrosesan data</li>
            </ul>
            <p className="mt-sm">Untuk menggunakan hak-hak di atas, hubungi kami melalui kontak di bawah.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">8. Pengungkapan ke Pihak Ketiga</h2>
            <p>Kami tidak menjual data pribadi Anda. Data hanya dapat diungkapkan kepada:</p>
            <ul className="list-disc pl-xl space-y-sm">
              <li>Penyedia layanan hosting dan infrastruktur (Vercel, Neon PostgreSQL)</li>
              <li>Penyedia layanan penyimpanan file (Vercel Blob)</li>
              <li>Pihak berwenang jika diwajibkan oleh hukum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">9. Perubahan Kebijakan</h2>
            <p>Kebijakan privasi ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diumumkan melalui Platform. Kami mendorong Anda untuk meninjau kebijakan ini secara berkala.</p>
          </section>

          <section>
            <h2 className="text-headline-md text-on-surface font-bold mb-md">10. Kontak</h2>
            <p>Untuk pertanyaan, keluhan, atau permintaan terkait data pribadi Anda:</p>
            <div className="flex items-center gap-2 mt-sm text-primary">
              <Mail className="w-5 h-5" />
              <a href="mailto:privacy@m2acobiz.com" className="hover:underline">privacy@m2acobiz.com</a>
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
