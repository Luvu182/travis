export default function ConversationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted" />

      {/* Filters Skeleton */}
      <div className="flex gap-4">
        <div className="h-10 w-32 rounded-lg bg-muted" />
        <div className="h-10 w-48 rounded-lg bg-muted" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="h-12 bg-muted/50" />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 border-t flex items-center px-4 gap-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 flex-1 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded bg-muted" />
          <div className="h-9 w-9 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
