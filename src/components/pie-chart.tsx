"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#22C55E", "#F59E0B", "#004343"]

export function RevenuePieChart() {
  const data = [
    { name: "Seller Revenue", value: 0 },
    { name: "Commission", value: 0 },
  ]

  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-xl text-on-surface-variant">
        <p className="text-body-md">Belum ada data revenue</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}
