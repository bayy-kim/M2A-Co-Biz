function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
}

export default function KetuaLoading() {
  return (
    <div className="p-gutter space-y-xl">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20 space-y-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
          <Skeleton className="h-6 w-40 mb-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-xl border border-outline-variant/20">
          <Skeleton className="h-6 w-40 mb-lg" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-md py-md border-b border-outline-variant/10">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="flex-1 space-y-sm">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
