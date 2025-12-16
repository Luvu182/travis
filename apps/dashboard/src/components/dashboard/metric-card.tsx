import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
  className?: string;
}

export const MetricCard = React.memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  isLoading,
  className,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
        <div className="flex items-center justify-between pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        </div>
        <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
      {trend && (
        <p
          className={cn(
            'text-xs mt-1',
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          )}
        >
          {trend.isPositive ? '+' : ''}{trend.value}%
        </p>
      )}
    </div>
  );
});
