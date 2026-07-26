function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
}

export default function PesananLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-gutter py-xl space-y-xl">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-xl space-y-md">
            <div className="flex justify-between items-start">
              <div className="space-y-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="border-t border-outline-variant/10 pt-md space-y-sm">
              <div className="flex items-center gap-md">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-sm">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="border-t border-outline-variant/10 pt-md flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
