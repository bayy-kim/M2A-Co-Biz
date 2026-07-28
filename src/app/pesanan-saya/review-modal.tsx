"use client"

import { useState } from "react"
import { submitReview } from "./actions"
import { Star, MessageSquare, X, Loader2 } from "lucide-react"

export function ReviewModal({
  orderId,
  productId,
  productTitle,
  onClose,
}: {
  orderId: string
  productId: string
  productTitle: string
  onClose: () => void
}) {
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPending(true)

    const fd = new FormData()
    fd.set("orderId", orderId)
    fd.set("productId", productId)
    fd.set("rating", String(rating))
    fd.set("comment", comment)

    const res = await submitReview(fd)
    setPending(false)

    if (res?.error) {
      setError(res.error)
    } else if (res?.success) {
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-gutter bg-black/60 backdrop-blur-xs animate-slide-in">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-lg md:p-xl max-w-md w-full relative shadow-2xl space-y-lg">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all min-h-[44px]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-xs pt-4">
          <h3 className="text-headline-lg font-bold text-primary flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-accent-gold fill-accent-gold" />
            Beri Ulasan Produk
          </h3>
          <p className="text-label-sm text-on-surface-variant line-clamp-1">{productTitle}</p>
        </div>

        {error && (
          <div className="p-md bg-error-container text-on-error-container rounded-lg text-label-sm">{error}</div>
        )}

        {success ? (
          <div className="py-xl text-center space-y-md">
            <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center text-success mx-auto">
              <Star className="w-6 h-6 fill-success" />
            </div>
            <p className="text-label-md font-bold text-success">Ulasan berhasil terkirim!</p>
          </div>
        ) : (
          <form onSubmit={handleActionSubmit} className="space-y-lg">
            <div className="flex flex-col items-center gap-xs">
              <label className="text-label-md text-on-surface font-bold">Bintang Rating</label>
              <div className="flex items-center gap-sm">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-2 transition-transform active:scale-95 shrink-0"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? "text-accent-gold fill-accent-gold" 
                          : "text-outline-variant/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface" htmlFor="comment">Komentar / Ulasan</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan ulasan jujur Anda tentang produk/jasa dari UMKM ini..."
                className="w-full p-md rounded-xl border border-outline-variant bg-surface text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                rows={3}
              />
            </div>

            <button
              disabled={pending}
              type="submit"
              className="w-full py-3.5 bg-primary text-on-primary rounded-xl text-label-md font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              {pending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              {pending ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
