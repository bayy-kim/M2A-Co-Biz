function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
}

export default function SellerLoading() {
  return (
    <div className="p-gutter space-y-xl">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 space-y-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="flex gap-sm">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-lg" />
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-xl">
        <Skeleton className="h-6 w-40 mb-lg" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-md py-md border-b border-outline-variant/10">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-sm">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
