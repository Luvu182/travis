import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'lime' | 'purple' | 'blue' | 'orange';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-gray-100 text-gray-700',
        variant === 'lime' && 'bg-lime-100 text-lime-700',
        variant === 'purple' && 'bg-purple-100 text-purple-700',
        variant === 'blue' && 'bg-blue-100 text-blue-700',
        variant === 'orange' && 'bg-orange-100 text-orange-700',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
