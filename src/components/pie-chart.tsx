"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const COLORS = ["#22C55E", "#F59E0B", "#004343", "#D9A441", "#EF4444", "#3B82F6"]

interface RevenuePieChartProps {
  data: { name: string; value: number }[]
  title?: string
}

export function RevenuePieChart({ data, title }: RevenuePieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
        <p className="text-body-md">{title ? `Belum ada data ${title.toLowerCase()}` : "Belum ada data"}</p>
      </div>
    )
  }

  return (
    <div>
      {title && <h3 className="text-headline-md text-on-surface font-bold mb-lg">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `Rp${v.toLocaleString("id-ID")}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
