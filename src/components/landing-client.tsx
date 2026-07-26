"use client"

import { TrendingUp, ShieldCheck, Zap, Users, BarChart3, MapPin, Phone, Mail, ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { AnimateSection, AnimateStagger, AnimateItem, AnimateTap, AnimateFloat, AnimateCard } from "@/components/animate-section"
import { Logo } from "@/components/logo"
import { PublicHeader } from "@/components/public-header"

interface LandingClientProps {
  session: {
    user?: {
      role?: string
    }
  } | null
  company: {
    whatsappNumber?: string | null
    bankAccountName?: string | null
    bankName?: string | null
  } | null
}

export function LandingClient({ session, company }: LandingClientProps) {
  const whatsappNumber = company?.whatsappNumber
  const getDashboardHref = () => {
    if (!session?.user?.role) return "/login"
    const role = session.user.role
    if (role === "ADMIN") return "/admin"
    if (role === "BENDAHARA") return "/bendahara"
    if (role === "KETUA") return "/ketua"
    if (role === "SELLER") return "/seller"
    if (role === "BUYER") return "/pesanan-saya"
    return "/catalog"
  }

  return (
    <>
      <PublicHeader session={session} />

      <main>
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          <div className="container mx-auto px-margin relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-4xl items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-xl max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container text-[10px] uppercase tracking-[0.15em] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Ekonomi Komunitas
              </div>
              <h1 className="text-display-lg text-primary tracking-tight leading-tight">
                Pusat Bisnis & UMKM <br /> <span className="text-accent-gold">Al-Mubarok II</span>
              </h1>
              <p className="text-body-lg text-on-surface-variant leading-relaxed max-w-xl">
                Memberdayakan potensi ekonomi lokal melalui ekosistem bisnis digital yang terintegrasi. Wadah bagi wirausaha muda untuk bertumbuh dan berinovasi di Banjarwaringin.
              </p>
              <div className="flex flex-wrap gap-md pt-md">
                <Link
                  href="/catalog"
                  className="group px-xxl py-4 bg-primary text-on-primary rounded-xl text-headline-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-3"
                >
                  Jelajahi Produk
                  <span className="w-7 h-7 rounded-full bg-on-primary/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:scale-105 transition-transform duration-300">
                    <ArrowRight className="w-4 h-4 text-on-primary" />
                  </span>
                </Link>
                <Link
                  href="/register"
                  className="group px-xxl py-4 border-2 border-primary text-primary rounded-xl text-headline-md hover:bg-primary/5 active:scale-[0.98] transition-all duration-300 flex items-center gap-3"
                >
                  Mulai Berjualan
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl z-20 border-4 border-surface bg-surface-container-high group">
                <img 
                  src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80" 
                  alt="Wirausaha UMKM M2A Co-Biz" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-60" />
              </div>
              <AnimateFloat className="absolute -bottom-6 -left-6 bg-surface/90 backdrop-blur-md p-xl rounded-2xl shadow-xl z-30 max-w-xs border border-white/30">
                <div className="flex items-center gap-lg">
                  <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center text-accent-gold shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-on-surface font-bold text-label-md">50+ UMKM Binaan</p>
                    <p className="text-label-sm text-on-surface-variant">Tumbuh Bersama Kami</p>
                  </div>
                </div>
              </AnimateFloat>
            </motion.div>
          </div>
        </section>

        <AnimateSection>
          <section className="py-4xl bg-surface-container-low" id="products">
            <div className="container mx-auto px-margin">
              <div className="text-center max-w-3xl mx-auto mb-4xl">
                <h2 className="text-display-md text-primary mb-md">Produk Unggulan Kami</h2>
                <p className="text-body-md text-on-surface-variant">
                  Koleksi pilihan dari para pelaku UMKM binaan Al-Mubarok II, mulai dari kerajinan tangan hingga kuliner khas daerah.
                </p>
              </div>
              <div className="text-center">
                <Link
                  href="/catalog"
                  className="group inline-flex items-center gap-3 px-xxl py-4 bg-primary text-on-primary rounded-xl text-headline-md shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Lihat Semua Produk di Katalog
                  <span className="w-7 h-7 rounded-full bg-on-primary/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:scale-105 transition-transform duration-300">
                    <ArrowRight className="w-4 h-4 text-on-primary" />
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </AnimateSection>

        <AnimateSection>
          <section className="py-4xl bg-background overflow-hidden" id="about">
            <div className="container mx-auto px-margin">
              <div className="flex flex-col lg:flex-row gap-4xl items-center">
                <div className="lg:w-1/2 relative">
                  <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-surface bg-surface-container-high aspect-[4/3] group">
                    <img 
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                      alt="Komunitas Al-Mubarok II Banjarwaringin" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent opacity-40" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-gold/10 rounded-full blur-2xl" />
                </div>
                <div className="lg:w-1/2 space-y-xl">
                  <span className="inline-flex px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold text-[10px] uppercase tracking-[0.15em] font-medium">Misi Kami</span>
                  <h2 className="text-display-md text-primary">Memberdayakan UMKM, Membangun Kemandirian</h2>
                  <p className="text-body-lg text-on-surface-variant leading-relaxed">
                    M2A Co-Biz merupakan inisiatif strategis dari organisasi kepemudaan Al-Mubarok II untuk menjawab tantangan ekonomi digital bagi pelaku usaha lokal di Banjarwaringin.
                  </p>
                  <AnimateStagger className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                    {[
                      { icon: ShieldCheck, title: "Legalitas Terjamin", desc: "Pendampingan perizinan dan sertifikasi produk." },
                      { icon: Zap, title: "Akses Pasar", desc: "Menghubungkan UMKM ke pasar nasional." },
                      { icon: Users, title: "Komunitas Support", desc: "Networking sesama pelaku usaha muda." },
                      { icon: BarChart3, title: "Pelatihan Intensif", desc: "Digital marketing & pengelolaan keuangan." },
                    ].map((item) => (
                      <AnimateItem key={item.title}>
                        <div className="p-[1px] rounded-[1rem] bg-gradient-to-b from-outline-variant/40 to-transparent">
                          <AnimateCard className="flex gap-md p-lg rounded-[calc(1rem-1px)] bg-surface-container-lowest/95">
                            <div className="flex-shrink-0 w-11 h-11 rounded-[0.75rem] bg-primary/10 flex items-center justify-center text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-on-surface text-label-md">{item.title}</h5>
                              <p className="text-label-sm text-on-surface-variant">{item.desc}</p>
                            </div>
                          </AnimateCard>
                        </div>
                      </AnimateItem>
                    ))}
                  </AnimateStagger>
                </div>
              </div>
            </div>
          </section>
        </AnimateSection>

        <AnimateSection>
          <section className="py-4xl bg-surface-container" id="location">
            <div className="container mx-auto px-margin">
              <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-xl flex flex-col lg:flex-row ring-1 ring-outline-variant/20">
                <div className="lg:w-1/3 p-xxl space-y-xl bg-primary text-on-primary">
                  <h2 className="text-display-md">Kunjungi Kami</h2>
                  <p className="text-on-primary/80">
                    Kami terbuka untuk kolaborasi dan kunjungan langsung bagi Anda yang ingin melihat proses produksi UMKM kami.
                  </p>
                  <div className="space-y-lg pt-xl">
                    <div className="flex items-start gap-lg">
                      <MapPin className="w-6 h-6 text-accent-gold flex-shrink-0" />
                      <div>
                        <p className="font-bold">Alamat Pusat</p>
                        <p className="text-on-primary/70">Banjarwaringin, Salopa, Tasikmalaya, Jawa Barat</p>
                      </div>
                    </div>
                    {whatsappNumber && (
                      <div className="flex items-start gap-lg">
                        <Phone className="w-6 h-6 text-accent-gold flex-shrink-0" />
                        <div>
                          <p className="font-bold">Telepon</p>
                          <p className="text-on-primary/70">{whatsappNumber}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-lg">
                      <Mail className="w-6 h-6 text-accent-gold flex-shrink-0" />
                      <div>
                        <p className="font-bold">Email</p>
                        <p className="text-on-primary/70">info@m2acobiz.com</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:w-2/3 h-[400px] lg:h-auto min-h-[400px]">
                  <iframe
                    src="https://www.google.com/maps?q=-7.5064759,108.2390261&output=embed"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Alamat M2A Co-Biz"
                  />
                </div>
              </div>
            </div>
          </section>
        </AnimateSection>

        <AnimateSection>
          <section className="py-5xl relative overflow-hidden bg-primary my-4xl rounded-[2.5rem] mx-4 sm:mx-8 md:mx-12 shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,164,65,0.15),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(144,210,209,0.1),transparent_60%)] pointer-events-none" />
            
            <div className="container mx-auto px-margin relative z-10 text-center text-on-primary">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-xl">
                <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent-gold">
                  Mulai Langkah Pertama
                </span>
              </div>

              <h2 className="text-display-lg md:text-[2.75rem] font-bold mb-xl max-w-3xl mx-auto leading-[1.15] tracking-tight">
                Siap Membangun Masa Depan Bisnis Anda?
              </h2>

              <p className="text-body-lg text-on-primary/80 mb-4xl max-w-xl mx-auto leading-relaxed">
                Bergabunglah dengan puluhan wirausaha muda lainnya dan nikmati fasilitas ekosistem M2A Co-Biz untuk meningkatkan skala bisnis Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-lg justify-center items-center">
                <Link
                  href="/register"
                  className="p-[1px] rounded-xl bg-gradient-to-b from-accent-gold to-accent-gold/50 shadow-lg shadow-accent-gold/20 hover:scale-105 active:scale-[0.98] transition-all duration-300 group"
                >
                  <span className="px-xxl py-4 bg-accent-gold text-on-primary-fixed font-bold rounded-[calc(0.75rem-1px)] inline-flex items-center gap-3">
                    Daftar sebagai UMKM
                    <span className="w-7 h-7 rounded-full bg-on-primary-fixed/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                      <ArrowRight className="w-4 h-4 text-on-primary-fixed" />
                    </span>
                  </span>
                </Link>

                <Link
                  href={whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : "/catalog"}
                  className="px-xxl py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 active:scale-[0.98] transition-all duration-300"
                >
                  Konsultasi Bisnis
                </Link>
              </div>
            </div>
          </section>
        </AnimateSection>
      </main>

      <footer className="bg-surface py-xl border-t border-outline-variant">
        <div className="container mx-auto px-margin">
          <div className="flex flex-col md:flex-row justify-between items-center gap-xl">
            <div className="space-y-sm text-center md:text-left">
              <h3 className="text-headline-md font-bold text-primary">M2A Co-Biz</h3>
              <p className="text-label-md text-on-surface-variant">
                &copy; {new Date().getFullYear()} Al-Mubarok II. Hak cipta dilindungi.
              </p>
            </div>
            <div className="flex gap-xxl">
              {whatsappNumber ? (
                <a className="text-on-surface-variant hover:text-primary transition-colors" href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              ) : (
                <span className="text-on-surface-variant/50">WhatsApp</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
