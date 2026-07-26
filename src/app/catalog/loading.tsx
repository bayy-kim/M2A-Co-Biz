import { Search } from "lucide-react"

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
}

export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-gutter py-lg max-w-6xl mx-auto">
        <div className="flex items-center gap-md mb-lg">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="relative w-full max-w-md mb-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex gap-sm mb-lg overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md md:gap-gutter">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/20">
              <Skeleton className="h-36 sm:h-44 rounded-none" />
              <div className="p-md sm:p-lg space-y-sm">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between items-center pt-sm">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-16 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
