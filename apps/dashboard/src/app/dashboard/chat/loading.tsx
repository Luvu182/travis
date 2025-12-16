import { Loader2 } from 'lucide-react';

export default function ChatLoading() {
  return (
    <div className="flex h-full min-h-[500px]">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r bg-card p-4 space-y-4 animate-pulse">
        <div className="h-10 rounded-lg bg-muted" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted" />
          ))}
        </div>
      </div>

      {/* Chat Area Skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <div className="p-4 border-t animate-pulse">
          <div className="h-12 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
