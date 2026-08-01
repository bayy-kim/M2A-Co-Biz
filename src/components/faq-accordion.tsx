"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { faqCategories } from "@/data/faq"

export function FaqSection() {
  const [query, setQuery] = useState("")
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const q = query.trim().toLowerCase()

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      items: q
        ? cat.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q))
        : cat.items,
    }))
    .filter((cat) => cat.items.length > 0)

  const totalQuestions = faqCategories.reduce((s, c) => s + c.items.length, 0)

  return (
    <section className="py-4xl" id="faq" style={{ background: "var(--color-clay-bg)" }}>
      <div className="container mx-auto px-margin">
        <div className="max-w-3xl mx-auto text-center mb-xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ background: "var(--color-primary-container)", color: "var(--color-primary)" }}>
            Pertanyaan yang Sering Diajukan
          </span>
          <h2 className="text-display-md-mobile sm:text-display-md lg:text-headline-lg font-extrabold mt-4 mb-2" style={{ color: "var(--color-primary)" }}>
            Ada Pertanyaan? Kami Jawab.
          </h2>
          <p className="text-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
            Rangkuman lengkap seputar belanja, menjual, komisi, keamanan, dan bantuan — {totalQuestions} pertanyaan.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-xxl">
          <div className="clay-pill flex items-center px-4 py-2" style={{ boxShadow: "var(--shadow-clay-md)" }}>
            <Search className="w-5 h-5 shrink-0" style={{ color: "var(--color-on-surface-variant)" }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari pertanyaan, misal 'komisi' atau 'pencairan'..."
              className="w-full bg-transparent border-none outline-none px-3 py-2 text-body-md font-inter"
              style={{ color: "var(--color-on-surface)" }}
              aria-label="Cari pertanyaan"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-xxl">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-xxl">
              <p className="text-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
                Tidak ada pertanyaan yang cocok dengan &ldquo;{query}&rdquo;. Coba kata kunci lain.
              </p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.title}>
                <h3 className="text-headline-md font-extrabold mb-lg" style={{ color: "var(--color-primary)" }}>
                  {cat.title}
                </h3>
                <div className="space-y-md">
                  {cat.items.map((item) => {
                    const key = `${cat.title}:${item.q}`
                    const isOpen = openItems.has(key)
                    return (
                      <div key={key} className="clay overflow-hidden" style={{ borderRadius: "var(--radius-clay)" }}>
                        <h4 className="m-0">
                          <button
                            type="button"
                            onClick={() => toggle(key)}
                            aria-expanded={isOpen}
                            aria-controls={`faq-panel-${key.replace(/\s+/g, "-")}`}
                            className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 font-bold text-sm md:text-body-md"
                            style={{ color: "var(--color-on-surface)", background: "transparent", border: "none", cursor: "pointer" }}
                          >
                            <span>{item.q}</span>
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 motion-safe:transition-transform"
                              style={{ background: isOpen ? "var(--color-primary)" : "var(--color-primary-container)", color: isOpen ? "var(--color-on-primary)" : "var(--color-primary)", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                              aria-hidden="true"
                            >
                              <Plus className="w-4 h-4" />
                            </span>
                          </button>
                        </h4>
                        <div
                          id={`faq-panel-${key.replace(/\s+/g, "-")}`}
                          role="region"
                          className="grid transition-[grid-template-rows] duration-300 ease-out motion-safe:transition-[grid-template-rows]"
                          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                        >
                          <div className="overflow-hidden">
                            <p className="px-5 pb-5 text-body-md leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                              {item.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="max-w-3xl mx-auto mt-xxl">
          <div className="clay-lg p-lg md:p-xl text-center">
            <p className="text-body-md font-semibold" style={{ color: "var(--color-primary)" }}>
              Masih bingung?
            </p>
            <p className="text-label-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
              Tim kami siap membantu lewat WhatsApp atau email.
            </p>
            <a
              href="#location"
              className="btn-clay text-sm mt-4 inline-flex"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
