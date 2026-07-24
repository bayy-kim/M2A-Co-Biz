"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BarChartProps {
  data: { label: string; revenue: number; commission: number }[]
}

export function FinanceBarChart({ data }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
        <p className="text-body-md">Belum ada data keuangan</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e2" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6f7978" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6f7978" }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
        <Bar dataKey="commission" fill="#F59E0B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
