'use client';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className = '' }: TypingIndicatorProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span
        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
}
