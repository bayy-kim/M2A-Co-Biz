"use client"

import { useTransition } from "react"
import { updateFulfillmentStatus } from "./actions"
import { PackageCheck, Truck, CheckCircle2, Loader2 } from "lucide-react"
import type { FulfillmentStatus } from "@prisma/client"

interface Props {
  orderId: string
  currentStatus: FulfillmentStatus
}

export function FulfillmentStatusAction({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleUpdate = (status: FulfillmentStatus) => {
    startTransition(async () => {
      await updateFulfillmentStatus(orderId, status)
    })
  }

  if (currentStatus === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-bold bg-success/10 text-success" title="Selesai">
        <CheckCircle2 className="w-4 h-4" />
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <>
          {currentStatus === "PENDING" && (
            <button
              onClick={() => handleUpdate("PROCESSING")}
              className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Tandai Diproses"
              type="button"
            >
              <PackageCheck className="w-4 h-4" />
            </button>
          )}

          {(currentStatus === "PENDING" || currentStatus === "PROCESSING") && (
            <button
              onClick={() => handleUpdate("IN_TRANSIT")}
              className="p-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Tandai Dikirim / Dikerjakan"
              type="button"
            >
              <Truck className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => handleUpdate("COMPLETED")}
            className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Tandai Selesai"
            type="button"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
