"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TrendChartProps {
  data: { label: string; value: number }[]
  color?: string
}

export function TrendChart({ data, color = "#004343" }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
        <p className="text-body-md">Belum ada data tren</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e2" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6f7978" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#6f7978" }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
