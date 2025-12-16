export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-32 rounded bg-muted" />

      {/* Settings Sections Skeleton */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
          <div className="space-y-3 pt-2">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-48 rounded bg-muted" />
                </div>
                <div className="h-6 w-12 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save Button Skeleton */}
      <div className="flex justify-end">
        <div className="h-10 w-24 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
