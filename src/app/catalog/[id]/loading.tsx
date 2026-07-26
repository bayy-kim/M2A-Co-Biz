function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
}

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-gutter py-lg max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-lg">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl lg:gap-xxl">
          <div className="lg:col-span-7">
            <Skeleton className="aspect-[4/3] lg:aspect-square rounded-3xl" />
            <div className="flex gap-sm mt-md">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-xl">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="space-y-sm">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
