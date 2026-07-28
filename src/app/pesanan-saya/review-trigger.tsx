"use client"

import { useState } from "react"
import { Star, MessageSquare } from "lucide-react"
import { ReviewModal } from "./review-modal"

export function ReviewTrigger({
  orderId,
  productId,
  productTitle,
  hasReview,
}: {
  orderId: string
  productId: string
  productTitle: string
  hasReview: boolean
}) {
  const [open, setOpen] = useState(false)

  if (hasReview) {
    return (
      <div className="flex items-center gap-1.5 text-label-xs font-bold text-success bg-success/10 px-md py-1.5 rounded-full whitespace-nowrap">
        <Star className="w-3.5 h-3.5 fill-success text-success" />
        Sudah Diulas
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        type="button"
        className="flex items-center gap-1.5 px-md py-1.5 rounded-full bg-accent-gold text-white text-label-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer min-h-[36px] whitespace-nowrap"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Beri Ulasan
      </button>

      {open && (
        <ReviewModal
          orderId={orderId}
          productId={productId}
          productTitle={productTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
