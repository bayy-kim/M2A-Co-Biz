"use client"

import { TrendingUp } from "lucide-react"

export function RevenueChart() {
  return (
    <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant rounded-xl border border-dashed border-outline-variant/50">
      <TrendingUp className="w-12 h-12 mb-md opacity-40" />
      <p className="text-body-md">Grafik akan tampil setelah ada data transaksi</p>
    </div>
  )
}
