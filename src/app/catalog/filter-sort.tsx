"use client"

import { useState } from "react"
import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Props {
  sortParam: string
  minPrice?: number
  maxPrice?: number
  query: string
  categoryFilter: string
}

export function CatalogFilterSort({ sortParam, minPrice, maxPrice, query, categoryFilter }: Props) {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const [localMin, setLocalMin] = useState(minPrice?.toString() || "")
  const [localMax, setLocalMax] = useState(maxPrice?.toString() || "")

  const applySort = (sort: string) => {
    const qs = new URLSearchParams()
    if (query) qs.set("q", query)
    if (categoryFilter) qs.set("category", categoryFilter)
    if (sort !== "newest") qs.set("sort", sort)
    if (minPrice) qs.set("minPrice", String(minPrice))
    if (maxPrice) qs.set("maxPrice", String(maxPrice))
    router.push(`/catalog?${qs.toString()}`)
  }

  const applyPriceFilter = () => {
    const qs = new URLSearchParams()
    if (query) qs.set("q", query)
    if (categoryFilter) qs.set("category", categoryFilter)
    if (sortParam !== "newest") qs.set("sort", sortParam)
    if (localMin) qs.set("minPrice", localMin)
    if (localMax) qs.set("maxPrice", localMax)
    router.push(`/catalog?${qs.toString()}`)
  }

  const clearFilter = () => {
    const qs = new URLSearchParams()
    if (query) qs.set("q", query)
    if (categoryFilter) qs.set("category", categoryFilter)
    if (sortParam !== "newest") qs.set("sort", sortParam)
    router.push(`/catalog?${qs.toString()}`)
  }

  return (
    <div className="flex items-center gap-sm relative">
      <div className="relative">
        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-xs px-md py-2 bg-surface-container border border-outline-variant rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <SlidersHorizontal className="w-[18px] h-[18px]" />
          Filter
          {(minPrice || maxPrice) && <span className="w-2 h-2 rounded-full bg-primary" />}
        </button>
        {showFilter && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-xl w-72">
            <div className="flex items-center justify-between mb-md">
              <p className="text-label-md font-bold text-on-surface">Price Range</p>
              <button onClick={() => setShowFilter(false)} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-md">
              <input type="number" placeholder="Min" value={localMin} onChange={(e) => setLocalMin(e.target.value)} className="w-full rounded-lg border border-outline-variant px-md py-2 text-label-md bg-surface text-on-surface focus:ring-2 focus:ring-primary/20" />
              <span className="text-on-surface-variant">-</span>
              <input type="number" placeholder="Max" value={localMax} onChange={(e) => setLocalMax(e.target.value)} className="w-full rounded-lg border border-outline-variant px-md py-2 text-label-md bg-surface text-on-surface focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="flex gap-2">
              <button onClick={applyPriceFilter} className="flex-1 px-md py-2 bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 transition-opacity">Apply</button>
              {(minPrice || maxPrice) && <button onClick={clearFilter} className="px-md py-2 border border-outline-variant rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">Clear</button>}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <select
          value={sortParam}
          onChange={(e) => applySort(e.target.value)}
          className="flex items-center gap-xs px-md py-2 bg-surface-container border border-outline-variant rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors appearance-none cursor-pointer pr-8"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none text-on-surface-variant" />
      </div>
    </div>
  )
}
