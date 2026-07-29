"use client"

import dynamic from "next/dynamic"

export const TrendChart = dynamic(() => import("./line-chart").then(m => ({ default: m.TrendChart })), { ssr: false })
export const FinanceBarChart = dynamic(() => import("./bar-chart").then(m => ({ default: m.FinanceBarChart })), { ssr: false })
export const RevenuePieChart = dynamic(() => import("./pie-chart").then(m => ({ default: m.RevenuePieChart })), { ssr: false })
